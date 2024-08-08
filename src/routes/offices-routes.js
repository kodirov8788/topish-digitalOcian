const {
    createOffice,
    deleteOffice,
    getAllOffices,
    getSingleOffice,
    getServicePosts,
    postFavoriteOffice,
    getFavoriteOffices,
    deleteFavoriteOffice,
    updateOffice,
    getAllOfficesForAdmin,
    approveOrRejectOffice,
    approveAllOffices
} = require("../controllers/officesCTRL");
const { uploadFiles } = require("../utils/imageUploads/officeImageUpload");
const router = require("express").Router();
router.route("/").post(uploadFiles, createOffice).get(getAllOffices);
router.route("/myposts").get(getServicePosts);
router.route("/forAdmin").get(getAllOfficesForAdmin);
router.route("/approveAllOffices").post(approveAllOffices);

router.route("/:officeId/favorite").post(postFavoriteOffice).delete(deleteFavoriteOffice)
router.route("/myfavoriteOffices").get(getFavoriteOffices);
router.route("/:id").get(getSingleOffice).patch(uploadFiles, updateOffice).delete(deleteOffice);

router.route("/:id/approveOrReject").patch(approveOrRejectOffice);





module.exports = router;




