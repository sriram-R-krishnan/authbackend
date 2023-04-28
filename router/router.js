const express = require('express')
const { signup, login, forgotPassword, restPassword, updateResetPassword } = require('../controller/controller')
const router = express.Router()


router.route('/signUp').post( signup )
router.route('/login').post( login )
router.route('/forgotpassword').post( forgotPassword )


router.route('/reset-password/:token').get(restPassword );
  
  router.route('/reset-password/:token').put( updateResetPassword);

module.exports = router 