const {
  AcceptProfileAccessRequest,
  DeclineProfileAccessRequest,
  UpdateProfileVisibility,
  SendProfileAccessRequest,
  GetProfileAccessRequests,
  ReverseAcceptanceOfProfileAccessRequest
} = require("../controllers/profileCTRL");
const router = require("express").Router();
router
  .route("/jobseekers/profile-access-requests")
  .post(SendProfileAccessRequest);
router
  .route("/jobseekers/profile-access-requests")
  .get(GetProfileAccessRequests);
router
  .route("/jobseekers/profile-visibility")
  .put(UpdateProfileVisibility);
router
  .route("/jobseekers/accept-profile-access-request/:requestId")
  .post(AcceptProfileAccessRequest);
router
  .route("/jobseekers/decline-profile-access-request/:requestId")
  .post(DeclineProfileAccessRequest);
router
  .route("/jobseekers/reverse-acceptance-profile-access-request/:requestId")
  .post(ReverseAcceptanceOfProfileAccessRequest);


module.exports = router;
