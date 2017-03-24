var mqtt    = require('mqtt');
var Barcli = require("barcli");
var HashMap = require("hashmap");
var settings = require('./settings');

var barcliHash = new HashMap();
var botNameRegex = /get\/bots\/(.*)\/pot/;

var mqttClient  = mqtt.connect(settings.mqttURL);

mqttClient.on('connect', function () {
   console.log('connected');
   mqttClient.subscribe('get/bots/+/pot');
});

mqttClient.on('message', function (topic, message) {

   // extract the name from the topic
   // get/bots/[bot name]/[topic key]
   topic.replace(botNameRegex, function(match, botName) {
      // lookup the name
      var barGraph = barcliHash.get(botName);
      if (barGraph === undefined) {
         barGraph = new Barcli( { label: botName, range: [0,100] } );
         barcliHash.set(botName, barGraph);
      }
      barGraph.update(parseInt(message.toString()));
   });
});
