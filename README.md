# [weather_sms](http://evancooper9.github.io/weather_sms)
Scheduled weather notifications via SMS

##About
A pure javascript app that sends scheduled text messages containing weather information. It integrates both [Twilio](https://www.twilio.com) and [OpenWeatherMap](http://openweathermap.org) for SMS messaging and weather information. With Node.js, weather_sms runs as a standalone application to send messages.

Currently, it runs on an [Onion Omega](https://onion.io).

##Getting Started
Install package dependencies using npm:
- [twilio](https://www.npmjs.com/package/twilio) v2.9.0
- [openweathermap](https://www.npmjs.com/package/openweathermap) v1.0.0
- [systime](https://www.npmjs.com/package/systime) v0.2.0
```
npm install
```

Finally, simply run `weather_sms.js` with `node`:
```
node weather_sms.js
> weather_sms is now running
```

##User Data
Notification data is stored in JSON format, and is located in the `./data` directory. For convenience, all data is stored in an array which is key-value paird to `accounts`. In future, more data other than the account information may be stored in the JSON file.

```JSON
{
  "accounts" : [  ]
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

###Alerts
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

##Next Steps
- Optimize API call frequency. Curently, weather data is retrieved for every scheduled alert. Alerts scheduled for the same time and day should use the same weather data
- Allow clients to respond with SMS to retrieve weather information
- Allow clients to sign-up and edit their profile by sending a text message

##License
MIT License
