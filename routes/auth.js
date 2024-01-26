const express = require('express')

const router = express.Router()

const { check, body } = require('express-validator')
const User = require('../Model/User')

const authCtrl = require('../controllers/authCtrl')
const isAuth = require('../middleware/isAuth')

router.put(
  '/signUp',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({
          email: value,
        })
        if (userDoc) {
          return Promise.reject('Email address already exist')
        }
      })
      .normalizeEmail(),
    check('password', 'Password is too short')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('name').isString().trim().not(),
  ],
  authCtrl.signUp
)

router.post('/login', authCtrl.login)

router.get('/status', isAuth, authCtrl.getUserStatus)
router.patch(
  '/status',
  isAuth,
  [body('status').trim().not().isEmpty()],
  authCtrl.updateUserStatus
)
module.exports = router

// for checking if email exists
//using Then
/* return User.findOne({
            email:value
        }).then((userDoc)=>{
            if(userDoc){
                return Promise.reject('Email already exisits)
            }
        }) */

//validation
/*  [
    check('email', 'Enter a valid  email and password')
      .isEmail()
      .custom((value, { req }) => {
        return User.findOne({
          email: value,
        }).then((userEmail) => {
          if (!userEmail) {
            return Promise.reject('Enter a valid email and password')
          }
        })
      }),

    body('password').custom(async (value, { req }) => {
      const userPass = await User.findOne({
        password: value,
      })
      if (!userPass) {
        return Promise.reject('Enter a valid email and password')
      }
    }),
  ], */
