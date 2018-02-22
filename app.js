/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk

var Cloudant = require('cloudant');
var account = '77e16f06-ff20-4b18-9b06-0c0f53a70fe2-bluemix';
var password = 'faa84afce13cd1a5d554108439821a248cd3263dcaa2cd6c01e64caca854cdb9';
var cloudant = Cloudant({ account: account, password: password });




var app = express();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// Create the service wrapper
var conversation = new Conversation({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
    username:"05a6e922-5591-45da-89e9-f874c96a4736",
    password: "ZenwofJmXE0p",
    //url: 'https://gateway.watsonplatform.net/conversation/api',
    version_date: Conversation.VERSION_DATE_2017_04_21
});

// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {
    var workspace = process.env.WORKSPACE_ID || "c04e6074-2573-4898-a546-5b72f4bd24a5";
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
  var payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: req.body.input || {}
  };

  // Send the input to the conversation service
  conversation.message(payload, function(err, data) {
    if (err) {
        return res.status(500).json(err);
        
    }
    return res.json(updateMessage(payload, data));
  });
});

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {
  var responseText = null;
  if (!response.output) {
    response.output = {};
  } else {
    return response;
  }
  if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  response.output.text = responseText;
  return response;
}
app.post('/api/query', function (req, res) {
    var price = req.body.price;
    var range = req.body.range;
    var product = req.body.product;
    var price2 = req.body.price2;
    var db = cloudant.db.use('products_catelog');
    if (product == '' && range == 'Greater Than')
    {
        db.find({ selector: { price: {$gt:price} },fields:['image_path'] }, function (er, result) {
            if (er) {
                throw er;
            }

            console.log('Found %d documents', result.docs.length);
            for (var i = 0; i < result.docs.length; i++) {
                console.log('  Doc id: %s', result.docs[i].image_path);
            }
            res.send(result);
        });

    }
    if (product == '' && range == 'Less Than')
    {
        db.find({ selector: { price: { $lt: price } }, fields: ['image_path'] }, function (er, result) {
            if (er) {
                throw er;
            }

            console.log('Found %d documents', result.docs.length);
            for (var i = 0; i < result.docs.length; i++) {
                console.log('  Doc id: %s', result.docs[i].image_path);
            }
            res.send(result);
        });

    }
    if (product == '' && price2 != '') {
        if (price2 > price)
        {
            var temp = price;
            price = price2;
            price2 = temp;
        }
        db.find({ selector: { $and: [{ price: { $gt: price2 } }, { price: { $lt: price }}] }, fields: ['image_path'] }, function (er, result)
        {
            if (er) {
                throw er;
            }
            console.log('Found %d documents', result.docs.length);
            for (var i = 0; i < result.docs.length; i++) {
                console.log('  Doc id: %s', result.docs[i].image_path);
            }
            res.send(result);
        });


        }

    if (product != '')
    {
        if (range === 'Less Than')
        {
            db.find({ selector: { price: { $lt: price },product_category:product }, fields: ['image_path'] }, function (er, result) {
                if (er) {
                    throw er;
                }

                console.log('Found %d documents', result.docs.length);
                for (var i = 0; i < result.docs.length; i++) {
                    console.log('  Doc id: %s', result.docs[i].image_path);
                }
                res.send(result);
            });

        }
        if (range === 'Greater Than')
        {
            db.find({ selector: { price: { $gt: price },product_category:product }, fields: ['image_path'] }, function (er, result) {
                if (er) {
                    throw er;
                }

                console.log('Found %d documents', result.docs.length);
                for (var i = 0; i < result.docs.length; i++) {
                    console.log('  Doc id: %s', result.docs[i].image_path);
                }
                res.send(result);
            });

        }


    }

});

module.exports = app;
