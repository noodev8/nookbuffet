/*
=======================================================================================================================================
SANDWICH ROUTES - API endpoints for the build-your-own sandwich menu
=======================================================================================================================================
GET /api/sandwiches is public; everything under /manage is admin only, except where it says all staff. Every response has a return_code; errors also have a message.
Common return codes: SUCCESS, INVALID_ID, INVALID_DATA, NOT_FOUND, UNAUTHORIZED, FORBIDDEN, SERVER_ERROR

A step looks like:
{
  "id": 1,
  "name": "Bread",                    // string
  "description": null,                // string or null - shown to customers
  "min_choices": 1,                   // integer, 0 = optional
  "max_choices": 1,                   // integer, or null for no limit
  "included_choices": null,           // integer - picks included in the base price, or null for all of them
  "extra_choice_price": "0.00",       // string (numeric) - what each pick after the included ones costs
  "position": 0,                     // integer, order the steps are shown in
  "options": [ ...options ]           // only on GET /manage
}

An option looks like:
{
  "id": 7,
  "step_id": 1,
  "name": "White bloomer",            // string
  "description": null,                // string or null
  "extra_price": "0.00",              // string (numeric), added to the base price
  "is_active": true                   // boolean, false = out of stock
}

ENDPOINTS:

0. GET /api/sandwiches
   Purpose: The sandwich menu for the website - in-stock options only (public)
   Success Response: { return_code, data: { base_price: "5.00", sold_out: false, steps: [...] } }
   sold_out is true when a required step has nothing in stock (steps is then empty)
   Also includes open_time, close_time, slot_minutes, slot_capacity and notice_minutes (see settings below)

0b. GET /api/sandwiches/slots?date=2026-10-05
   Purpose: The collection slots on a day, slot_minutes apart (public). Today only lists slots at least notice_minutes from now.
   Success Response: { return_code, data: { open_time: "11:00", close_time: "14:00", slot_minutes: 5,
     slots: [ { time: "11:00", available: true }, { time: "11:05", available: false }, ... ] } }
   available is false once a slot has slot_capacity orders in it, or staff have blocked it
   Return Codes: SUCCESS, INVALID_DATA, SERVER_ERROR

1. GET /api/sandwiches/manage   (all staff)
   Purpose: The whole sandwich menu for the admin portal, including out-of-stock options
   Success Response: { return_code, data: { settings: { base_price: "5.00", open_time: "11:00", ... }, steps: [...] } }
   settings is only included for admins

2. PATCH /api/sandwiches/manage/settings
   Request Body: { "base_price": 5.00,
                   "open_time": "11:00", "close_time": "14:00", "slot_minutes": 5, "slot_capacity": 5, "notice_minutes": 30 }
     base_price (number >= 0) is required. The rest are optional and left
     as they are when not sent:
       open_time, close_time - collection hours, on 5-minute marks, sent together, open before close
       slot_minutes  - how long each collection slot is (5 to 120, in steps of 5)
       slot_capacity - most orders with sandwiches per collection slot (1 or more)
       notice_minutes - customers must order at least this long before their collection time (0 to 240)
   Success Response: { return_code, data: { base_price, open_time, close_time, slot_minutes, slot_capacity, notice_minutes } }

2b. GET /api/sandwiches/manage/slots?date=2026-10-24   (all staff)
   Purpose: Every collection slot on a day, for the Time slots page
   Success Response: { return_code, data: { slot_capacity: 5,
     slots: [ { time: "13:00", orders: 2, blocked: false, passed: false }, ... ] } }

2c. PATCH /api/sandwiches/manage/slots   (all staff)
   Purpose: Block or unblock one slot on one day. A blocked slot is full for customers, like it
   had slot_capacity orders. Orders already booked in it stay as they are.
   Request Body: { "date": "2026-10-24", "time": "13:00", "blocked": true }
   Success Response: { return_code, data: { date, blocked: ["13:00", ...] } }

3. POST /api/sandwiches/manage/steps
   Request Body: { "name": "Meat", "description": null, "min_choices": 0, "max_choices": 2,
                   "included_choices": 1, "extra_choice_price": 0.40 }
     included_choices and extra_choice_price are optional (all included, no extra charge)
   Success Response: { return_code, data: step }

4. PATCH /api/sandwiches/manage/steps/reorder
   Request Body: [ { "id": 1, "position": 0 }, { "id": 2, "position": 1 } ]

5. PATCH /api/sandwiches/manage/steps/:id
   Request Body: same as creating a step
   Success Response: { return_code, data: step }

6. DELETE /api/sandwiches/manage/steps/:id
   Purpose: Remove a step and its options (soft delete)

7. POST /api/sandwiches/manage/steps/:id/options   (all staff - e.g. adding a special)
   Request Body: { "name": "Ham", "description": null, "extra_price": 0.50 }   // extra_price optional, defaults to 0
   extra_price is only saved for admins - for other staff it is always 0
   Success Response: { return_code, data: option }

8. PATCH /api/sandwiches/manage/options/:id
   Request Body: same as creating an option
   Success Response: { return_code, data: option }

9. PATCH /api/sandwiches/manage/options/:id/stock   (all staff - marking items sold out)
   Request Body: { "is_active": false }
   Success Response: { return_code, data: option }

10. DELETE /api/sandwiches/manage/options/:id
    Purpose: Remove an option (soft delete)

=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();
const sandwichController = require('../controllers/sandwichController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const admin = [verifyToken, checkRole(['admin'])];
const staff = [verifyToken, checkRole(['general', 'admin'])];

router.get('/', sandwichController.getMenuForCustomers);
router.get('/slots', sandwichController.getSlots);
router.get('/manage', staff, sandwichController.getMenuForManagement);
router.patch('/manage/settings', admin, sandwichController.updateSettings);
router.get('/manage/slots', staff, sandwichController.getDaySlots);
router.patch('/manage/slots', staff, sandwichController.setSlotBlocked);

// reorder must come before /:id so "reorder" isn't treated as an ID
router.post('/manage/steps', admin, sandwichController.createStep);
router.patch('/manage/steps/reorder', admin, sandwichController.reorderSteps);
router.patch('/manage/steps/:id', admin, sandwichController.updateStep);
router.delete('/manage/steps/:id', admin, sandwichController.deleteStep);

router.post('/manage/steps/:id/options', staff, sandwichController.createOption);
router.patch('/manage/options/:id', admin, sandwichController.updateOption);
router.patch('/manage/options/:id/stock', staff, sandwichController.setOptionStock);
router.delete('/manage/options/:id', admin, sandwichController.deleteOption);

module.exports = router;
