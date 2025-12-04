/*
=======================================================================================================================================
ORDER MODEL - Database queries for orders
=======================================================================================================================================
Models are like the "database talkers" - they know how to ask the database for information and save stuff.
This model handles all order-related database operations.

The order structure has 3 tables:
1. orders - Main order info (customer, fulfillment, total price)
2. order_buffets - Each buffet in the order (people count, dietary info, etc.)
3. order_items - Individual menu items selected for each buffet
=======================================================================================================================================
*/

const { getClient } = require('../database');

// ===== CREATE A NEW ORDER =====
/**
 * Creates a complete order with all buffets and items
 * This is a transaction - either everything saves or nothing does (keeps data consistent)
 * 
 * @param {object} orderData - The complete order data
 * @returns {object} The created order with its ID
 */
const createOrder = async (orderData) => {
  const client = await getClient();
  
  try {
    // Start a transaction - this means all queries must succeed or none will
    await client.query('BEGIN');

    // Generate a simple sequential order number (format: ORD-001, ORD-002, etc.)
    // Get the count of existing orders to determine the next number
    const countQuery = 'SELECT COUNT(*) as count FROM orders';
    const countResult = await client.query(countQuery);
    const orderCount = parseInt(countResult.rows[0].count) + 1;
    const orderNumber = `ORD-${orderCount.toString().padStart(3, '0')}`;
    
    // Insert the main order record
    const orderQuery = `
      INSERT INTO orders (
        order_number, customer_email, customer_phone,
        fulfillment_type, fulfillment_address, fulfillment_date, fulfillment_time,
        total_price, status, payment_status, payment_method, notes, branch_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, order_number, created_at
    `;

    const orderValues = [
      orderNumber,
      orderData.email,
      orderData.phone,
      orderData.fulfillmentType,
      orderData.address,
      orderData.deliveryDate || null,
      orderData.deliveryTime || null,
      orderData.totalPrice,
      'pending',
      'pending',
      'card', // For now, always card
      orderData.businessName || null,
      orderData.branchId || null  // Branch ID for delivery orders
    ];
    
    const orderResult = await client.query(orderQuery, orderValues);
    const orderId = orderResult.rows[0].id;
    
    // Now insert each buffet in the order
    for (const buffet of orderData.buffets) {
      const buffetQuery = `
        INSERT INTO order_buffets (
          order_id, buffet_version_id, num_people, 
          price_per_person, subtotal, dietary_info, allergens, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
      
      const buffetValues = [
        orderId,
        buffet.buffetVersionId,
        buffet.numPeople,
        buffet.pricePerPerson,
        buffet.totalPrice,
        buffet.dietaryInfo || null,
        buffet.allergens || null,
        buffet.notes || null
      ];
      
      const buffetResult = await client.query(buffetQuery, buffetValues);
      const buffetId = buffetResult.rows[0].id;
      
      // Now insert each menu item for this buffet
      for (const itemId of buffet.items) {
        // Get item details from menu_items table
        const itemDetailsQuery = `
          SELECT mi.name, c.name as category_name
          FROM menu_items mi
          JOIN categories c ON mi.category_id = c.id
          WHERE mi.id = $1
        `;
        const itemDetails = await client.query(itemDetailsQuery, [itemId]);

        if (itemDetails.rows.length > 0) {
          const itemQuery = `
            INSERT INTO order_items (
              order_buffet_id, menu_item_id, item_name, category_name, quantity
            ) VALUES ($1, $2, $3, $4, $5)
          `;

          const itemValues = [
            buffetId,
            itemId,
            itemDetails.rows[0].name,
            itemDetails.rows[0].category_name,
            1
          ];

          await client.query(itemQuery, itemValues);
        }
      }

      // Insert upgrades for this buffet (if any)
      // Each upgrade has: { upgradeId, selectedItems: [itemId1, itemId2, ...] }
      if (buffet.upgrades && buffet.upgrades.length > 0) {
        for (const upgradeData of buffet.upgrades) {
          const upgradeId = upgradeData.upgradeId;
          const selectedItems = upgradeData.selectedItems || [];

          // Get upgrade details
          const upgradeDetailsQuery = `
            SELECT id, name, price_per_person
            FROM upgrades
            WHERE id = $1 AND is_active = true
          `;
          const upgradeDetails = await client.query(upgradeDetailsQuery, [upgradeId]);

          if (upgradeDetails.rows.length > 0) {
            const upgrade = upgradeDetails.rows[0];
            const upgradeSubtotal = parseFloat(upgrade.price_per_person) * buffet.numPeople;

            const upgradeQuery = `
              INSERT INTO order_buffet_upgrades (
                order_buffet_id, upgrade_id, upgrade_name,
                price_per_person, num_people, subtotal
              ) VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING id
            `;

            const upgradeValues = [
              buffetId,
              upgrade.id,
              upgrade.name,
              upgrade.price_per_person,
              buffet.numPeople,
              upgradeSubtotal
            ];

            const upgradeResult = await client.query(upgradeQuery, upgradeValues);
            const orderBuffetUpgradeId = upgradeResult.rows[0].id;

            // Insert selected items for this upgrade
            for (const itemId of selectedItems) {
              const itemDetailsQuery = `
                SELECT ui.id, ui.name, uc.name as category_name
                FROM upgrade_items ui
                JOIN upgrade_categories uc ON ui.upgrade_category_id = uc.id
                WHERE ui.id = $1
              `;
              const itemDetails = await client.query(itemDetailsQuery, [itemId]);

              if (itemDetails.rows.length > 0) {
                const itemQuery = `
                  INSERT INTO order_buffet_upgrade_items (
                    order_buffet_upgrade_id, upgrade_item_id, item_name, category_name
                  ) VALUES ($1, $2, $3, $4)
                `;

                const itemValues = [
                  orderBuffetUpgradeId,
                  itemId,
                  itemDetails.rows[0].name,
                  itemDetails.rows[0].category_name
                ];

                await client.query(itemQuery, itemValues);
              }
            }
          }
        }
      }
    }
    
    // Commit the transaction - save everything
    await client.query('COMMIT');
    
    return orderResult.rows[0];
    
  } catch (error) {
    // If anything goes wrong, rollback - undo everything
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Always release the database connection back to the pool
    client.release();
  }
};

// ===== GET ALL ORDERS =====
/**
 * Gets all orders with all their buffets and items
 * This is for the admin portal to see all orders
 *
 * @returns {array} All orders with complete details
 */
const getAllOrders = async () => {
  const client = await getClient();

  try {
    // Get only pending orders (not completed) sorted by fulfillment date
    const ordersQuery = `
      SELECT
        id, order_number, customer_email, customer_phone,
        fulfillment_type, fulfillment_address, fulfillment_date, fulfillment_time,
        total_price, status, payment_status, payment_method, notes,
        created_at, updated_at
      FROM orders
      WHERE status != 'completed'
      ORDER BY fulfillment_date ASC, created_at DESC
    `;

    const ordersResult = await client.query(ordersQuery);
    const orders = ordersResult.rows;

    // For each order, get its buffets
    for (const order of orders) {
      const buffetsQuery = `
        SELECT
          id, buffet_version_id, num_people, price_per_person, subtotal,
          dietary_info, allergens, notes
        FROM order_buffets
        WHERE order_id = $1
      `;

      const buffetsResult = await client.query(buffetsQuery, [order.id]);
      order.buffets = buffetsResult.rows;

      // For each buffet, get its items and upgrades
      for (const buffet of order.buffets) {
        const itemsQuery = `
          SELECT
            id, menu_item_id, item_name, category_name, quantity
          FROM order_items
          WHERE order_buffet_id = $1
        `;

        const itemsResult = await client.query(itemsQuery, [buffet.id]);
        buffet.items = itemsResult.rows;

        // Get upgrades for this buffet
        const upgradesQuery = `
          SELECT
            id, upgrade_id, upgrade_name, price_per_person, num_people, subtotal
          FROM order_buffet_upgrades
          WHERE order_buffet_id = $1
        `;

        const upgradesResult = await client.query(upgradesQuery, [buffet.id]);
        buffet.upgrades = upgradesResult.rows;

        // Get selected items for each upgrade
        for (const upgrade of buffet.upgrades) {
          const upgradeItemsQuery = `
            SELECT
              id, upgrade_item_id, item_name, category_name
            FROM order_buffet_upgrade_items
            WHERE order_buffet_upgrade_id = $1
          `;

          const upgradeItemsResult = await client.query(upgradeItemsQuery, [upgrade.id]);
          upgrade.selectedItems = upgradeItemsResult.rows;
        }
      }
    }

    return orders;

  } finally {
    client.release();
  }
};

// ===== UPDATE ORDER STATUS =====
/**
 * Updates the status of an order to 'completed'
 * This marks the order as done so it won't show in the admin portal
 *
 * @param {number} orderId - The ID of the order to update
 * @returns {object} The updated order
 */
const updateOrderStatus = async (orderId, status) => {
  const client = await getClient();

  try {
    const query = `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, order_number, status, updated_at
    `;

    const result = await client.query(query, [status, orderId]);

    if (result.rows.length === 0) {
      throw new Error('Order not found');
    }

    return result.rows[0];

  } finally {
    client.release();
  }
};

// Export the functions so other files can use them
module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus
};

