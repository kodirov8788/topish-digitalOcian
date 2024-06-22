const {
  createCompany,
  deleteCompany,
  getAllCompany,
  getSingleCompany,
  updateCompany,
  addAdminCompany,
  deleteAdminCompany,
  sendingReqToCompEmployer,
  admitEmployerToComp,
  rejectEmployerToComp,
  getCompanyEmploymentRequests,
  addingEmployerManually,
  removeEmployerFromCompany,
  getCompanyJobPosts,
  updateCompanyMinorChange,
  getStatusOfEmployerRequest
} = require("../controllers/companyCTRL");
const authMiddleware = require("../middleware/auth-middleware");
const router = require("express").Router();
const { uploadFiles } = require("../utils/companyImageUpload");

router.route("/").get(getAllCompany);
router.route("/").post(authMiddleware, uploadFiles, createCompany);

router.route("/:id").put(authMiddleware, uploadFiles, updateCompany);
router
  .route("/:id/minorChange")
  .patch(authMiddleware, updateCompanyMinorChange);
router.route("/:id").get(getSingleCompany);
router.route("/:id").delete(authMiddleware, deleteCompany);
router.route("/:id/addingAdmin").post(authMiddleware, addAdminCompany);
router.route("/:id/removeAdmin").delete(authMiddleware, deleteAdminCompany);
router
  .route("/:id/sendingRequest")
  .post(authMiddleware, sendingReqToCompEmployer);
router.route("/:id/admitEmployer").post(authMiddleware, admitEmployerToComp);
router.route("/:id/rejectEmployer").post(authMiddleware, rejectEmployerToComp);
router
  .route("/:id/users/:userId/status")
  .get(authMiddleware, getStatusOfEmployerRequest);
router
  .route("/:id/employmentRequests")
  .get(authMiddleware, getCompanyEmploymentRequests);
router
  .route("/:id/addingEmployerManually")
  .post(authMiddleware, addingEmployerManually);
router
  .route("/:id/removeEmployer")
  .delete(authMiddleware, removeEmployerFromCompany);
router.route("/:id/jobPosts").get(authMiddleware, getCompanyJobPosts);

module.exports = router;
