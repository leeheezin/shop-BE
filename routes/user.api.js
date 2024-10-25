const express = require('express')
const userController = require('../controllers/user.controller')
const authController = require('../controllers/auth.controller')
const router = express.Router()

router.post('/',userController.createUser)
router.post('/login',userController.loginUser)
router.get('/account', authController.authenticate, userController.getUser)

module.exports = router