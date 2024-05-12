const {
  createCompany,
  deleteCompany,
  getAllCompany,
  getSingleCompany,
  updateCompany
} = require("../controllers/companyCTRL");
const router = require("express").Router();
const { uploadFiles } = require("../utils/companyImageUpload");

router.route("/all").get(getAllCompany);
router.route("/").post(uploadFiles, createCompany);
router.route("/:id").patch(uploadFiles, updateCompany);
router.route("/:id").get(getSingleCompany);
router.route("/delete/:id").delete(deleteCompany);

module.exports = router;
