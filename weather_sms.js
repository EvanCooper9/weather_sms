// weaher_sms.js
var fs = require('fs');
var path = require('path');
var http = require('http');

// Load in required data and API information
var appDataPath = path.join(__dirname, '/data/appData')
var appData = require(appDataPath);
var systime = appData.systime;

// Setup incoming server.
// Allows clients to request weather information on demand.
var app = require(path.join(__dirname, '/server/app'));
var port = process.env.PORT || '3000';
app.set('port', port);

var server = http.createServer(app);
server.listen(port);
console.log('weather_sms server listening on ' + port);

systime.start();
console.log('weather_sms is now running');