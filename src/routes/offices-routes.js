const {
    createOffice,
    deleteOffice,
    getAllOffices,
    getSingleOffice,
    getServicePosts,
    postFavoriteOffice,
    getFavoriteOffices,
    deleteFavoriteOffice,
    updateOffice
} = require("../controllers/officesCTRL");
const { uploadFiles } = require("../utils/imageUploads/officeImageUpload");
const router = require("express").Router();
router.route("/").post(uploadFiles, createOffice).get(getAllOffices);
router.route("/myposts").get(getServicePosts);

router.route("/:officeId/favorite").post(postFavoriteOffice).delete(deleteFavoriteOffice)
router.route("/myfavoriteOffices").get(getFavoriteOffices);
router.route("/:id").get(getSingleOffice).patch(uploadFiles, updateOffice).delete(deleteOffice);




module.exports = router;




