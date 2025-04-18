const UserQueryController = require("./userQueryController");
const UserProfileController = require("./userProfileController");
const UserRoleController = require("./userRoleController");
const UserVisibilityController = require("./userVisibilityController");
const UserCoinsController = require("./userCoinsController");
const UserMigrationController = require("./userMigrationController");
const UserResumeController = require("./userResumeController");

// Fix: Properly bind methods to maintain their 'this' context
const bindMethods = (controller) => {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(controller))
    .filter(
      (method) =>
        method !== "constructor" && typeof controller[method] === "function"
    )
    .reduce((acc, method) => {
      acc[method] = controller[method].bind(controller);
      return acc;
    }, {});
};

// Bind methods for each controller
const boundQueryMethods = bindMethods(UserQueryController);
const boundProfileMethods = bindMethods(UserProfileController);
const boundRoleMethods = bindMethods(UserRoleController);
const boundVisibilityMethods = bindMethods(UserVisibilityController);
const boundCoinsMethods = bindMethods(UserCoinsController);
const boundMigrationMethods = bindMethods(UserMigrationController);
const boundResumeMethods = bindMethods(UserResumeController);

module.exports = {
  // Controller instances
  UserQueryController,
  UserProfileController,
  UserRoleController,
  UserVisibilityController,
  UserCoinsController,
  UserMigrationController,
  UserResumeController,

  // Individual methods for direct access - now correctly bound

  // Query methods
  getAllUsers: boundQueryMethods.getAllUsers,
  searchUsers: boundQueryMethods.searchUsers,
  showCurrentUser: boundQueryMethods.showCurrentUser,
  getUser: boundQueryMethods.getUser,

  // Profile methods
  updateUserNumber: boundProfileMethods.updateUserNumber,
  updateUserEmail: boundProfileMethods.updateUserEmail,
  updateUserProfile: boundProfileMethods.updateUserProfile,

  // Role methods
  updateRole: boundRoleMethods.updateRole,
  addServerRoles: boundRoleMethods.addServerRoles,
  removeServerRole: boundRoleMethods.removeServerRole,
  getUsersWithRole: boundRoleMethods.getUsersWithRole,
  checkUserPermission: boundRoleMethods.checkUserPermission,

  // Visibility methods
  updateUserVisibility: boundVisibilityMethods.updateUserVisibility,
  updateUserVisibilityById: boundVisibilityMethods.updateUserVisibilityById,
  updateAllUsersVisibility: boundVisibilityMethods.updateAllUsersVisibility,
  updateVisibilityByRole: boundVisibilityMethods.updateVisibilityByRole,
  getUserVisibilityStatus: boundVisibilityMethods.getUserVisibilityStatus,

  // Coins methods
  // Export all coin controller methods
  ...boundCoinsMethods,

  // Migration methods
  // Export all migration controller methods
  ...boundMigrationMethods,

  // Resume methods
  getResume: boundResumeMethods.getResume,
  updateResumeSummary: boundResumeMethods.updateResumeSummary,
  updateResumeContact: boundResumeMethods.updateResumeContact,
  addWorkExperience: boundResumeMethods.addWorkExperience,
  updateWorkExperience: boundResumeMethods.updateWorkExperience,
  deleteWorkExperience: boundResumeMethods.deleteWorkExperience,
  addEducation: boundResumeMethods.addEducation,
  updateEducation: boundResumeMethods.updateEducation,
  deleteEducation: boundResumeMethods.deleteEducation,
  updateSkills: boundResumeMethods.updateSkills,
  uploadCV: boundResumeMethods.uploadCV,
  deleteCV: boundResumeMethods.deleteCV,
};
