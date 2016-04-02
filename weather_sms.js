// weather_sms.js
// Evan Cooper

var fs = require('fs');
var http = require('http');

// Setup te log file
var Console = require('console').Console;
var logStream = fs.createWriteStream('./logs/0000_boot.txt');
var myConsole = new Console(logStream);

// Load the alert schedule file.
var alertTimes;
try {
	var file = './data/alertTimes.json';
	alertTimes = JSON.parse(fs.readFileSync(file, 'utf-8'));
} catch (e) {
	myConsole.log('No alert times.. killing weather_sms');
	process.exit();
}

// Load the credentials file.
var credentials;
try {
	var file = './data/credentials.json';
	credentials = JSON.parse(fs.readFileSync(file, 'utf-8'));
} catch (e) {
	myConsole.log("No credentials.. killing weather_sms");
	process.exit();
}

// Load the accounts file.
var accounts;
try {
	var file = './data/accounts.json';
	accounts = JSON.parse(fs.readFileSync(file, 'utf-8'));
} catch (e) {
	myConsole.log("No accounts.. killing weather_sms");
	process.exit();
}

// Setup OpenWeatherMap API with credentials.
// https://www.npmjs.com/package/openweathermap
var openWeatherMap = require('openweathermap')
var weatherPatams = {
	'appid' : credentials['openweathermap']['appid']
}

// Setup Twilio API with credentials.
// https://www.npmjs.com/package/twilio
var twilio = require('twilio');
var client = new twilio.RestClient(credentials['twilio']['accountSID'], credentials['twilio']['authToken']);

// Setup incoming server - Currently disabled. Enable below.
var port = 9902;
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

var weather_request = function(req) {
	params['location'] = accounts[req.query.From]['city'];
	weather(params, function(data) {
		var textString = '\nAutomatic weather: ' + accounts[req.query.From['city']] + '\n';
		textString += 'Current: ' + data.temp + ', ' + data.text + '\nHigh: ' + data.high + '\nLow: ' + data.low;
	
		client.messages.create({
			body: textString,
			to: req.query.From,
			from: credentials['twilio']['phoneNumber']
			}, 
			function(message) {
				req.respond();
				myConsole.log('Weather sent to: ' + accounts[req.query.From]['name'] + " - " + req.query.From + '\n');
			}
		);
	});	
}

app.get('/data', function (req, res) {
	weather_request(req);
});

var serverUp = function() {
	console.log("weather_sms listening on port " + port);
}

// Uncomment to enable incoming server.
/*
var server = http.createServer(app);
server.listen(port);
server.on('listening', serverUp);
*/

var sendMessage = function(recepient) {
	openWeatherMap.now({id: accounts[recepient]['cityId'], appid: weatherPatams['appid'], units: 'metric'}, function(err, data) {
 		var textString = '\nAutomatic weather: ' + data['name'] + '\n';
		textString += 'Current: ' + data['main']['temp'] + ', ' + data['weather'][0]['description'];
		textString += '\nHigh: ' + data['main']['temp_max'];
		textString += '\nLow: ' + data['main']['temp_min'];

		client.messages.create({
			body: textString,
			to: recepient,
			from: credentials['twilio']['phoneNumber']
			}, 
			function(message) {
				myConsole.log('Weather sent to: ' + accounts[recepient]['name'] + " - " + recepient);
			}
		);
	})
}

// Setup Systime for time based actions
// https://www.npmjs.com/package/systime
var Systime = require('systime');
var systime = new Systime();

systime.on('minute', function(date) {
	var dateDay = date.toString().substring(0,3);
	var dateHour = date.toString().substring(16, 18);
	var dateMinute = date.toString().substring(19, 21);

	myConsole.log(date);

	for (var i = 0; i < alertTimes['size']; i++) {
		if (dateDay === alertTimes[i]['day'] && dateHour + dateMinute === alertTimes[i]['time']) {
			console.log("found alert")
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
	console.log(date);
});
*/

systime.on('day', function(date) {
	// Create a new log file
	var dateString = date.toString().substring(4, 15);
	myConsole = new Console(fs.createWriteStream('./logs/' + dateString + '.txt'));

	// Re-load the alert time data
	var file = './data/alertTimes.json';
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