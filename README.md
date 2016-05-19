#weather_sms
Weather notifications via SMS

##About
A pure javascript app that sends scheduled text messages containing weather information. In terms of APIs, It integrates [Twilio](https://www.twilio.com) for SMS messaging and is powered by [Forecast.io](http://forecast.io/) weather information. With Node.js, weather_sms runs as a standalone application/server to send/receive messages.

Currently, it runs on an [Onion Omega](https://onion.io). Omega's own node binary requires the use of [forever](https://www.npmjs.com/package/forever) to force the program to run continuously. In my case, I'm using a binary different than the one officially supported by the Onion Omega. I'm able to use less of the very limited resources.

##Goals
With this project, I aim to build a diverse web and cloud enabled application that explores the content I'm learning in school, and more. I want to further familiarize myself with today and tomorrow's modern technologies, specifically mobile platforms and the web. This may have the potential to become my Honours project for my final year of university, but we'll take it one step at a time. It's also something to keep me busy.

##What's New?
###On-demand Weather
Users can now request on-demand weather updates, rather than just having scheduled alerts. To get a weatehr update, the user simply has to text `weather` (case insensitive) to the number that sends them weather updates. They will then get a weather update with the current weather for their location
```
User:
Weather

weather_sms:
Automatic weather: Ottawa, ON, Canada
Current: 22, Clear
High: 23
Low: 5
```

###Changing Location
Additionally, users can change their location by simply texing `location` (case insensitive) to the number that sends them weather updates. This functionality uses twilio's request parameters along with google's geocoding API in order to fetch a user's location by name. If multiple locations exist with the same namme, the user will be prompted to choose one. Example below.
```
User:
Location

weather_sms:
Multiple locations matching your location name:
0. Ottawa, ON, Canada
1. Ottawa, IL 61350, USA
2. Ottawa, KS 66067, USA
3. Ottawa, OH 45875, USA
Reply with desired location number.

User:
1

weather_sms:
Your location has been changed to: Ottawa, ON, Canada
```

##Getting Started
Install package dependencies using npm:
- [twilio](https://www.npmjs.com/package/twilio)
- [forecast](https://www.npmjs.com/package/forecast)
- [systime](https://www.npmjs.com/package/systime)
- [express](https://www.npmjs.com/package/express)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [morgan](https://www.npmjs.com/package/morgan)
- [forever](https://www.npmjs.com/package/forever) **optional** 
```
npm install
```

Finally, simply run `weather_sms.js` with `node`.
To specify the port for the incoming server, set the `PORT` environment variable. Without this, port 3000 is used as default. I personally use `screen` to detach the porcess from the shell in order to run the program forever.
```
node weather_sms.js
> weather_sms server listening on 3000
> weather_sms is now running
```
```
PORT=9999 node weather_sms.js
> weather_sms server listening on 9999
> weather_sms is now running
```

##User Data
All user-related data is stored in `userData.json`, and is located in the `./data` directory. User accounts are stored as JSON objects in an array named `accounts`. Geographic locations, or cities, are stored similarly.

```JSON
{
	"accounts" : [  ],
	"cities" : { }
}
```

###Accounts
Accounts are stored as follows:
```JSON
{
	"name" : "Evan",
	"number" : "14161234567",
	"city" : "Ottawa, ON, Canada",
	"alerts" : [ ]
}
```
Where
- `name` is the name on the account
- `number` is the phone number that messages will be sent to. Must be pre-fixed with the number's country code
- `city` is the city name as per Google's geocoding records.
- `alerts` is an array of alert objects

####Alerts
Alerts for each account are stored in an array named `alerts` as follows:
```JSON
{
	"day" : "Mon",
	"time" : "1345"
}
```
Where
- `day` is the day of the alert. Represented in 3 letters (`Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`)
- `time` is the time of the alert, in 24hrs

###Cities
City data is stored within the `cities` as key-value pairings, where the name of the city is the key, and an object containing the latitude and longitude information is the value:

```JSON
"Ottawa, ON, Canada" : {
	"lat" : 45.4215,
	"lng" : -75.6972
}
```

##API's and Stuff
API credentials are stored in `credentials.JSON`, located in `./data`. You should have your own API keys for Twilio, Forecast.io and Google. Additionally for Twilio, weather_sms requires your Twilio phone number associated with your API key to be stored in the credentials file.

All API data is stored as follows:
```JSON
{
	"twilio" : {
		"accountSID" : "twilio_accountSID",
		"authToken" : "twilio_authToken",
		"phoneNumber" : "twilio_phoneNumber"
	},
	"forecast.io" : {
		"APIKey" : "forecast.io_APIKey"
	},
	"googleGeocoding" : {
		"APIKey" : "googleGeocoding_APIKey"
	}
}
```

##Logs
weather_sms logs every minute to a .txt file in `./logs`.
On start, weather_sms creates a new log file, `000_boot.txt`. Everyday, a new log file will be created that includes the date it was created in the file name (ex: `Apr 02 2016.txt`).

Log messages are recorded as follows:
```
...
Mon Apr 04 2016 10:53:00 GMT-0400 (EDT)
Mon Apr 04 2016 10:54:00 GMT-0400 (EDT)
Mon Apr 04 2016 10:55:00 GMT-0400 (EDT)
Mon Apr 04 2016 10:56:00 GMT-0400 (EDT)
Mon Apr 04 2016 10:57:00 GMT-0400 (EDT)
...
```

##Next Steps
- Allow clients to sign-up and further edit their profile by sending a text message
- Build a web app interface
- Build mobile interfaces

##License
MIT License
