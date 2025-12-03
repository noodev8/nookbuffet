/*
=======================================================================================================================================
BRANCH ROUTES - API endpoints for branch data
=======================================================================================================================================
Routes for retrieving branch information (collection points, locations, etc.)

ENDPOINTS:

1. GET /api/branches
   Purpose: Retrieve all active branches for collection point selection
   Request Body: None
   Success Response:
   {
     "return_code": "SUCCESS",
     "message": "Got all branches!",
     "data": [
       {
         "id": 1,                                    // integer, unique branch ID
         "name": "Main Branch",                      // string, branch name
         "address": "123 High Street, London",       // string, branch address
         "latitude": 51.5074,                        // decimal, latitude coordinate
         "longitude": -0.1278,                       // decimal, longitude coordinate
         "delivery_radius_miles": 7,                 // decimal, delivery radius in miles
         "is_active": true                           // boolean, whether branch is active
       }
     ],
     "count": 1                                      // integer, number of branches returned
   }
   Return Codes: SUCCESS, SERVER_ERROR

=======================================================================================================================================
*/

const express = require('express');
const router = express.Router();

const branchController = require('../controllers/branchController');

// ===== ROUTE: GET ALL BRANCHES =====
// When someone visits /api/branches, return all active branches
router.get('/', branchController.getAllBranches);

module.exports = router;

