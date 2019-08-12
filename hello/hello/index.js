'use strict';

exports.handler = function(event, context, callback) {

  if (event.body) {
    event = JSON.parse(event.body);
  }

  var sc = 200; // Status code
  var result = "Hello ";
  if (event.queryStringParameters && event.queryStringParameters) {
    result += event.queryStringParameters.name;
  }

  const response = {
    statusCode: sc,
    headers: { "Content-type": "text/text" },
    body: result
  };
  
  callback(null, response);
};