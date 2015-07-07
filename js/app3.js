theMovieDb.common.api_key = "0489233d5a64e99ec2d3789a8f513c96";
var globalData = [];
var totalLogged = 0;
function syncWithServer(){
	$.ajax({
	  type: "GET",
	  url: 'http://kovalent.co/clients/kenvideo/kvmdb/api/movies/all/'
	}).done(function(d){
		console.log('synced it');
		d = $.parseJSON(d);
		console.log(d);
		showCurrentTitles(d);

	});
}

function showCurrentTitles(titles) {
	$('#titles').html('');
	titles = _.sortBy(titles,'title');
	globalData = titles;
	var d = {'titles':titles};
	var results   = $("#result-titles").html();
	var results_tmpl = Handlebars.compile(results);
	var titles = results_tmpl(d);
	$('#titles').append(titles);
	initialListeners();

	$('#count').text(d.titles.length);
}

function sortBy(what, data){
	if(!data){
		data = globalData;
	}
	if(what == 'title') {
		data = _.sortBy(data,'title');
	}
	return data;
}


function initialListeners(){

}
function resetListeners() {

}


$(document).ready(function(){

	syncWithServer();


});

Handlebars.registerHelper('greaterThan', function(first, second, options) {
  if(first > second) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

