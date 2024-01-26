const express = require('express')

const router = express.Router()
const { check, body } = require('express-validator')

const feedCtrl = require('../controllers/feedCtrl')
const isAuth = require('../middleware/isAuth')

router.get('/post', isAuth, feedCtrl.getPosts)

router.post(
  '/post',
  [
    body('title').isString().trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
  ],
  isAuth,
  feedCtrl.createPost
)

router.get('/post/:postId', isAuth, feedCtrl.getSinglePost)

router.put(
  '/post/:postId',
  [
    check('title').isString().trim().isLength({ min: 5 }),
    check('content').trim().isLength({ min: 5 }),
  ],
  isAuth,
  feedCtrl.updatePosts
)

router.delete('/post/:postId', isAuth, feedCtrl.deletePosts)

module.exports = router

/* const { v4: uuidv4 } = require('uuid');
 
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4())
    }
}); */

/* in createPosts, change the imageUrl const:

exports.createPost = (req, res, next) => {
    ...
    const imageUrl = req.file.path.replace("\\" ,"/");
    ...
} */

/* and in updatePost (once we added that later):

exports.updatePost = (req, res, next) => {
    ...
    imageUrl = req.file.path.replace("\\","/");
} */
