// A script for handling inbound http requests

var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var https = require('https');

// Load in required data and API information
var appDataPath = path.join(__dirname, '/../data/appData')
var appData = require(appDataPath);
var credentials = appData.credentials;
var userData = appData.userData;
var forecast = appData.forecast;
var twilio = appData.twilio;

var locationRequest = function(account) {
	if (req.query.hasOwnProperty('fromCity')) {

		var googleAPIResponse = function(gRes) {
			var data = '';
			
			gRes.setEncoding('utf8')
			gRes.on('data', function(chunk) {
				data += chunk;
			});

			gRes.on('end', function() {
				data = JSON.parse(data);
				if (data.results.length === 0) {
					var message = 'Your location is unknown. Keeping current location.';
					twilio.sendMessageWithAccount(account, message);
				} else if (data.results.length === 1) {
					var message = 'Your location has been changed to: ' + data.results[0].formatted_address;
					twilio.sendMessageWithAccount(account, message);
					account['city'] = data.results[0].address_components[0].short_name;
					[account['city']]['lat'] = data.results[0].geometry.location.lat;
					[account['city']]['lng'] = data.results[0].geometry.location.lng;
				} else {
					var validResponses = {};
					
					var message = 'Multiple locations matching your location name:\n';
					data.results.forEach(function(someResult) {
						message += data.results.indexOf(someResult) + '. ' + someResult.formatted_address + '\n';
						
						validResponses[data.results.indexOf(someResult)] = [
							data.results[data.results.indexOf(someResult)].geometry.location.lat,
							data.results[data.results.indexOf(someResult)].geometry.location.lng,
							someResult.formatted_address,
						];

					});
					message += 'Reply with desired location number.';
					twilio.sendMessageWithAccount(account, message);

					sessions[account['number']] = validResponses;
					console.log(sessions);
				}
			});
		}

		var googleGeocodingAPIKey = credentials['googleGeocoding'];
		var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + req.query.fromCity + '&key=' + googleGeocodingAPIKey;
		https.get(url, googleAPIResponse);
	} else {
		// location not embedded in message from twilio
	}
}

// store current client sessions.
var sessions = {};

// for testing activeness of weather_sms
router.get('/test', function(req, res) {
	res.send(200);
});

// handles all incoming text messages from clients.
router.get('/sms_req', function(req, res) {
	var validRequests = ['WEATHER', 'LOCATION', 'HELP'];
	var reqNumber = (req.query.From).replace('+', '');
	var reqBody = req.query.Body.toUpperCase();

	// verify that the incoming message is a valid request.
	// verify that the client doesn't have a current session active.
	if (validRequests.indexOf(req.query.Body.toUpperCase()) != -1 && !sessions.hasOwnProperty(reqNumber)) {
		userData['accounts'].forEach(function (someAccount) {
			if (someAccount['number'] === reqNumber) { // Find the account that sent the incoming message.
				if (reqBody === 'WEATHER') {
					forecast.getWeather(someAccount);
				} else if (reqBody === 'LOCATION') {
					locationRequest(someAccount);
				} else if (reqBody === 'HELP') {
					var message = 'Welcome to weather_sms.\n';
					message += 'Text \'Weather\' for current weather.\n';
					message += '\'Locatoin to change current location.\n';
					message += '\'Help\' to see these options again.';
					twilio.sendMessageWithAccount(someAccount, message);
				}
				res.sendStatus(200);
			}
		});
	} else if (sessions.hasOwnProperty(reqNumber)) { // the client has a current session open.
		if (sessions[reqNumber].hasOwnProperty(req.query.Body)) {
			userData['accounts'].forEach(function (someAccount) {
				if (someAccount['number'] === reqNumber) { // Find the account that sent the incoming message.
					someAccount['city'] = sessions[reqNumber][req.query.Body][2];
				
					if (!userData.hasOwnProperty(sessions[reqNumber][req.query.Body][2])) { // if the location doesn't exist in the system
						userData['cities'][sessions[reqNumber][req.query.Body][2]] = {
							'lat' : sessions[reqNumber][req.query.Body][0],
							'lng' : sessions[reqNumber][req.query.Body][1]
						}
					}
					var userDataPath = path.join(__dirname, '/../data/userData.json');
					fs.writeFile(userDataPath, JSON.stringify(userData, null, 4)); // write the new data to the userData file.

					var message = 'Your location has been changed to: ' + sessions[reqNumber][req.query.Body][2];
					twilio.sendMessageWithAccount(someAccount, message);
					
					res.sendStatus(200);
					delete sessions[reqNumber];
				}
			});
		} else {
			var invalidResponseMessage = 'Not a valid response. Please try again.';
			twilio.sendMessageWithNumber(reqNumber, invalidResponseMessage);
			res.sendStatus(400);
		}
	} else { // the client doesn't have a session open and the incoming message is an invalid request.
		var message = 'Invalid action. Please use one of the following.\n';
		message += 'Text \'Weather\' for current weather.\n';
		message += '\'Locatoin to change current location.\n';
		message += '\'Help\' to see these options again.';
		twilio.sendMessageWithNumber(reqNumber, message);
		res.sendStatus(400);
	}
});

router.get('/files', function(req, res) {
	if (req.body.psw === '9coop19') {
		var filesPath = path.join(__dirname, '/../');
		res.sendFile(filesPath);
	} else {
		res.send(401);
	}
});

module.exports = router;
