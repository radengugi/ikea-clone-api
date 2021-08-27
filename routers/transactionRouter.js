const router = require('express').Router()
const { readToken } = require('../config')
const { transactionController } = require('../controllers')

// API Cart
router.get('/get-cart/:iduser', readToken, transactionController.getCart)
router.post('/add-cart', readToken, transactionController.addCart)
router.delete('/delete-cart/:idcart', transactionController.deleteCart)
router.patch('/update-qty', transactionController.updateCart)

// API Transaction
router.get('/get-transaksi/:id', transactionController.getTransaksi)
router.patch('/update-status', transactionController.updateStatus)
router.patch('/update-admin', transactionController.updateStatusAdmin)
router.post('/checkout',readToken , transactionController.addCheckout)

module.exports = router