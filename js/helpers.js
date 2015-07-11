
Handlebars.registerHelper('greaterThan', function(first, second, options) {
  if(first > second) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('equalTo', function(first, second, options) {
  if(first == second) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('dataQuality', function(imdb_id, year) {
  var classes = [];
  if(imdb_id == '') {
  	classes.push('missingIMDB');
  }
  if(year == 0) {
  	classes.push('missingYear');
  }
  return classes.join(' ');
});

Handlebars.registerHelper('humanIndex', function(index) {
  return parseInt(index) + 1;
});

Handlebars.registerHelper('count', function(arr) {
  return arr.length;
});