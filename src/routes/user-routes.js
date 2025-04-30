// src/routes/user-routes.js
const {
  deleteSavedJob,
  postFavoriteJob,
  postFavoriteQuickJob,
  getFavoriteJobs,
  deleteFavoriteJob,
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

// Import the new modular user controllers
const {
  getAllUsers,
  searchUsers,
  getUser,
  showCurrentUser,
  getRecommendedUsers,
} = require("../controllers/user/userQueryController");

const {
  updateUserNumber,
  updateUserEmail,
  updateUserPurpose,
  updateUserProfile,
  updateUsername,
  updateJobTitle,
  updateUserPassword,
  updateAvatar,
} = require("../controllers/user/userProfileController");

const {
  updateRole,
  addServerRoles,
} = require("../controllers/user/userRoleController");

const {
  updateUserVisibility,
  updateAllUsersVisibility,
} = require("../controllers/user/userVisibilityController");

const {
  addCoins,
  deductCoins,
  setUserCoins,
  transferCoins,
  getUserCoins,
} = require("../controllers/user/userCoinsController");

const {
  getResume,
  updateResumeSummary,
  updateResumeContact,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  updateSkills,
  uploadCV,
  deleteCV,
} = require("../controllers/user/userResumeController");

// const {
//   migrateJobSeekerDataToResume,
//   migrateJobSeekerDataToResumeForAllUsers,
// } = require("../controllers/user/userMigrationController");

const authMiddleware = require("../middleware/auth-middleware");
const updateLastActivity = require("../middleware/last-active");
const router = require("express").Router();

// User Query Routes
router.route("/allUsers").get(authMiddleware, getAllUsers);
router.route("/searchUsers").get(authMiddleware, searchUsers);
router.route("/allUsers/:id").get(authMiddleware, getUser);
router
  .route("/currentUser")
  .get(authMiddleware, updateLastActivity, showCurrentUser);
router.route("/recommendedUsers").get(authMiddleware, getRecommendedUsers);

// User Profile Routes
router.route("/updateUsername").patch(authMiddleware, updateUsername);
router.route("/updateJobTitle").patch(authMiddleware, updateJobTitle);
router.route("/updateUserNumber").patch(authMiddleware, updateUserNumber);
router.route("/updateUserPurpose").patch(authMiddleware, updateUserPurpose);
router.route("/updateUserEmail").patch(authMiddleware, updateUserEmail);
router.route("/updatePassword").patch(authMiddleware, updateUserPassword);
router.route("/updateProfile").put(authMiddleware, updateUserProfile);
router.route("/updateAvatar").patch(authMiddleware, updateAvatar);

// User Role Routes
router.route("/updateRole").patch(authMiddleware, updateRole);
router.patch("/roles", authMiddleware, addServerRoles);

// User Coins Routes
router.route("/coins").get(authMiddleware, getUserCoins);
router.route("/coins/add").post(authMiddleware, addCoins);
router.route("/coins/deduct").post(authMiddleware, deductCoins);
router.route("/coins/set").post(authMiddleware, setUserCoins);
router.route("/coins/transfer").post(authMiddleware, transferCoins);

// User Visibility Routes
router
  .route("/updateUserVisibility")
  .patch(authMiddleware, updateUserVisibility);
router
  .route("/updateAllUsersVisibility")
  .post(authMiddleware, updateAllUsersVisibility);

// Resume Routes
router.route("/resume").get(authMiddleware, getResume);
router.route("/resume/summary").patch(authMiddleware, updateResumeSummary);
router.route("/resume/contact").patch(authMiddleware, updateResumeContact);
router.route("/resume/skills").patch(authMiddleware, updateSkills);
router.route("/resume/work").post(authMiddleware, addWorkExperience);
router.route("/resume/work").patch(authMiddleware, updateWorkExperience);
router
  .route("/resume/work/:index")
  .delete(authMiddleware, deleteWorkExperience);
router.route("/resume/education").post(authMiddleware, addEducation);
router.route("/resume/education").patch(authMiddleware, updateEducation);
router
  .route("/resume/education/:index")
  .delete(authMiddleware, deleteEducation);
router.route("/resume/cv").post(authMiddleware, uploadCV);
router.route("/resume/cv").delete(authMiddleware, deleteCV);

// Job Seeker Routes
router
  .route("/deleteJobseekersSavedjob/:id")
  .delete(authMiddleware, deleteSavedJob);
router.route("/favoriteJob").get(authMiddleware, getFavoriteJobs);
router.route("/favoriteJob/:id").post(authMiddleware, postFavoriteJob);
router
  .route("/favoriteQuickJob/:id")
  .post(authMiddleware, postFavoriteQuickJob);
router.route("/favoritejob/:id").delete(authMiddleware, deleteFavoriteJob);

// Employer Routes
router.route("/getAllEmployers").get(authMiddleware, getAllEmployers);
router.route("/searchEmployers").get(authMiddleware, searchEmployers);
router.route("/getJobMaker/:id").get(authMiddleware, getJobMaker);
router.route("/getEmployer/:id").get(authMiddleware, getEmployer);

// Favorites Routes
router.route("/favorites/:favoriteId").post(authMiddleware, AddToFavorite);
router
  .route("/getMyFavorites/:favoriteId")
  .get(authMiddleware, GetFavoriteUser);
router
  .route("/removeFromFavorite/:favoriteId")
  .delete(authMiddleware, RemoveFromFavorite);
router.route("/getAllMyFavorites").get(authMiddleware, GetAllFavoriteUsers);

module.exports = router;
