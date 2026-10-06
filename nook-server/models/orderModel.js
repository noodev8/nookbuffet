/*
=======================================================================================================================================
ORDER MODEL - Database queries for orders
=======================================================================================================================================
This model handles all order-related database operations.

The order structure has these tables:
1. orders - Main order info (customer, fulfillment, total price)
2. order_buffets - Each buffet in the order (people count, dietary info, etc.)
3. order_items - Individual menu items selected for each buffet
4. order_sandwiches - Each build-your-own sandwich in the order (quantity, price)
5. order_sandwich_options - What was picked for each sandwich
=======================================================================================================================================
*/

const { query, getClient } = require('../database');

// The sandwiches in an order as a JSON array, each with the options picked. Used by every
// query that returns orders, alongside the buffets.
const SANDWICHES_JSON = `
      COALESCE(
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', os.id,
              'quantity', os.quantity,
              'unit_price', os.unit_price,
              'subtotal', os.subtotal,
              'notes', os.notes,
              'options', COALESCE(
                (
                  SELECT JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'sandwich_option_id', oso.sandwich_option_id,
                      'step_name', oso.step_name,
                      'option_name', oso.option_name,
                      'extra_price', oso.extra_price
                    ) ORDER BY oso.position
                  )
                  FROM order_sandwich_options oso
                  WHERE oso.order_sandwich_id = os.id
                ),
                '[]'::json
              )
            ) ORDER BY os.id
          )
          FROM order_sandwiches os
          WHERE os.order_id = o.id
        ),
        '[]'::json
      ) as sandwiches`;

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

    // One new order at a time, so two orders can't both take the next order number or the
    // last place in a sandwich collection slot. The lock is released at COMMIT/ROLLBACK.
    await client.query(`SELECT pg_advisory_xact_lock(hashtext('new-order'))`);

    // Sandwich collection slots only take so many orders - check this one isn't full
    if ((orderData.sandwiches || []).length > 0 && orderData.slotCapacity) {
      const booked = await client.query(
        `SELECT COUNT(*)::int AS orders FROM orders o
         WHERE o.fulfillment_date = $1 AND o.fulfillment_time = $2 AND o.status <> 'cancelled'
           AND EXISTS (SELECT 1 FROM order_sandwiches os WHERE os.order_id = o.id)`,
        [orderData.fulfillmentDate, orderData.fulfillmentTime]
      );
      if (booked.rows[0].orders >= orderData.slotCapacity) {
        const error = new Error('That collection slot is full');
        error.code = 'SLOT_FULL';
        throw error;
      }
    }

    // Generate a sequential order number (format: ORD-001, ORD-002, etc.)
    // Use MAX of the numeric part so gaps from deletions never cause collisions
    const numQuery = `
      SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS INTEGER)), 0) + 1 AS next_num
      FROM orders
    `;
    const numResult = await client.query(numQuery);
    const nextNum = parseInt(numResult.rows[0].next_num);
    const orderNumber = `ORD-${nextNum.toString().padStart(3, '0')}`;
    
    // Insert the main order record
    // No payment is taken online - every order starts unpaid and staff mark it paid in the admin portal
    const orderQuery = `
      INSERT INTO orders (
        order_number, customer_email, customer_phone,
        fulfillment_type, fulfillment_address, fulfillment_date, fulfillment_time,
        total_price, status, payment_status, notes, customer_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, order_number, created_at
    `;

    const orderValues = [
      orderNumber,
      orderData.email,
      orderData.phone,
      orderData.fulfillmentType,
      orderData.address?.trim() || null, // sandwich-only orders don't ask for an address
      orderData.fulfillmentDate || null,
      orderData.fulfillmentTime || null,
      orderData.totalPrice,
      'pending',
      'unpaid',
      orderData.businessName || null,
      orderData.customerId || null
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
      
      // Now insert each menu item for this buffet - only items on this buffet's menu
      for (const itemId of buffet.items) {
        const itemDetailsQuery = `
          SELECT mi.name, c.name as category_name
          FROM menu_items mi
          JOIN categories c ON mi.category_id = c.id
          WHERE mi.id = $1 AND c.buffet_version_id = $2
        `;
        const itemDetails = await client.query(itemDetailsQuery, [itemId, buffet.buffetVersionId]);

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

      // Insert upgrades for this buffet (if any). These have already been checked and priced
      // by the controller (utils/buffetOrder.js): { upgradeId, name, pricePerPerson, subtotal, selectedItems }
      for (const upgrade of buffet.upgrades || []) {
        const upgradeResult = await client.query(
          `INSERT INTO order_buffet_upgrades (
             order_buffet_id, upgrade_id, upgrade_name,
             price_per_person, num_people, subtotal, order_id
           ) VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [buffetId, upgrade.upgradeId, upgrade.name, upgrade.pricePerPerson, buffet.numPeople, upgrade.subtotal, orderId]
        );
        const orderBuffetUpgradeId = upgradeResult.rows[0].id;

        // Insert the items picked for this upgrade - only items that belong to it
        for (const itemId of upgrade.selectedItems) {
          const itemDetails = await client.query(
            `SELECT ui.name, uc.name as category_name
             FROM upgrade_items ui
             JOIN upgrade_categories uc ON ui.upgrade_category_id = uc.id
             WHERE ui.id = $1 AND uc.upgrade_id = $2`,
            [itemId, upgrade.upgradeId]
          );

          if (itemDetails.rows.length > 0) {
            await client.query(
              `INSERT INTO order_buffet_upgrade_items (
                 order_buffet_upgrade_id, upgrade_item_id, item_name, category_name, order_id
               ) VALUES ($1, $2, $3, $4, $5)`,
              [orderBuffetUpgradeId, itemId, itemDetails.rows[0].name, itemDetails.rows[0].category_name, orderId]
            );
          }
        }
      }
    }
    
    // Insert each sandwich and the options picked for it.
    // These have already been checked and priced by the controller (utils/sandwichOrder.js)
    for (const sandwich of orderData.sandwiches || []) {
      const sandwichResult = await client.query(
        `INSERT INTO order_sandwiches (order_id, quantity, unit_price, subtotal, notes)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [orderId, sandwich.quantity, sandwich.unitPrice, sandwich.subtotal, sandwich.notes]
      );
      const orderSandwichId = sandwichResult.rows[0].id;

      for (const option of sandwich.options) {
        await client.query(
          `INSERT INTO order_sandwich_options
             (order_sandwich_id, order_id, sandwich_option_id, step_name, option_name, extra_price, position)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [orderSandwichId, orderId, option.optionId, option.stepName, option.optionName, option.extraPrice, option.position]
        );
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

// Orders that are finished with: collected, cancelled, or 'completed' from before
// collection was tracked. They drop off the admin orders lists and show in the archive.
const ARCHIVED_STATUSES = `('collected', 'completed', 'cancelled')`;

// How many archived orders the archive page shows, newest first
const ARCHIVE_LIMIT = 200;

// ===== GET ALL ORDERS =====
/**
 * Gets orders with all their buffets and items for the admin portal.
 * Open orders by default (pending and ready), or the archive with archived: true.
 *
 * Uses a single query with JSON_AGG to avoid N+1 query problems.
 * The nested structure (orders → buffets → items/upgrades → upgrade_items)
 * is built using correlated subqueries with JSON aggregation.
 *
 * @param {object} [options]
 * @param {boolean} [options.archived] - Collected and cancelled orders instead of open ones
 * @returns {array} Orders with complete details
 */
const getAllOrders = async ({ archived = false } = {}) => {
  // Single query that builds the entire nested structure using JSON_AGG
  const ordersSQL = `
    SELECT
      o.id, o.order_number, o.customer_email, o.customer_phone,
      o.fulfillment_type, o.fulfillment_address, o.fulfillment_date, o.fulfillment_time,
      o.total_price, o.status, o.payment_status, o.payment_method, o.notes, o.staff_notes,
      o.created_at, o.updated_at,

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
      ) as buffets,
${SANDWICHES_JSON}

    FROM orders o
    WHERE o.status ${archived ? 'IN' : 'NOT IN'} ${ARCHIVED_STATUSES}
    ORDER BY ${archived ? `o.updated_at DESC LIMIT ${ARCHIVE_LIMIT}` : 'o.fulfillment_date ASC, o.created_at DESC'}
  `;

  const ordersResult = await query(ordersSQL);
  return ordersResult.rows;
};

// ===== UPDATE ORDER STATUS =====
/**
 * Updates the status of an order (pending, ready, collected or cancelled)
 * Collected and cancelled orders leave the admin orders lists and go to the archive.
 *
 * @param {number} orderId - The ID of the order to update
 * @param {string} status - The new status value
 * @returns {object|null} The updated order, with previous_status (what it was before), or null if not found
 */
const updateOrderStatus = async (orderId, status) => {
  const updateSQL = `
    UPDATE orders o
    SET status = $1, updated_at = NOW()
    FROM (SELECT id, status AS previous_status FROM orders WHERE id = $2 FOR UPDATE) before
    WHERE o.id = before.id
    RETURNING o.id, o.order_number, o.customer_email, o.customer_phone,
              o.fulfillment_type, o.fulfillment_address, o.fulfillment_date, o.fulfillment_time,
              o.total_price, o.status, o.updated_at, before.previous_status
  `;

  const result = await query(updateSQL, [status, orderId]);
  return result.rows[0] || null;
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
      o.total_price, o.status, o.payment_status, o.payment_method, o.notes, o.staff_notes,
      o.created_at, o.updated_at,

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
      ) as buffets,
${SANDWICHES_JSON}

    FROM orders o
    WHERE o.id = $1
  `;

  const result = await query(orderSQL, [orderId]);
  return result.rows[0] || null;
};

// ===== GET ORDERS BY CUSTOMER ID =====
/**
 * Gets all orders for a specific customer (their order history)
 * Uses the same JSON aggregation pattern as getAllOrders
 *
 * @param {number} customerId - The customer's ID from the JWT
 * @returns {array} All orders for that customer with complete details
 */
const getOrdersByCustomerId = async (customerId, customerEmail) => {
  const ordersSQL = `
    SELECT
      o.id, o.order_number, o.customer_email, o.customer_phone,
      o.fulfillment_type, o.fulfillment_address, o.fulfillment_date, o.fulfillment_time,
      o.total_price, o.status, o.payment_status, o.payment_method, o.notes, o.staff_notes,
      o.created_at, o.updated_at,

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
      ) as buffets,
${SANDWICHES_JSON}

    FROM orders o
    WHERE o.customer_id = $1
       OR o.customer_email = $2
    ORDER BY o.created_at DESC
  `;

  const result = await query(ordersSQL, [customerId, customerEmail]);
  return result.rows;
};

// ===== UPDATE STAFF NOTES =====
const updateStaffNotes = async (orderId, staffNotes) => {
  const result = await query(
    `UPDATE orders SET staff_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, staff_notes`,
    [staffNotes || null, orderId]
  );
  return result.rows[0];
};

// ===== UPDATE PAYMENT STATUS =====
// Staff mark an order paid (or back to unpaid) once they've taken payment
const updatePaymentStatus = async (orderId, paymentStatus) => {
  const result = await query(
    `UPDATE orders SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, payment_status`,
    [paymentStatus, orderId]
  );
  return result.rows[0];
};

// Export the functions so other files can use them
module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByCustomerId,
  updateStaffNotes,
  updatePaymentStatus
};

