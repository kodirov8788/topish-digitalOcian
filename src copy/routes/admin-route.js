const { getUsersForAdmin, getJobSeekersForAdmin, getEmployersForAdmin, getJobsForAdmin, getOfficesForAdmin, getQuickjobsForAdmin, blockUserByAdmin, unblockUserByAdmin, sendNewsToAllUsers } = require("../controllers/AdminCTRL");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");

router.get("/getUsersForAdmin", authMiddleware, getUsersForAdmin);
router.get("/getJobSeekersForAdmin", authMiddleware, getJobSeekersForAdmin);
router.get("/getEmployersForAdmin", authMiddleware, getEmployersForAdmin);
router.get("/getJobsForAdmin", authMiddleware, getJobsForAdmin);
router.get("/getOfficesForAdmin", authMiddleware, getOfficesForAdmin);
router.get("/getQuickjobsForAdmin", authMiddleware, getQuickjobsForAdmin);
router.post("/blockUser/:id", authMiddleware, blockUserByAdmin);
router.post("/unBlockUser/:id", authMiddleware, unblockUserByAdmin);
router.post("/notification", authMiddleware, sendNewsToAllUsers);

module.exports = router;
