const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');

require('./database/mongoose');

const aboutRouter = require('./routers/about.route');
const articleRouter = require('./routers/article.route');
const attendanceRouter = require('./routers/attendance.route');
const certificateRouter = require('./routers/certificate.route');
const careerRouter = require('./routers/career.route');
const contentRouter = require('./routers/content.route');
const contactRouter = require('./routers/contact.route');
const dashboardRouter = require('./routers/dashboard.route');
const branchRouter = require('./routers/branch.route');
const enquiryRouter = require('./routers/enquiry.route');
const examRouter = require('./routers/exam.route');
const facultyRouter = require('./routers/faculty.route');
const galleryRouter = require('./routers/gallery.router');
const newsRouter = require('./routers/news.route');
const receiptRouter = require('./routers/receipt.route');
const studentRouter = require('./routers/student.route');
const identityRouter = require('./routers/identity.roure');
const userRouter = require('./routers/user.route');

const app = express();

app.use(express.json());
app.use(cors());
app.use(compression());

app.use('/log', express.static(path.join('log')));
app.use('/images', express.static(path.join('images')));
app.use('/fileToUpload', express.static(path.join('fileToUpload')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// NOSQL INJECTION
app.use(mongoSanitize());

// to replace prohibited characters with '_':
app.use(
  mongoSanitize({
    replaceWith: '_'
  })
);

// Prevents HTML Code in Input Fields
app.use(xss());

// Prevents HTTP Parameter Pollution, i.e. Duplicate Parameter in Query String
app.use(hpp());

// Helmet helps you secure your Express apps by setting various HTTP headers
app.use(helmet());

// HTTP request logger
app.use(
  morgan('combined', {
    stream: fs.createWriteStream(
      path.join(__dirname, '..', 'log', 'access.log'),
      {
        flags: 'a'
      }
    )
  })
);

// To Limit Incomming request from same IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);

app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use(aboutRouter);
app.use(articleRouter);
app.use(attendanceRouter);
app.use(certificateRouter);
app.use(careerRouter);
app.use(contentRouter);
app.use(contactRouter);
app.use(dashboardRouter);
app.use(branchRouter);
app.use(enquiryRouter);
app.use(examRouter);
app.use(facultyRouter);
app.use(galleryRouter);
app.use(newsRouter);
app.use(receiptRouter);
app.use(studentRouter);
app.use(identityRouter);
app.use(userRouter);

app.use((req, res, next) => {
  const error = new Error('NOT FOUND');
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
