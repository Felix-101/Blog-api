const User = require('../Model/User')

const { validationResult } = require('express-validator')

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

exports.signUp = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    error.data = errors.array()
    throw error
  }

  const { email, password, name } = req.body

  bcrypt
    .hash(password, 12)
    .then(async (hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name,
      })

      const result = await user.save()
      if (result) {
        res.status(201).json({
          message: 'User created',
          userId: result._id,
        })
      }

      /* using a promise
      return user.save()
      .then((result) => {
        res.status(201).json({
          message: 'User created',
          userId: result._id,
        })
      }) */
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      res.status(statusCode).send({
        message: err.message,
      })
      next(err)
    })
}

exports.login = (req, res, next) => {
  const { email, password } = req.body

  let loadedUser

  User.findOne({
    email: email,
  })
    .then((user) => {
      if (!user) {
        const error = new Error('User could not be found')
        error.statusCode = 401
        throw error
      }
      loadedUser = user
      return bcrypt.compare(password, user.password).then((isEqual) => {
        if (!isEqual) {
          const error = new Error('Wrong password')
          error.statusCode = 401
          throw error
        }
        const token = jwt.sign(
          {
            email: loadedUser.email,
            userId: loadedUser._id.toString(),
          },

          'somesupersecret',

          { expiresIn: '1h' }
        )
        res.status(200).json({
          token,
          userId: loadedUser._id.toString(),
        })
        // do not store the raw password here because it will be rturned to the frontend, you pass a secret as the second arguement so that private key which is used for signing and that is now only known to the server and therefore you can't fake that token on the client.
      })
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      res.status(statusCode).send({
        message: 'Login failed',
      })
      next(err)
    })
}

exports.getUserStatus = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error('User not found')
        error.statusCode = 404
        throw error
      }
      res.status(200).json({
        status: user.status,
      })
    })
    .catch((err) => {
      if (!err.statusCode) {
        statusCode = 500
      }
      res.status(statusCode).send({
        message: err.message,
      })
      next(err)
    })
}

exports.updateUserStatus = (req, res, next) => {
  const newStatus = req.body.status

  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error('User not found')
        error.statusCode = 404
        throw error
      }

      user.status = newStatus

      return user.save()
    })
    .then((result) => {
      res.status(200).json({
        message: 'User updated',
      })
    })
    .catch((err) => {
      if (!err.statusCode) {
        statusCode = 500
      }
      res.status(statusCode).send({
        message: err.message,
      })
      next(err)
    })
}
