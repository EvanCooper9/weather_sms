var express = require('express');
var router = require('./routes');
var fs = require('fs');
var path = require('path');

var app = express();
var bodyParser = require('body-parser');
var viewPath = path.join(__dirname, '/../views');
app.set('views', viewPath);
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', router);
app.use(express.static('public'));

module.exports = app;