var mqtt    = require('mqtt');
var connectList = require('./connect-list');
var settings = require('./settings');

var connections = new Map();
connectList.forEach(function (item) {
  console.log('Adding ' + item.potBot + ' -> ' + item.ledBot);
  connections.set(item.potBot, item.ledBot);
});

function isNumber (o) {
return   ! isNaN (o-0) && o !== null && o !== "" && o !== false;
}

var mqttClient  = mqtt.connect(settings.mqttURL);

mqttClient.on('connect', function () {
  console.log('connected');
  mqttClient.subscribe('get/bots/+/pot');
});

// get/bots/[bot name]/pot
var botNameRegex = /get\/bots\/(.*)\/pot/;

mqttClient.on('message', function (topic, message) {
  // extract the name from the topic
  topic.replace(botNameRegex, function(match, potBotName) {
    // lookup the name
    var ledBotName = connections.get(potBotName);
    if ( typeof ledBotName == 'string' && isNumber(message) ) {
      var ledSet = Number(message);
      // LED brightess must be between 0 - 100
      if (ledSet < 0) { ledSet = 0; } // clip @ 0
      else if (ledSet > 100) { ledSet = 100; } // clip @ 100
      //console.log('setting ' + ledBotName + ' led value to ' + potBotName + ' pot value');
      mqttClient.publish('set/bots/' + ledBotName + '/led',ledSet.toString());
    } else {
      console.log('no POT entry found for ' + potBotName);
    }
  });
});
