const express = require('express');
const {
  createGalleryPost,
  deleteGalleryImage,
  getAllGalleryPost,
  getAllMyGalleryPost,
  getGalleryPost,
  getJobSeekerGallery
} = require('../controllers/galleryCTRL');

const router = express.Router();
router.post('/', createGalleryPost);
router.get('/', getAllMyGalleryPost);
router.delete('/', deleteGalleryImage);
router.get('/allgalleries', getAllGalleryPost);
router.get('/getjobseeker/:id', getJobSeekerGallery);

module.exports = router;