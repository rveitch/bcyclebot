var express = require('express');
//var bodyParser = require('body-parser');
var request = require('request');
var app = express();

//app.use(bodyParser.urlencoded({extended: false}));
//app.use(bodyParser.json());

/* Custom Variables */
//var ES_Host = (process.env.ELASTIC_URL || 'https://site:fec45077f659f7de428931b20423cbde@dori-us-east-1.searchly.com');
//var ES_Host = (process.env.ELASTIC_URL || 'http://localhost:9200/');
var ES_Host = (process.env.ELASTIC_URL || 'https://3590b9d403c87e0697b6:8c2e5209a1@f08f4b1b.qb0x.com:30242');
var station_information = 'https://gbfs.bcycle.com/bcycle_greatrides/station_status.json';
var station_status = 'https://gbfs.bcycle.com/bcycle_greatrides/station_status.json';
var system_pricing_plans = 'https://gbfs.bcycle.com/bcycle_greatrides/station_status.json';
var catchURL = 'https://hooks.zapier.com/hooks/catch/516104/652m5f/';

/* Elasticsearch Variables */
var elasticsearch = require('elasticsearch');
var elasticClient = new elasticsearch.Client({
	host: ES_Host,
	apiVersion: '2.3'
});
var indexName = 'bcycle_greatrides';

// Server Listen
var port = Number(process.env.PORT || 3000);
app.listen(port, function () {
	console.log('App server is running on http://localhost:' + port);
	clearInterval(interval);
	var interval = setInterval(function() {
		getStatus(); // gets station_status every 60 seconds and indexes to elasticsearch
	}, 10000);
});


// Server frontpage
app.get('/', function (req, res) {
    res.send('This is bcylcle Server');
});

// Alert Webhook Test Endpoint (pings zapier on refresh)
app.get('/alert_webhook', function (req, res) {
	alertMessage = { new_bikes_available: 1 };
	sendMessage();
	res.send(JSON.stringify(alertMessage));
});

// Function for sending alert messages to a catch url endpoint
function sendAlert() {
    request({
        url: catchURL,
        method: 'POST',
        json: {
            new_bikes_available: 1
        }
    }, function(error, response, body) {
				console.log(response.body);
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

// Callback Endpoint: New Station Status
app.get('/new_station_status', function (req, res) {
	res.send( getStatus() );
});

//var refresh = setInterval(refreshMe, 60000);

// Get the Station Status and index it into elasticsearch
function getStatus() {
	request({
			url: station_status,
			method: 'GET',
			json: true
	}, function(error, response, body) {
			if (error) {
					console.log('Error sending message: ', error);
			} else if (response.body.error) {
					console.log('Error: ', response.body.error);
			}

			var statusBody = body;
			console.log('Last Updated: ', statusBody.last_updated);
			indexStatus(statusBody); // Index the status
	})

}

// Elasticsearch Index Function
function indexStatus(statusBody) {
	elasticClient.index({
	  index: 'bcycle_greatrides',
	  type: 'station_status',
	  id: statusBody.last_updated,
		body: statusBody.data,
		refresh: true
	}, function (error, response) {
		console.log('Index Updated');
		console.log(response);
	});
}
