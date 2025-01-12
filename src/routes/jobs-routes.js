const {
  createJobs,
  getSingleJob,
  updateJobs,
  getEmployerPosts,
  deleteJobs,
  getAllJobs,
  getRecentJobs,
  getRecommendedJobs,
  getSearchTitle,
  searchByJobType,
  getAllJobsForAdmin,
  approveOrRejectJob,
  approveAllJobs,
  getRejectedJobs,
  getPendingJobs,
  getApprovedJobs,
  getAppliedCompaniesCount,
  getAppliedJobs,
} = require("../controllers/jobsCTRL");
const {
  applyForJob,
  getApplicantsForJob,
} = require("../controllers/applicationCTRL");
const authMiddleware = require("../middleware/auth-middleware");
//const express = require("express");
// const router = expresss.Router()
const router = require("express").Router();

router.get("/myJobs", authMiddleware, getEmployerPosts);
router.get("/", getAllJobs);
router.post("/", authMiddleware, createJobs);
router.get("/search", getSearchTitle);
router.get("/searchViaJobType", searchByJobType);
router.get("/recentjobs", getRecentJobs);
router.get("/recommendedjobs", getRecommendedJobs);
// ----------------- Admin routes -----------------
router.get("/forAdmin", authMiddleware, getAllJobsForAdmin);
router.post("/approveAllJobs", authMiddleware, approveAllJobs);
router.get("/rejected", authMiddleware, getRejectedJobs);
router.get("/pending", authMiddleware, getPendingJobs);
router.get("/approved", authMiddleware, getApprovedJobs);
router.get("/getAppliedCompanies", authMiddleware, getAppliedCompaniesCount);
router.get("/getAppliedJobs", authMiddleware, getAppliedJobs);
router.patch("/:id/approveOrReject", authMiddleware, approveOrRejectJob);

// ----------------- Admin routes -----------------
router.get("/:id", getSingleJob);
router.patch("/:id", authMiddleware, updateJobs);
router.delete("/:id", authMiddleware, deleteJobs);
router.post("/:id/apply", authMiddleware, applyForJob);
router.get("/myJobs/:id/applicants", authMiddleware, getApplicantsForJob);

module.exports = router;
