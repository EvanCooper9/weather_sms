# weather_sms
Scheduled weather notifications via SMS

##About
weather_sms is a pure javascript app that sends scheduled text messages containing weather information. It integrates both [Twilio](https://www.twilio.com) for SMS and [OpenWeatherMap](http://openweathermap.org) for weather. With Node.js and express, weather_sms runs as a standalone server to send messages.

Currently, it runs on an [Onion Omega](https://onion.io).

##Dependencies
Simply run `npm install` within the project directory to install the following npm packages:
- [twilio](https://www.npmjs.com/package/twilio) v2.9.0
- [openweathermap](https://www.npmjs.com/package/openweathermap) v1.0.0
- [systime](https://www.npmjs.com/package/systime) v0.2.0
- [express](https://www.npmjs.com/package/express) v4.13.4

##Getting Started
Simply run `node weather_sms.js` within the project directory.

##User Data
Notification data is stored in JSON format, and is located in the `./data` directory.

###Account
Accounts are stored (in an array key-value paired to `accounts`) as follows:
```
{
  "name" : "Evan",
  "number" : "14161234567",
  "cityId" : 6094817,
  "alerts" : [...]
}
```
Where
- `name` is the name on the account
- `number` is the phone number that messages will be sent to. Must be pre-fixed with the number's country code
- `cityId` is the ID if the city wich weather information is gathered for. See [here](http://openweathermap.org/current#cityid) for more information
- `alerts` is an array of alert objects

###Alert
Alerts are stored (in an array key-value paired to` alerts`) as follows:
```
{
  "day" : "Mon",
  "time" : "1345"
}
```
Where
- `day` is the day that the alert is scheduled for. Represented in 3 letters (`Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`)
- `time` is the time, in 24h, that the alert is scheduled for

##API's and Stuff
API credentials are stored in `credentials.JSON`, located in `./data`. You should have your own API keys for Twilio and OpenWeatherMap.

##Next Steps
- Allow clients to respond with SMS to retrieve weather information

##License
MIT License
