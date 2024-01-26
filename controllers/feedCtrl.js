const { validationResult } = require('express-validator')

const fs = require('fs')
const path = require('path')

const Post = require('../Model/Posts')
const User = require('../Model/User.js')

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1
  //handling pagination
  const perPage = 2

  let totalItems
  // determine number of items in database,

  try {
    // Await the countDocuments promise to resolve and store its result in `count`
    const count = await Post.find().countDocuments()
    totalItems = count // Assign the result to `totalItems`

    // Await the find promise to resolve and store its result in `posts`
    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage)

    // If `posts` is truthy, send a JSON response with the posts and totalItems
    if (posts) {
      res.status(200).json({
        message: 'Fetched posts successfully',
        posts: posts,
        totalItems: totalItems,
      })
    }
  } catch (err) {
    // If an error occurs in the try block, it is caught here
    if (!err.statusCode) {
      statusCode = 500 // If there's no statusCode, set it to 500
    }
    next(err) // Pass the error to the next middleware
  }
}
// names in frontend and backend must match!

exports.createPost = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, data entered is incorrect')
    error.statusCode = 422
    throw error
  }

  if (!req.file) {
    const error = new Error('No image provided')
    error.statusCode = 422
    throw error
  }

  const { title, content } = req.body
  const imageUrl = req.file.path.replace('\\', '/')
  let creator

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  })

  post
    .save()
    .then((result) => {
      return User.findById(req.userId)

        .then((user) => {
          creator = user
          user.posts.push(post)
          return user.save()
        })

        .then((result) => {
          res.status(201).json({
            message: 'Post created successfully',
            post: post,
            creator: {
              _id: creator._id,
              name: creator.name,
            },
          })
        })
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.getSinglePost = (req, res, next) => {
  const postId = req.params.postId

  Post.findById(postId)

    .then((post) => {
      if (!post) {
        const error = new Error('Could not find post.')
        error.statusCode = 404
        throw error
      }
      res.status(200).json({ message: 'Post fetched.', post: post })
    })

    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      res.status(err.statusCode).send({ message: err.message }) // Send a response back to the client
      next(err)
    })
}

exports.updatePosts = (req, res, next) => {
  const postId = req.params.postId
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, data entered is incorrect')
    error.statusCode = 422
    throw error
  }
  // validate before requesting for input

  const { title, content } = req.body
  // basicallly requesting for title and content from the body/ extracting. The body being the form where the data is entered

  let imageUrl = req.body.image

  //then we also check if its a file apart from being a string
  if (req.file) {
    imageUrl = req.file.path.replace('\\', '/')
  }

  if (!imageUrl) {
    const error = new Error('No image provided')
    error.satusCode = 422
    throw error
  }

  Post.findById(postId)

    .then((post) => {
      if (!post) {
        const error = new Error('Could not find post.')
        error.statusCode = 404
        throw error
      }

      if (post.creator?.toString() !== req.userId) {
        const error = new Error('Not Authorized')
        error.statusCode = 403
        throw error
      }

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl)
      }

      post.title = title
      post.imageUrl = imageUrl
      post.content = content

      return post.save()
    })
    .then((result) => {
      res.status(200).json({
        message: 'Post updated',
        post: result,
      })
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      res.status(err.statusCode).send({ message: err.message }) // Send a response back to the client
      next(err)
    })
}

exports.deletePosts = async (req, res, next) => {
  const postId = req.params.postId

  try {
    const post = await Post.findById(postId)

    if (!post) {
      const error = new Error('Post not found.')
      error.statusCode = 404
      return res.status(error.statusCode).json({ message: error.message })
    }

    if (post.creator?.toString() !== req.userId) {
      const error = new Error('Not Authorized')
      error.statusCode = 403
      return res.status(error.statusCode).json({ message: error.message })
    }

    clearImage(post.imageUrl)

    const result = await Post.findByIdAndDelete(postId)

    const user = await User.findById(req.userId)
    user.posts.pull(postId)
    await user.save()
    /* if not using 'then' then await should follow every important ddatabse action */

    if (result) {
      return res.status(200).json({ message: 'Post deleted successfully' })
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }

    return res.status(err.statusCode).json({ message: err.message })
  }
}

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath)
  fs.unlink(filePath, (err) => {
    console.log(err)
  })
}

// using a then block to delete

/* 
exports deletePosts= (req, res, next) =>{
  const postId= req.params.postId

return Post.findById(postId)
    .then((post) => {
      if (!post) {

        const error = new Error('Could not find post')
        error.statusCode = 404
        throw error
        
      }

      clearImage(post.imageUrl)

      return Post.findByIdAndDelete(postId)
    })
    .then((result) => {
    return User.findById(req.userid)
        })
        .then(user=>{
          user.posts.pull(postId)
          return user.save()
        })
    .then(result=>{
      res.status(200).json({
        message: 'Post deleted',

      })
    })
    .catch((err) => {

      if (!err.statusCode) {
        err.statusCode = 500 // Corrected typo here
      }
      
      res.status(err.statusCode).send({ message: err.message })
      next(err)
    })
}
  */

/*  post: {
          _id: new Date().toISOString(),

          createdAt: new Date().toISOString,
        }, */

//previousily how we got post in the get post function
/* res.status(200).json({
    posts: [
      {
        _id: ' 1',
        title: 'First post',
        content: 'Content of the first post',
        imageUrl: '',
        creator: {
          name: 'Felix',
        },
        createdAt: new Date().toISOString(),
      },
    ],
  }) */

//FOR GETTING ALL THE POSTS
//USING PROMISES
/*  Post.find()
    .countDocuments.then((count) => {
      totalItems = count
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
    })
    .then((posts) => {
      res.status(200).json({
        message: 'Fetched posts successfully',
        posts: posts, // Changed from 'post' to 'posts' to match the expected array
        totalItems: totalItems,
      })
    })
    .cacth((err) => {
      if (err.statusCode) {
        statusCode = 500
      }
      next(err)
    }) */
