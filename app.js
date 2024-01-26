require('dotenv').config({ path: './config.env' })
const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid')
const multer = require('multer')

const app = express()

const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')
const connectDb = require('./util/Database')

const port = process.env.PORT || 8080

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images')
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + file.originalname)
  },
})
// control where file gets stored and how the file should be named. cb is a callback with null error and uuidv4 is used to genereate a unique filename
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}
// to check the extension of the image file

app.use(bodyParser.urlencoded({ extended: false }))
// this helps send form data

app.use(bodyParser.json())
// parses the text as JSON and exposes the resulting object on req.body.

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
)

app.use('/images', express.static(path.join(__dirname, 'images')))
// this middleware is for handling static files

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  // the header, and the paths allowed(* means all orign/path/url)

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  // allow the orogins to uses the specific httpMethods, and the specified methods to allow

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  //allow the headers, and the specific kind of headers (Content-type of the request)

  next()
  // Call the next middleware in the stack. If this is the last middleware, it will proceed to route handling middleware
})

app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)

//error handling middleware
app.use((error, req, res, next) => {
  console.log(error)
  const status = error.statusCode || 500
  const message = error.message
  const data = error.data
  res.status(status).json({ message: message, data: data })
})

connectDb()

app.listen(port, () => {
  console.log('Server running succesfully')
})

// rest apis are stateless, so seesions are not stored

/* Using fetch api in your client side code if you are planning on using a post method which is for creating data

fetch('http://localhost:port/feed/post', {
  method:POST,
  body:JSON.stringify({
    title:'kldsnjvbdshv',
    content:'dshfbscjsdb'
  }),
  the Json.stringify converts the js object to json so the brower can see the data

  headers:{
    'Content-Type:'application/json'
  },
  to tell the server that our content-type is of application json
})
.then(res=>res.json())
.then(resData=> console.log(resData))
.catch(err=> console.log(err)) */
