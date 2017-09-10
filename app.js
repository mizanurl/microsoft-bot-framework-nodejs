var builder = require('botbuilder');
var restify = require('restify');
var apiairecognizer = require('api-ai-recognizer');
var request = require('request');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
	console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID,
	appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector);

// Client access token from api.ai
var recognizer = new apiairecognizer("77eaa15906704947a7f481f4d51f1cf5");

var intents = new builder.IntentDialog({
	recognizers: [recognizer]
});

bot.dialog('/',intents);

intents.matches('whatIsWeather',[ function(session,args){
	var city = builder.EntityRecognizer.findEntity(args.entities,'cities');

	if (city) {
		var city_name = city.entity;
		var url = "http://api.apixu.com/v1/current.json?key=7e212e10586f48b2bc313623170909&q=" + city_name;

		request(url,function(error,response,body) {
			body = JSON.parse(body);
			//console.log(body);
			temp = body.current.temp_c;
			session.send("It's " + temp + " degree celsius in " + city_name); });
	} else {
		builder.Prompts.text(session, 'Which city do you want the weather for?');
	}
}, function(session,results){
	var city_name = results.response;
	var url = "http://api.apixu.com/v1/current.json?key=7e212e10586f48b2bc313623170909&q=" + city_name;
	request(url,function(error,response,body) {
		body = JSON.parse(body);
		//console.log(body);
		temp = body.current.temp_c;
		session.send("It's " + temp + " degree celsius in " + city_name);
	});
} ]);