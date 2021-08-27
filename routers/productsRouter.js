const express = require('express')
const { productsController } = require('../controllers')
const router = express.Router()

router.post('/add', productsController.addProducts)
router.get('/get-data', productsController.getProducts)
router.patch('/update', productsController.updateProduct)
router.delete('/delete', productsController.deleteProduct)

module.exports = router