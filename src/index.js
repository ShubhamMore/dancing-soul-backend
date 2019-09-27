const path = require("path");
const express = require('express')
const bodyParser = require("body-parser");
require('./database/mongoose')

const sendMail = require("./mail/mail")
const aboutRouter = require('./routers/about.route')
const articleRouter = require('./routers/article.route')
const attendanceRouter = require('./routers/attendance.route')
const branchRouter = require('./routers/branch.route')
const enquiryRouter = require('./routers/enquiry.route')
const examRouter = require('./routers/exam.route')
const facultyRouter = require('./routers/faculty.route')
const galleryRouter = require('./routers/gallery.router')
const newsRouter = require('./routers/news.route')
const receiptRouter = require('./routers/receipt.route')
const studentRouter = require('./routers/student.route')
const userRouter = require('./routers/user.route')

const app = express()
const port = process.env.PORT

app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

app.use(bodyParser.json());

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(aboutRouter)
app.use(articleRouter)
app.use(attendanceRouter)
app.use(branchRouter)
app.use(enquiryRouter)
app.use(examRouter)
app.use(facultyRouter)
app.use(galleryRouter)
app.use(newsRouter)
app.use(receiptRouter)
app.use(studentRouter)
app.use(userRouter)

app.use((req, res, next) => {
  const error = new Error('NOT FOUND')
  error.status = 404
  next(error)
})
app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({
      error: {
          message: error.message
      }
  })
})

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})