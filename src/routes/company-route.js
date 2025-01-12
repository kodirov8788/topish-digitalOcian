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
  getStatusOfEmployerRequest,
  getAllRequestsStatusForUser,
  getCompaniesStatus,
  getApprovedCompanies,
  approveCompany,
  getPendingCompanies,
  getRejectedCompanies,
  appliedCompanyCount,
  changeEmployerRole,
} = require("../controllers/companyCTRL");
const authMiddleware = require("../middleware/auth-middleware");
const router = require("express").Router();
const { uploadFiles } = require("../utils/imageUploads/companyImageUpload");

router.route("/").get(getAllCompany);
router.route("/").post(authMiddleware, uploadFiles, createCompany);
router.route("/status").get(authMiddleware, getCompaniesStatus);
router.route("/approved").get(authMiddleware, getApprovedCompanies);
router.route("/pending").get(authMiddleware, getPendingCompanies);
router.route("/rejected").get(authMiddleware, getRejectedCompanies);
router.route("/appliedCompanies").get(authMiddleware, appliedCompanyCount);

router.route("/:companyId/approve").put(authMiddleware, approveCompany);
router.route("/:id").put(authMiddleware, uploadFiles, updateCompany);
router
  .route("/:id/minorChange")
  .patch(authMiddleware, updateCompanyMinorChange);
router.route("/:id").get(authMiddleware, getSingleCompany);
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
  .route("/:userId/requests/status")
  .get(authMiddleware, getAllRequestsStatusForUser);

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
router
  .route("/:id/users/:userId/changeRole")
  .put(authMiddleware, changeEmployerRole);

module.exports = router;
