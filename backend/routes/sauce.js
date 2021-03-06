const express = require('express');

const router = express.Router();

const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.post('/', multer, sauceCtrl.createSauce);

router.delete('/:id', sauceCtrl.deleteSauce);

router.get("/", auth, sauceCtrl.getSauces);

router.get('/:id', auth, sauceCtrl.getOneSauce);

router.put('/:id', auth, multer, sauceCtrl.modifySauce);

router.post('/:id/like', auth, sauceCtrl.likeAndDislike);

module.exports = router;