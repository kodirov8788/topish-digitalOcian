const router = require("express").Router();
const { getProfessions, postProfessions } = require("../controllers/othersCTRL");

router.route("/professions").get(getProfessions);

router.route("/professions").post(postProfessions);

module.exports = router;
