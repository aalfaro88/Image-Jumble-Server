//server/app.js

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require('mongoose');
var cors = require('cors');

var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var projectRoutes = require('./routes/projectRoutes');
var layerRoutes = require('./routes/layerRoutes');
var imageRoutes = require('./routes/imageRoutes');
var randomizeRoutes = require('./routes/randomizeRoutes')
var deleteCloudinaryFolderRoute = require("./routes/deleteCloudinaryFolder");
var paymentRoutes = require('./routes/paymentRoutes');
var matrixRoutes = require('./routes/matrixRoutes')



var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1);
app.enable('trust proxy');

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, same-origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
  next();
});

app.use(cors())

app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/projects', projectRoutes);
app.use('/projects/:projectId/layers', layerRoutes);
app.use('/', imageRoutes); 
app.use('/', randomizeRoutes);
app.use("/delete-cloudinary-folder", deleteCloudinaryFolderRoute);
app.use('/', paymentRoutes); 
app.use('/',matrixRoutes);


mongoose
  .connect(process.env.MONGODB_URI)
  .then((x) => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
  })
  .catch((err) => {
    console.error("Error connecting to mongo: ", err);
  });

module.exports = app;
