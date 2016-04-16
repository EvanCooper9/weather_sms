# [weather_sms](http://evancooper9.github.io/weather_sms)
Scheduled weather notifications via SMS

##About
A pure javascript app that sends scheduled text messages containing weather information. In terms of APIs, It integrates [Twilio](https://www.twilio.com) for SMS messaging and is powered by [Forecast.io](http://forecast.io/) weather information. With Node.js, weather_sms runs as a standalone application to send messages.

Currently, it runs on an [Onion Omega](https://onion.io).

##Goals
With this project, I aim to build a diverse web and cloud enabled application that explores the content I'm learning in school, and more. I want to further familiarize myself with today and tomorrow's modern technologies, specifically mobile platforms and the web. This may have the potential to become my Honours project for my final year of university, but we'll take it one step at a time. 

##Getting Started
Install package dependencies using npm:
- [twilio](https://www.npmjs.com/package/twilio) v2.9.0
- [forecast](https://www.npmjs.com/package/forecast) v0.2.1
- [systime](https://www.npmjs.com/package/systime) v0.2.0
```
npm install
```

Finally, simply run `weather_sms.js` with `node`:
```
node weather_sms.js
> weather_sms is now running
```


However, it is recommended that weather_sms be ran through [screen](https://www.gnu.org/software/screen/manual/screen.html), to detach the process from the shell. After weather_sms is running, you should use `screen`'s detach feature to allow the process to keep running, even if you kill the terminal.

An example here:
```
screen
node weather_sms.js
> weather_sms is now running

ctr + a, d
>[detached]
```

##User Data
Notification data is stored in JSON format, and is located in the `./data` directory. User accounts are stored as JSON objects in an array key-value paired to `accounts`. Geographic locations, or cities, are stored similarly.

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
  "cityId" : 6094817,
  "alerts" : [ ]
}
```
Where
- `name` is the name on the account
- `number` is the phone number that messages will be sent to. Must be pre-fixed with the number's country code
- `cityId` is the ID if the city wich weather information is gathered for. See [here](http://openweathermap.org/current#cityid) for more information
- `alerts` is an array of alert objects

####Alerts
Alerts are stored (in an array key-value paired to` alerts`) as follows:
```JSON
{
  "day" : "Mon",
  "time" : "1345"
}
```
Where
- `day` is the day that the alert is scheduled for. Represented in 3 letters (`Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`)
- `time` is the time, in 24h, that the alert is scheduled for

###Cities
City data is stored within the `cities` as key-value pairings, where the name of the city is the key, and an object containing the latitude and longitude information is the value:

```JSON
"Ottawa" : {
  "lat" : 45.4215,
  "long" : -75.6972
}
```

##API's and Stuff
API credentials are stored in `credentials.JSON`, located in `./data`. You should have your own API keys for Twilio and OpenWeatherMap. Additionally for Twilio, weather_sms requires your Twilio phone number associated with your API key to be stored in the credentials file.

All API data is stored as follows:
```JSON
{
  "twilio" : {
    "accountSID" : "twilio_accountSID",
    "authToken" : "twilio_authToken",
    "phoneNumber" : "twilio_phoneNumber"
  },
  "openweathermap" : {
    "appid" : "openweathermap_appid"
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

##New Features
- Optimized API call frequency. Weather data is only downloaded once per distinct location, and is sent to the appropriate accounts during scheduled messaging.
- Changed weather API provider from OpenWeatherMap to Forecast.io

##Next Steps
- Allow clients to respond with SMS to retrieve weather information
- Allow clients to sign-up and edit their profile by sending a text message
- Build a web app interface
- Build mobile interfaces

##License
MIT License
