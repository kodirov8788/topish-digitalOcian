const express = require('express');
const {
  createBanner,
  deleteBanner,
  getAllBanner,
  moveIndexPosition,
} = require('../controllers/bannerCTRL');
const authMiddleware = require('../middleware/auth-middleware');

const router = express.Router();
router.post('/', authMiddleware, createBanner);
// router.get('/', getAllMyGalleryPost);
router.delete('/', authMiddleware, deleteBanner);
router.get('/', getAllBanner);
router.post('/moveimage', authMiddleware, moveIndexPosition);

module.exports = router;