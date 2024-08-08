const {
  createQuickJobs,
  getSingleQuickJob,
  updateQuickJobs,
  getEmployerPosts,
  deleteQuickJobs,
  getAllQuickJobs,
  getAllQuickJobsForAdmin,
  approveOrRejectJob,
  approveAllJobs
} = require("../controllers/quickjobsCTRL");
const { applyForQuickjob, getApplicantsForQuickjob } = require("../controllers/applicationCTRL");
const authMiddleware = require("../middleware/auth-middleware");
const router = require("express").Router();
router.get("/myJobs", authMiddleware, getEmployerPosts);
router.get("/", getAllQuickJobs);
router.post("/", authMiddleware, createQuickJobs);

// ----------------- Admin routes -----------------
router.post("/approveAllJobs", authMiddleware, approveAllJobs);
router.get("/forAdmin", authMiddleware, getAllQuickJobsForAdmin);
// ----------------- Admin routes -----------------
router.get("/:id", getSingleQuickJob)
router.patch("/:id", authMiddleware, updateQuickJobs)
router.delete("/:id", authMiddleware, deleteQuickJobs)
router.post("/:id/apply", authMiddleware, applyForQuickjob);
router.get("/myJobs/:id/applicants", authMiddleware, getApplicantsForQuickjob);
router.patch("/:id/approveOrReject", authMiddleware, approveOrRejectJob);


module.exports = router;
