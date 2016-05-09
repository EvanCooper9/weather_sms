var express = require('express');
var router = express.Router();

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
			//myConsole.log('Weather sent to: ' + account['name'] + " for " + account['city']);
		}
	);
}

router.get('/sms_req', function(req, res) {
	if (req.query.Body === 'weather' || req.query.Body == 'Weather') {
		userData['accounts'].forEach(function (someAccount) {
			if (someAccount['number'] === (req.query.From).replace('+', '')) {
				forecast.get([userData['cities'][someAccount['city']]['lat'], userData['cities'][someAccount['city']]['long']], function(err, data) {
					if (!err) {
						sendMessage(someAccount, data);
					}
				});
			}
		});
	}
});

router.get('/', function(req, res) {
	res.render('index', {headerText: "header", contentText: "content"})
})

module.exports = router;