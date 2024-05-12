const {
    makeReport,
    getReports,
    changeStatusReport
} = require("../controllers/reportUserCTRL");
const router = require("express").Router();

router.post("/", makeReport)
router.get("/", getReports)
router.patch("/:reportId", changeStatusReport)

module.exports = router;




