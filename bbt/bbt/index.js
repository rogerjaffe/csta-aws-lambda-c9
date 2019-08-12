const bbt = require('big-bang-theory');
const moment = require('moment');

/**
 * Import a CSS style sheet
 */
const styles = require('./styles.js');

/**
 * Generate an HTML template string, embedding the CSS styles
 * imported above
 * body: HTML body
 * returns HTML string
 */
const formatHTML = body => `<html><head><style>${styles}</style></head><body>${body}</body></html>`;

/**
 * Build an HTML table string from individual HTML rows
 * rows: Array of HTML code representing the rows of the table
 * returns: Complete HTML document string 
 */ 
const buildHTMLTable = rows => {
  var html = rows.map(ep => {
    var formattedDate = moment(ep.airdate).format('MMM D, YYYY');  
    return `<tr><td>${ep.name}</td><td>${ep.season}</td><td>${ep.number}</td><td>${formattedDate}</td><td>${ep.summary}</td></tr>`;
  });
  var tableData = html.reduce((acc, row) => acc + row, '');
  tableData = `<tbody>${tableData}</tbody>`;
  var header = '<thead><tr><th>Name</th><th>Season</th><th>Episode</th><th>Air date</th><th>Summary</th></tr></thead>';
  var table = `<table>${header}${tableData}</table>`;
  return formatHTML(table);
}

exports.handler = (event, context, callback) => {

  if (event.body) {
    event = JSON.parse(event.body);
  }

  var sc = 200; // Status code
  var result = "<p>Empty page!</p>";

  // If query parameters exist
  if (event.queryStringParameters) {
    // Grab the episode array from the database
    var episodes = bbt._embedded.episodes;
    
    // Branch to the right processing section based on the requested query
    switch (event.queryStringParameters.type) {
      // Search by episode name (title)
      case 'name':
        var filteredArray = episodes.filter(episode => episode.name.toLowerCase().indexOf(event.queryStringParameters.name.toLowerCase()) >= 0)
        result = buildHTMLTable(filteredArray);
        break;

      // Search by season and episode number
      case 'episode':
        var filteredArray = episodes.filter(episode => episode.season+'' === event.queryStringParameters.season && episode.number+'' === event.queryStringParameters.episode);
        result = buildHTMLTable(filteredArray);
        break;

      // Search the episodes for summaries that contain the provided string
      case 'summary':
        var filteredArray = episodes.filter(episode => episode.summary.toLowerCase().indexOf(event.queryStringParameters.summary.toLowerCase()) >= 0)
        result = buildHTMLTable(filteredArray);
        break;

      // Search for episodes with dates between from and to parameters
      case 'dates':
        var filteredArray = episodes.filter(episode => event.queryStringParameters.from <= episode.airdate && episode.airdate <= event.queryStringParameters.to);
        result = buildHTMLTable(filteredArray);
        break;

      // Search for episodes that contain the provided string in the provided database field.  Display the 
      // number of records that were found
      case 'count':
        var field = event.queryStringParameters.field;
        var searchString = event.queryStringParameters.string;
        var filteredArray = episodes.filter(episode => (episode[field]+'').toLowerCase().indexOf((searchString+'').toLowerCase()) >= 0);
        var html = `<p>Target field: ${field}</p><p>Target string: ${searchString}</p><p>There are ${filteredArray.length} records containing the target string</p>`;
        result = formatHTML(html);
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
