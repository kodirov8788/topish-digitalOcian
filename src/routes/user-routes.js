// const {
//   getAllUsers,
// } = require("../controllers/all-Users/all-users-controller");
// const { getUser } = require("../controllers/all-Users/singleUser-controller");
const {
  getAllJobSeekers,
  getJobSeekersBySkills,
  getJobSeekersByName,
  getJobSeekersByParams,
  getJobSeekersSavedJobs,
  deleteSavedJob,
  getRecommendedJobSeekers,
  postFavoriteJob,
  postFavoriteQuickJob,
  getFavoriteJobs,
  deleteFavoriteJob,
  getExperiencedJobseekers,
  // getJobSeekersQuery,
} = require("../controllers/jobSeekersCTRL");
const {
  getAllEmployers,
  searchEmployers,
  getEmployer,
  getJobMaker,
} = require("../controllers/employersCTRL");
const {
  AddToFavorite,
  RemoveFromFavorite,
  GetFavoriteUser,
  GetAllFavoriteUsers,
} = require("../controllers/favoriteCTRL");
const authMiddleware = require("../middleware/auth-middleware");
const {
  getAllUsers,
  getUser,
  showCurrentUser,
  updateUserNumber,
  updateUserPassword,
  updateUserEmail,
  updateUserPurpose,
  // updateJobSeekerProfile,
  // updateEmployerProfile,
  // updateServiceProfile,

  updateUserProfile,
  updateRole,
  updateUsername,
  updateCoinsForAllUsers,
  updateCoinsForUser,
  updateUserVisibility,
  addToAllUsersVisibility,
  migrateJobSeekerDataToResume,
  updateJobTitle,
  migrateJobSeekerDataToResumeForAllUsers
} = require("../controllers/userCTRL");
const updateLastActivity = require("../middleware/last-active");
// const { showCurrentUser } = require("../controllers/all-Users/current-user");
// const {
//   updateUser,
//   updateUserPassword,
// } = require("../controllers/all-Users/update-user");

const router = require("express").Router();

router.route("/allUsers").get(authMiddleware, getAllUsers); // ALL USERS
router.route("/allUsers/:id").get(authMiddleware, getUser); // GET A SINGLE USER BY ID
router
  .route("/currentUser")
  .get(authMiddleware, updateLastActivity, showCurrentUser); // showCurrentUser
router.route("/updateUsername").patch(authMiddleware, updateUsername); // updateUser
router.route("/updateRole").patch(authMiddleware, updateRole); // updateUser
router.route("/updateJobTitle").patch(authMiddleware, updateJobTitle);
router
  .route("/updateCoinsForAllUsers")
  .patch(authMiddleware, updateCoinsForAllUsers); // updateUser
router.route("/updateCoinsForUser").patch(authMiddleware, updateCoinsForUser); // updateUser
router
  .route("/updateUserVisibility")
  .patch(authMiddleware, updateUserVisibility);
router
  .route("/addToAllUsersVisibility")
  .post(authMiddleware, addToAllUsersVisibility);
// ALL JOB SEEKERS
// router.route("/searchJobSeekers").get(getJobSeekersBySkills); // Search JOB SEEKERS By skill
// router.route("/getAllJobSeekers").get(getAllJobSeekers);
// router.route("/getRecommendedJobSeekers").get(getRecommendedJobSeekers);
// router.route("/getExperiencedJobseekers").get(getExperiencedJobseekers);
// router.route("/getJobSeekersByName").get(getJobSeekersByName); // Search JOB SEEKERS By name
// router.route("/searchJobseekersParams").get(getJobSeekersByParams); // Search JOB SEEKERS By name
// router
//   .route("/getJobseekersSavedjob")
//   .get(authMiddleware, getJobSeekersSavedJobs);

// router.route("/getJobSeekersQuery").get(authMiddleware, getJobSeekersQuery);
router
  .route("/deleteJobseekersSavedjob/:id")
  .delete(authMiddleware, deleteSavedJob);
router.route("/favoriteJob").get(authMiddleware, getFavoriteJobs);
router.route("/favoriteJob/:id").post(authMiddleware, postFavoriteJob);
router
  .route("/favoriteQuickJob/:id")
  .post(authMiddleware, postFavoriteQuickJob);
router.route("/favoritejob/:id").delete(authMiddleware, deleteFavoriteJob);

router.route("/getAllEmployers").get(authMiddleware, getAllEmployers); // ALL EMPLOYERS
router.route("/searchEmployers").get(authMiddleware, searchEmployers); // Search Employers By companies
router.route("/getJobMaker/:id").get(authMiddleware, getJobMaker); // Search Employers By companies
router.route("/getEmployer/:id").get(authMiddleware, getEmployer); // ALL EMPLOYERS
router.route("/updateUserNumber").patch(authMiddleware, updateUserNumber); // updateUserNumber
router.route("/updateUserPurpose").patch(authMiddleware, updateUserPurpose); // updateUserTarget
router.route("/updateUserEmail").patch(authMiddleware, updateUserEmail); // updateUserEmail
router.route("/updatePassword").patch(authMiddleware, updateUserPassword); // updateUser
router.post(
  "/migrateAllJobSeekerData",
  authMiddleware,
  migrateJobSeekerDataToResumeForAllUsers
);
router.route("/updateProfile").put(authMiddleware, updateUserProfile); // updateUser

router.route("/favorites/:favoriteId").post(authMiddleware, AddToFavorite); // Add to favorite

router
  .route("/getMyFavorites/:favoriteId")
  .get(authMiddleware, GetFavoriteUser); // ALL EMPLOYERS
router
  .route("/removeFromFavorite/:favoriteId")
  .delete(authMiddleware, RemoveFromFavorite); // ALL EMPLOYERS
router.route("/getAllMyFavorites").get(authMiddleware, GetAllFavoriteUsers); // ALL EMPLOYERS


router.post(
  "/:targetUserId/migrateJobSeekerData",
  authMiddleware,
  migrateJobSeekerDataToResume
);

module.exports = router;
