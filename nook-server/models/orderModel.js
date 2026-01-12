/*
=======================================================================================================================================
ORDER MODEL - Database queries for orders
=======================================================================================================================================
This model handles all order-related database operations.

The order structure has 3 tables:
1. orders - Main order info (customer, fulfillment, total price)
2. order_buffets - Each buffet in the order (people count, dietary info, etc.)
3. order_items - Individual menu items selected for each buffet
=======================================================================================================================================
*/

const { query, getClient } = require('../database');

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
    // If paymentIntentId is provided, payment was already processed via Stripe
    const paymentStatus = orderData.paymentIntentId ? 'paid' : 'pending';

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
      paymentStatus,
      orderData.paymentIntentId ? 'stripe' : 'card', // Use 'stripe' when paid via Stripe
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
              order_buffet_id, menu_item_id, item_name, category_name, quantity, order_id
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `;

          const itemValues = [
            buffetId,
            itemId,
            itemDetails.rows[0].name,
            itemDetails.rows[0].category_name,
            1,
            orderId
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
                price_per_person, num_people, subtotal, order_id
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
              RETURNING id
            `;

            const upgradeValues = [
              buffetId,
              upgrade.id,
              upgrade.name,
              upgrade.price_per_person,
              buffet.numPeople,
              upgradeSubtotal,
              orderId
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
                    order_buffet_upgrade_id, upgrade_item_id, item_name, category_name, order_id
                  ) VALUES ($1, $2, $3, $4, $5)
                `;

                const itemValues = [
                  orderBuffetUpgradeId,
                  itemId,
                  itemDetails.rows[0].name,
                  itemDetails.rows[0].category_name,
                  orderId
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
 * Can filter by branch_id if provided
 *
 * Uses a single query with JSON_AGG to avoid N+1 query problems.
 * The nested structure (orders → buffets → items/upgrades → upgrade_items)
 * is built using correlated subqueries with JSON aggregation.
 *
 * @param {number|null} branchId - Optional branch ID to filter by (null = all branches)
 * @returns {array} All orders with complete details
 */
const getAllOrders = async (branchId = null) => {
  const params = [];
  let branchFilter = '';

  // If branchId is provided, add filter
  if (branchId !== null) {
    branchFilter = 'AND o.branch_id = $1';
    params.push(branchId);
  }

  // Single query that builds the entire nested structure using JSON_AGG
  const ordersSQL = `
    SELECT
      o.id, o.order_number, o.customer_email, o.customer_phone,
      o.fulfillment_type, o.fulfillment_address, o.fulfillment_date, o.fulfillment_time,
      o.total_price, o.status, o.payment_status, o.payment_method, o.notes,
      o.created_at, o.updated_at, o.branch_id, b.name as branch_name,

      -- Aggregate all buffets for this order into a JSON array
      COALESCE(
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ob.id,
              'buffet_version_id', ob.buffet_version_id,
              'buffet_name', (SELECT bv.title FROM buffet_versions bv WHERE bv.id = ob.buffet_version_id),
              'num_people', ob.num_people,
              'price_per_person', ob.price_per_person,
              'subtotal', ob.subtotal,
              'dietary_info', ob.dietary_info,
              'allergens', ob.allergens,
              'notes', ob.notes,

              -- Nested: aggregate items for this buffet
              'items', COALESCE(
                (
                  SELECT JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', oi.id,
                      'menu_item_id', oi.menu_item_id,
                      'item_name', oi.item_name,
                      'category_name', oi.category_name,
                      'quantity', oi.quantity
                    )
                  )
                  FROM order_items oi
                  WHERE oi.order_buffet_id = ob.id
                ),
                '[]'::json
              ),

              -- Nested: aggregate upgrades for this buffet (with their items)
              'upgrades', COALESCE(
                (
                  SELECT JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', obu.id,
                      'upgrade_id', obu.upgrade_id,
                      'upgrade_name', obu.upgrade_name,
                      'price_per_person', obu.price_per_person,
                      'num_people', obu.num_people,
                      'subtotal', obu.subtotal,

                      -- Deeply nested: aggregate items for this upgrade
                      'selectedItems', COALESCE(
                        (
                          SELECT JSON_AGG(
                            JSON_BUILD_OBJECT(
                              'id', obui.id,
                              'upgrade_item_id', obui.upgrade_item_id,
                              'item_name', obui.item_name,
                              'category_name', obui.category_name
                            )
                          )
                          FROM order_buffet_upgrade_items obui
                          WHERE obui.order_buffet_upgrade_id = obu.id
                        ),
                        '[]'::json
                      )
                    )
                  )
                  FROM order_buffet_upgrades obu
                  WHERE obu.order_buffet_id = ob.id
                ),
                '[]'::json
              )
            )
          )
          FROM order_buffets ob
          WHERE ob.order_id = o.id
        ),
        '[]'::json
      ) as buffets

    FROM orders o
    LEFT JOIN branches b ON o.branch_id = b.id
    WHERE o.status NOT IN ('completed', 'cancelled') ${branchFilter}
    ORDER BY o.fulfillment_date ASC, o.created_at DESC
  `;

  const ordersResult = await query(ordersSQL, params);
  return ordersResult.rows;
};

// ===== UPDATE ORDER STATUS =====
/**
 * Updates the status of an order to 'completed'
 * This marks the order as done so it won't show in the admin portal
 *
 * @param {number} orderId - The ID of the order to update
 * @param {string} status - The new status value
 * @returns {object} The updated order
 */
const updateOrderStatus = async (orderId, status) => {
  const updateSQL = `
    UPDATE orders
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, order_number, customer_email, customer_phone,
              fulfillment_type, fulfillment_address, fulfillment_date, fulfillment_time,
              total_price, status, updated_at
  `;

  const result = await query(updateSQL, [status, orderId]);

  if (result.rows.length === 0) {
    throw new Error('Order not found');
  }

  return result.rows[0];
};

// ===== GET SINGLE ORDER BY ID =====
/**
 * Gets a single order with all its buffets and items by ID
 * Uses the same JSON aggregation pattern as getAllOrders
 *
 * @param {number} orderId - The ID of the order to get
 * @returns {object|null} The order with complete details, or null if not found
 */
const getOrderById = async (orderId) => {
  const orderSQL = `
    SELECT
      o.id, o.order_number, o.customer_email, o.customer_phone,
      o.fulfillment_type, o.fulfillment_address, o.fulfillment_date, o.fulfillment_time,
      o.total_price, o.status, o.payment_status, o.payment_method, o.notes,
      o.created_at, o.updated_at, o.branch_id, b.name as branch_name,

      -- Aggregate all buffets for this order into a JSON array
      COALESCE(
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ob.id,
              'buffet_version_id', ob.buffet_version_id,
              'buffet_name', (SELECT bv.title FROM buffet_versions bv WHERE bv.id = ob.buffet_version_id),
              'num_people', ob.num_people,
              'price_per_person', ob.price_per_person,
              'subtotal', ob.subtotal,
              'dietary_info', ob.dietary_info,
              'allergens', ob.allergens,
              'notes', ob.notes,

              -- Nested: aggregate items for this buffet
              'items', COALESCE(
                (
                  SELECT JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', oi.id,
                      'menu_item_id', oi.menu_item_id,
                      'item_name', oi.item_name,
                      'category_name', oi.category_name,
                      'quantity', oi.quantity
                    )
                  )
                  FROM order_items oi
                  WHERE oi.order_buffet_id = ob.id
                ),
                '[]'::json
              ),

              -- Nested: aggregate upgrades for this buffet (with their items)
              'upgrades', COALESCE(
                (
                  SELECT JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', obu.id,
                      'upgrade_id', obu.upgrade_id,
                      'upgrade_name', obu.upgrade_name,
                      'price_per_person', obu.price_per_person,
                      'num_people', obu.num_people,
                      'subtotal', obu.subtotal,

                      -- Deeply nested: aggregate items for this upgrade
                      'selectedItems', COALESCE(
                        (
                          SELECT JSON_AGG(
                            JSON_BUILD_OBJECT(
                              'id', obui.id,
                              'upgrade_item_id', obui.upgrade_item_id,
                              'item_name', obui.item_name,
                              'category_name', obui.category_name
                            )
                          )
                          FROM order_buffet_upgrade_items obui
                          WHERE obui.order_buffet_upgrade_id = obu.id
                        ),
                        '[]'::json
                      )
                    )
                  )
                  FROM order_buffet_upgrades obu
                  WHERE obu.order_buffet_id = ob.id
                ),
                '[]'::json
              )
            )
          )
          FROM order_buffets ob
          WHERE ob.order_id = o.id
        ),
        '[]'::json
      ) as buffets

    FROM orders o
    LEFT JOIN branches b ON o.branch_id = b.id
    WHERE o.id = $1
  `;

  const result = await query(orderSQL, [orderId]);
  return result.rows[0] || null;
};

// Export the functions so other files can use them
module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};

