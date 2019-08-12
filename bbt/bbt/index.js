const bbt = require('big-bang-theory');
const moment = require('moment');
const styles = require('./styles.js');
const formatHTML = body => `<html><head><style>${styles}</style></head><body>${body}</body></html>`;

exports.handler = (event, context, callback) => {

  if (event.body) {
    event = JSON.parse(event.body);
  }

  var sc = 200; // Status code
  var result = formatHTML("<p>Hello!</p>");
  
  if (event.queryStringParameters) {
    var episodes = bbt._embedded.episodes;
    switch (event.queryStringParameters.type) {
      case 'name':
        var filteredArray = episodes.filter(episode => episode.name.toLowerCase().indexOf(event.queryStringParameters.name.toLowerCase()) >= 0)
        var html = filteredArray.map(ep => {
          var formattedDate = moment(ep.airdate).format('MMM D, YYYY');  
          return `<tr><td>${ep.name}</td><td>${ep.season}</td><td>${ep.number}</td><td>${formattedDate}</td><td>${ep.summary}</td></tr>`;
        });
        var tableData = html.reduce((acc, row) => acc + row);
        tableData = `<tbody>${tableData}</tbody>`;
        var header = '<thead><tr><th>Name</th><th>Season</th><th>Episode</th><th>Air date</th><th>Summary</th></tr></thead>';
        var table = `<table>${header}${tableData}</table>`;
        result = formatHTML(table);
        break;

      case 'episode':
        result = formatHTML('<p>episode</p>');
        break;

      case 'description':
        result = formatHTML('<p>description</p>');
        break;

      case 'dates':
        result = formatHTML('<p>dates</p>');
        break;

      case 'count':
        result = formatHTML('<p>count</p>');
        break;

      default:
        result = formatHTML('<p>Unknown type parameter</p>');
    }
  } else {
    result = formatHTML('<p>There are no query parameters</p>');
  }

  const response = {
    statusCode: sc,
    headers: { "Content-type": "text/html" },
    body: result
  };
  
  callback(null, response);

};
