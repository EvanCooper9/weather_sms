// A script to load required data and instantiate APIs
// Usage is as follows:
//   var appData = require('path/to/this/file/appData');

var path = require('path');
var fs = require('fs');

// Load the credentials file.
var credentials;
try {
	var file = path.join(__dirname, '/../data/credentials.json');
	credentials = JSON.parse(fs.readFileSync(file, 'utf-8'));
} catch (e) {
	console.log("No credentials.. killing weather_sms");
	process.exit();
}

// Load the accounts file.
var userData;
try {
	var file = path.join(__dirname, '/../data/userData.json');
	userData = JSON.parse(fs.readFileSync(file, 'utf-8'));
} catch (e) {
	console.log("No user data.. killing weather_sms");
	process.exit();
}

// Setup the log file
var Console = require('console').Console;
var logPath = path.join(__dirname, '/../logs/0000_boot.txt');
var logStream = fs.createWriteStream(logPath);
var myConsole = new Console(logStream);

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

var getWeather = function(account) {
	var weatherData;
	forecast.get([userData['cities'][someAccount['city']]['lat'], userData['cities'][someAccount['city']]['lng']], function(err, data) {
		if (!err) { weatherData = data; }
	});
	return weatherData;
}

forecast.getWeather = getWeather;

// Setup Twilio API with credentials.
// https://www.npmjs.com/package/twilio
var Twilio = require('twilio');
var twilio = new Twilio.RestClient(credentials['twilio']['accountSID'], credentials['twilio']['authToken']);

// send a new text messges to a specific account with already-gathered weather data.
var sendWeatherMessage = function(account, weatherData) {
	var textString = '\nAutomatic weather: ' + account['city'] + '\n';
	textString += 'Current: ' + Math.round(weatherData['currently']['temperature']) + ', ' + weatherData['currently']['summary'];
	textString += '\nHigh: ' + Math.round(weatherData['daily']['data'][0]['temperatureMax']);
	textString += '\nLow: ' + Math.round(weatherData['daily']['data'][0]['temperatureMin']);

	twilio.messages.create({
		body: textString,
		to: account['number'],
		from: credentials['twilio']['phoneNumber']
		}, 
		function(message) { myConsole.log('Weather sent to: ' + account['name'] + ' for ' + account['city']); }
	);
}

// send a text message when the account is known (preferred).
var sendMessageWithAccount = function(account, message) {
	twilio.messages.create({
		body: message,
		to: account['number'],
		from: credentials['twilio']['phoneNumber']
		},
		function(message) { myConsole.log('Message sent to: ' + account['name'] + ' at ' + account['number']); }
	);
}

// send a text message when only the number is known.
var sendMessageWithNumber = function(number, message) {
	twilio.messages.create({
		body: message,
		to: number,
		from: credentials['twilio']['phoneNumber']
		},
		function(message) { myConsole.log('Message sent to: ' + number); }
	);
}

twilio.sendWeatherMessage = sendWeatherMessage;
twilio.sendMessageWithAccount = sendMessageWithAccount;
twilio.sendMessageWithNumber = sendMessageWithNumber;

// Systime run functions - used for scheduling
// https://www.npmjs.com/package/systime
// Can call on the following:
//   * second
//   * minute
//   * hour
//   * day
//   * week
//   * month
//   * year
var Systime = require('systime');
var systime = new Systime();

// Every minute, check for weather messages that need to be sent
systime.on('minute', function(date) {
	var dateDay = date.toString().substring(0,3);
	var dateHour = date.toString().substring(16, 18);
	var dateMinute = date.toString().substring(19, 21);

	myConsole.log(date);

	var weatherToFetch = {};

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
		weatherToFetch[city].forEach(function (someAccount) {
			var weatherData = forecast.getWeather(someAccount);
			if (weatherData != undefined) { twilio.sendWeatherMessage(someAccount, weatherData); }
		});
	}

});

// Housekeeping everyday
systime.on('day', function(date) {
	// Create a new log file
	var dateString = date.toString().substring(4, 15);
	myConsole = new Console(fs.createWriteStream(path.join(__dirname, '/../logs/' + dateString + '.txt')));

	// Re-load the alert time data
	var appDataPath = path.join(__dirname, '/../data/appData')
	var appData = require(appDataPath);
	var userData = appData.userData;
	var twilio = appData.twilio;
});

exports.credentials = credentials;
exports.userData = userData;
exports.forecast = forecast;
exports.twilio = twilio;
exports.systime = systime;