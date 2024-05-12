const {
  createQuickjobs,
  getSingleQuickjob,
  updateQuickjobs,
  getEmployerPosts,
  deleteQuickjobs,
  getAllQuickjobs,
} = require("../controllers/quickjobsCTRL");
const { applyForQuickjob, getApplicantsForQuickjob } = require("../controllers/applicationCTRL");
const authMiddleware = require("../middleware/auth-middleware");
const router = require("express").Router();
router.get("/myJobs", authMiddleware, getEmployerPosts);
router.get("/", getAllQuickjobs);
router.post("/", authMiddleware, createQuickjobs);
router.get("/:id", getSingleQuickjob)
router.patch("/:id", authMiddleware, updateQuickjobs)
router.delete("/:id", authMiddleware, deleteQuickjobs)
router.post("/:id/apply", authMiddleware, applyForQuickjob);
router.get("/myJobs/:id/applicants", authMiddleware, getApplicantsForQuickjob);
module.exports = router;
