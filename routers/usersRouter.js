const express = require('express')
const { readToken } = require('../config')
const { usersController } = require('../controllers')
const router = express.Router()

router.get('/get-all', usersController.getUsers)
router.post('/login', usersController.login)
router.post('/keeplogin', readToken, usersController.keepLogin)
router.post('/regis', usersController.register)
router.patch('/update-verified', readToken, usersController.updateVerified)
router.patch('/reverification', usersController.reVerification)

module.exports = router