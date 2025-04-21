const express = require("express");
const router = express.Router();
const userController = require("../controllers/control");
const loginController = require("../controllers/logincontrollers");
const { isAuthenticated } = require('../middlewares/auth');
// GET request
router.get('/', userController.indexrout);
router.get('/pages/login.html', loginController.userLogin);
router.get('/pages/createAccount.html', userController.createGet);
router.get('/pages/success.html', userController.successGet)
router.get('/logout', userController.logout);
// Protect the dashboard route
router.get('/Main', isAuthenticated, userController.MainGet); 
// POST requests
router.post('/login', loginController.UserLoginPost);
router.post('/createAccount', userController.registerUser);
router.post('/submitForm', userController.submitForm);

router.post('/submitTest', userController.submitTest);

module.exports = router;
