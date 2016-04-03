// weather_sms.js
// Evan Cooper

var fs = require('fs');
var http = require('http');

// Setup te log file
var Console = require('console').Console;
var logStream = fs.createWriteStream('./logs/0000_boot.txt');
var myConsole = new Console(logStream);

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
var userData;
try {
	var file = './data/userData.json';
	userData = JSON.parse(fs.readFileSync(file, 'utf-8'));
} catch (e) {
	myConsole.log("No user data.. killing weather_sms");
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

var sendMessage = function(account) {
	openWeatherMap.now({id: account['cityId'], appid: weatherPatams['appid'], units: 'metric'}, function(err, data) {
 		var textString = '\nAutomatic weather: ' + data['name'] + '\n';
		textString += 'Current: ' + data['main']['temp'] + ', ' + data['weather'][0]['description'];
		textString += '\nHigh: ' + data['main']['temp_max'];
		textString += '\nLow: ' + data['main']['temp_min'];

		client.messages.create({
			body: textString,
			to: account['number'],
			from: credentials['twilio']['phoneNumber']
			}, 
			function(message) {
				myConsole.log('Weather sent to: ' + account['name'] + " - " + account['number']);
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

	userData['accounts'].forEach(function(someAccount) {
		someAccount['alerts'].forEach(function(someAlert) {
			if (dateDay === someAlert['day'] && dateHour + dateMinute == someAlert['time']) {
				sendMessage(someAccount);
			}
		});
	});
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