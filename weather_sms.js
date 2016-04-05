// weather_sms.js
// Evan Cooper

var fs = require('fs');
var http = require('http');

// Setup the log file
var Console = require('console').Console;
var logStream = fs.createWriteStream('./logs/0000_boot.txt');
var myConsole = new Console(logStream);

// Load the credentials file.
var credentials;
try {
	var file = './data/credentials.json';
	credentials = JSON.parse(fs.readFileSync(file, 'utf-8'));
} catch (e) {
	console.log("No credentials.. killing weather_sms");
	process.exit();
}

// Load the accounts file.
var userData;
try {
	var file = './data/userData.json';
	userData = JSON.parse(fs.readFileSync(file, 'utf-8'));
} catch (e) {
	console.log("No user data.. killing weather_sms");
	process.exit();
}

// Setup the forecast.io API with credentials
// Powered by Forecast - forecast.io
var Forecast = require('forecast');
var forecast = new Forecast({
	service: 'forecast.io',
	key: credentials['forecast.io']['APIKey'],
	units: 'celcius',
	cache: false,
	ttl: {
		minutes: 27,
		seconds: 45
	}
});


// Setup Twilio API with credentials.
// https://www.npmjs.com/package/twilio
var twilio = require('twilio');
var client = new twilio.RestClient(credentials['twilio']['accountSID'], credentials['twilio']['authToken']);

var sendMessage = function(account, weatherData) {
	var textString = '\nAutomatic weather: ' + account['city'] + '\n';
	textString += 'Current: ' + Math.round(weatherData['currently']['temperature']) + ', ' + weatherData['currently']['summary'];
	textString += '\nHigh: ' + Math.round(weatherData['daily']['data'][0]['temperatureMax']);
	textString += '\nLow: ' + Math.round(weatherData['daily']['data'][0]['temperatureMin']);

	client.messages.create({
		body: textString,
		to: account['number'],
		from: credentials['twilio']['phoneNumber']
		}, 
		function(message) {
			myConsole.log('Weather sent to: ' + account['name'] + " for " + account['city']);
		}
	);
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

	var weatherToFetch = {}

	// Populate the weather fetching queue with accounts that need notifying
	userData['accounts'].forEach(function(someAccount) {
		someAccount['alerts'].forEach(function(someAlert) {
			if (dateDay === someAlert['day'] && dateHour + dateMinute == someAlert['time']) {
				if (weatherToFetch.hasOwnProperty(someAccount['city'])) {
					weatherToFetch[someAccount['city']].push(someAccount);
				} else {
					weatherToFetch[someAccount['city']] = [someAccount];
				}
			}
		});
	});

	// Retrieve weather data once per unique city ID, and send appropriate messages
	for (city in weatherToFetch) {
		if (weatherToFetch.hasOwnProperty(city)) {

			if (userData['cities'].hasOwnProperty(city)) {
				forecast.get([userData['cities'][city]['lat'], userData['cities'][city]['long']], function(err, data) {
					if (!err) {
						weatherToFetch[city].forEach(function(someAccount) {
							sendMessage(someAccount, data);
						});
					}
				});
			}
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
	var file = './data/userData.json';
	userData = JSON.parse(fs.readFileSync(file, 'utf-8'));
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