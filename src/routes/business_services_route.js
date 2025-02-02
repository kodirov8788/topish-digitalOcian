// src/routes/business_services_route.js
const {
    createBusinessService,
    getBusinessServices,
    getBusinessServiceById,
    updateBusinessService,
    deleteBusinessService,
    getAll,
    searchTagByParam,
    getMyBusinessServices
} = require("../controllers/businessServicesCTRL");
const authMiddleware = require("../middleware/auth-middleware");
const router = require("express").Router();

// Create a new business service
router.post("/", authMiddleware, createBusinessService);
// ...existing code...
router.get("/myServices", authMiddleware, getMyBusinessServices);
// ...existing code...
// Get all business services (global list)
router.get("/", getAll);

// Search business services by tag
router.get("/search", authMiddleware, searchTagByParam);

// Get all business services for a specific company
router.get("/:company_id", authMiddleware, getBusinessServices);

// Get a single business service by ID
router.get("/service/:id", authMiddleware, getBusinessServiceById);

// Update a business service
router.put("/service/:id", authMiddleware, updateBusinessService);

// Delete a business service
router.delete("/service/:id", authMiddleware, deleteBusinessService);

module.exports = router;
