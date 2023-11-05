const express = require('express');
const router = express.Router();
const { image } = require('../libs/multer');
const { uploadImage, getAllImages, getDetailImage, updateGallery } = require('../controllers/media.controllers');

router.post('/uploadimage', image.single('image'), uploadImage);
router.get('/gallery', getAllImages);
router.get('/gallery/:id', getDetailImage);
router.put('/gallery/:id', image.single('image'), updateGallery);

module.exports = router;