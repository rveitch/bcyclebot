

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};



// Facebook Webhook
app.get('/webhooksubscribe', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// Receiving messages handler
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
				console.log(event); // Added by RV for event
				if (event.message && event.message.text) {
					if (!kittenMessage(event.sender.id, event.message.text)) {
						sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
					}
				} else if (event.postback) {
					console.log("Postback received: " + JSON.stringify(event.postback));
				}
    }
    res.sendStatus(200);
});

// send rich message with kitten
function kittenMessage(recipientId, text) {

    text = text || "";
    var values = text.split(' ');

    if (values.length === 3 && values[0] === 'kitten') {
        if (Number(values[1]) > 0 && Number(values[2]) > 0) {

            var imageUrl = "https://placekitten.com/" + Number(values[1]) + "/" + Number(values[2]);

            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Kitten",
                            "subtitle": "Cute kitten picture",
                            "image_url": imageUrl ,
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show kitten"
                                }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes kitten " + imageUrl,
                            }]
                        }]
                    }
                }
            };

            sendMessage(recipientId, message);

            return true;
        }
    }

    return false;

};


/////

// Elasticsearch
// https://blog.raananweber.com/2015/11/24/simple-autocomplete-with-elasticsearch-and-node-js/
/*function elasticsearchTest(recipientId, text) {

	var elasticsearch = require('elasticsearch');
	var client = new elasticsearch.Client({
		host: 'https://site:fec45077f659f7de428931b20423cbde@dori-us-east-1.searchly.com',
		apiVersion: '2.3'
	});

	client.search({
		index: 'twitter',
	  type: 'tweets',
	  body: {
	    query: {
	      match: {
	        body: 'elasticsearch'
	      }
	    }
	  }
	}).then(function (resp) {
	    var hits = resp.hits.hits;
	}, function (err) {
	    console.trace(err.message);
	});

}*/
