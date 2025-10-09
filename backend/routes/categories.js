const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

router.post('/', auth, categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategory);
router.delete('/:id', auth, categoryController.deleteCategory);

module.exports = router;
