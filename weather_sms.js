// weather_sms.js
// Evan Cooper
//

var fs = require('fs');
var http = require('http');

// https://www.npmjs.com/package/systime
var Systime = require('systime');
var systime = new Systime();

// Setup te log file
var Console = require('console').Console;
var logStream = fs.createWriteStream('/mnt/sda2/weather_sms/logs/0000_boot.txt');
var myConsole = new Console(logStream);

// Load the alert schedule file.
var alertTimes;
try {
	var file = '/mnt/sda2/weather_sms/data/alertTimes_sample.json';
	alertTimes = JSON.parse(fs.readFileSync(file, 'utf-8'));
} catch (e) {
	myConsole.log('No alert times.. killing weather_sms');
	process.exit();
}

// Load the credentials file.
var credentials;
try {
	var file = '/mnt/sda2/weather_sms/data/credentials_sample.json';
	credentials = JSON.parse(fs.readFileSync(file, 'utf-8'));
} catch (e) {
	myConsole.log("No credentials.. killing weather_sms");
	process.exit();
}

// Load the accounts file.
var accounts;
try {
	var file = '/mnt/sda2/weather_sms/data/accounts_sample.json';
	accounts = JSON.parse(fs.readFileSync(file, 'utf-8'));
} catch (e) {
	myConsole.log("No accounts.. killing weather_sms");
	process.exit();
}

// Setup Yahoo Weather API with credentials.
// https://www.npmjs.com/package/weather
var weather = require('weather');
var params = {
	location : '',
	unit     : 'f',
	appid    : credentials['yahoo']['appid'],
	logging  : false
}

// Setup Twilio API with credentials.
// https://www.npmjs.com/package/twilio
var twilio = require('twilio');
var client = new twilio.RestClient(credentials['twilio']['accountSID'], credentials['twilio']['authToken']);

// Setup incoming server - Currently disabled. Enable below.
var express = require('express');
var app = express();
var port = 9902;

var weather_request = function(req) {
	params['location'] = accounts[req.query.From]['city'];
	weather(params, function(data) {
		var textString = '\nAutomatic weather: ' + accounts[req.query.From['city']] + '\n';
		textString += 'Current: ' + data.temp + ', ' + data.text + '\nHigh: ' + data.high + '\nLow: ' + data.low;
	
		client.messages.create({
			body: textString,
			to: req.query.From,
			from: "+12898137265"
			}, 
			function(message) {
				req.respond();
				myConsole.log('Weather sent to: ' + accounts[req.query.From]['name'] + " - " + req.query.From + '\n');
			}
		);
	});
}

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/data', function (req, res) {
	//
});

var serverUp = function() {
	console.log("weather_sms listening on port " + port);
}

// Uncomment to enable incoming server.
//var server = http.createServer(app);
//server.listen(port);
//server.on('listening', serverUp);

// Setup standard scheduling
var sendMessage = function(recepient) {
	params['location'] = accounts[recepient]['city'];
	weather(params, function(data) {
		var textString = '\nAutomatic weather: ' + params['location'] + '\n';
		textString += 'Current: ' + data.temp + '\nHigh: ' + data.high + '\nLow: ' + data.low;
		
		client.messages.create({
			body: textString,
			to: recepient,
			from: "+12898137265"
			}, 
			function(message) {
				myConsole.log('Weather sent to: ' + accounts[recepient]['name'] + " - " + recepient);
			}
		);
	});
}

systime.on('minute', function(date) {
	var dateDay = date.toString().substring(0,3);
	var dateHour = date.toString().substring(16, 18);
	var dateMinute = date.toString().substring(19, 21);

	myConsole.log(date);

	for (var i = 0; i < alertTimes['size']; i++) {
		if (dateDay === alertTimes[i]['day'] && dateHour + dateMinute === alertTimes[i]['time']) {
			var alert = alertTimes[i];
			sendMessage(alert['recepient']);
		}
	}
});

/*
systime.on('second', function(date) {
  console.log(date);
});

systime.on('hour', function(date) {
	var oldAlertTimes = alertTimes;
	try {
		var file = '/mnt/sda2/weather_sms/data/alertTimes.json';
		alertTimes = JSON.parse(fs.readFileSync(file, 'utf-8'));
	} catch (e) {
		alertTimes = oldAlertTimes;
	}
});
*/

systime.on('day', function(date) {
	var dateString = date.toString().substring(4, 15);
	myConsole = new Console(fs.createWriteStream('/mnt/sda2/weather_sms/logs/' + dateString + '.txt'));

	var file = '/mnt/sda2/weather_sms/data/alertTimes.json';
	alertTimes = JSON.parse(fs.readFileSync(file, 'utf-8'));
});

/*
systime.on('week', function() {
  console.log('new week');
});
 
systime.on('month', function() {
  console.log('new month');
});
 
systime.on('year', function() {
  console.log('new year');
});
*/
systime.start();
console.log('weather_sms is now running');

