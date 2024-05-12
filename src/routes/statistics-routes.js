const {
  getJobSeekerCount,
  getEmployerCount,
  getJobsCount,
  getApplicantsCount
} = require("../controllers/statisticsCTRL");
const router = require("express").Router();

router.route("/jobseekers").get(getJobSeekerCount);
router.route("/employers").get(getEmployerCount);
router.route("/jobs").get(getJobsCount);
router.route("/applicants").get(getApplicantsCount);

module.exports = router;
