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
		//console.log(d);
		globalData = d;
		d = sortOrFilter(d,'sort','entered');
		showCurrentTitles(d);


	});
}


function showCurrentTitles(titles,sortFilter) {
	$('#titles').html('');

	var d = {'titles':titles};
	var results   = $("#result-titles").html();
	var results_tmpl = Handlebars.compile(results);
	var titles = results_tmpl(d);
	$('#titles').append(titles);
	resetListeners();

	$('#count').text(d.titles.length);
}

function sortOrFilter(data,sortOrFilter,byWhat){
	console.log(sortOrFilter);
	console.log(byWhat);
	if(sortOrFilter == 'sort') {
		if(byWhat == 'entered') {
			data = _.sortBy(data,function(d,i){
				return -d.index;
			});
		}
		if(byWhat == 'title') {
			data = _.sortBy(data,'title');
		}
		if(byWhat == 'year') {
			data = _.sortBy(data,'year');
		}
	}

	if(sortOrFilter == 'filter') {
		if(byWhat == 'missing') {
			data = _.filter(data,function(d,i){
				return d.imdb_id == '' || d.year == 0;
			});
		}
		if(byWhat == 'duplicates') {
			var the_data = _.pluck(globalData, 'tmdb_id');
			console.log(the_data);
			data = _.filter(data,function(d,i){
				var this_tmdb = d.tmdb_id;

				var count = _.filter(the_data, function(num){
					return num == this_tmdb;
				});

				console.log(this_tmdb);
				console.log(count);
				//var count = [];
				return count.length > 1;
			});
			data = _.sortBy(data,'tmdb_id');
		}
		if(byWhat == 'zero') {
			data = _.filter(data,function(d,i){
				return d.dvd == 0 && d.blu == 0;
			});
		}
	}

	return data;
}


function initialListeners(){



}
function resetListeners() {
	$('.killit').click(function(e){
		e.preventDefault();

		var who = $(this).data('index');
		console.log(who);
		removeEntry(who);
	});

	$('[data-action="update"]').click(function(e){
		e.preventDefault();

		var who = $(this).data('index');
		var what = $(this).data('value');
		var where = $(this).data('modifier');
		var howmuch = parseInt($(this).parent().find('.'+what+'').text().trim());

		if(where == 'add') {
			howmuch++;
		} else {
			howmuch --;
		}

		if(howmuch >= 0) {
			console.log(who);
			console.log(howmuch);
			console.log(what);

			$(this).parent().find('.'+what+'').text(howmuch);

			var blu = $(this).parent().parent().find('.blu').text();
			var dvd = $(this).parent().parent().find('.dvd').text();
			var tmdb_id = $(this).parent().parent().data('tmdb');
			var all = {'blu':blu,'dvd':dvd,'tmdb_id':tmdb_id};

			updateData(all);

		}

	});
}

function crawlDown() {
	var count = 0;
	var $rows = $('.row');

	var intervalID = setInterval(function(){
		if(count < globalData.length) {
			$this = $($rows[count]);
			var tmdb_id = $this.find('.tmdb').text().trim();
			if($this.find('.imdb').text().trim() == '' || $this.find('.year').text().trim() == '????'){
				hitAPI(tmdb_id);
			}
			count ++;
		}	else {
			clearInterval(intervalID);
		}
	}, 500);

}

function hitAPI(tmdb_id) {

	theMovieDb.movies.getById({"id":tmdb_id },apiSuccess,apiError);

	function apiError(d){
		console.log('error');
		console.log(d);
	}

	function apiSuccess(d){
		d = $.parseJSON(d);
		console.log(d);
		writeResults(tmdb_id,d);
	}

}

function writeResults(tmdb_id,d){
	$target = $('[data-tmdb="'+tmdb_id+'"]');
	var year = d.release_date.split('-')[0];
	var imdb_id = d.imdb_id;
	$target.find('.year .content').text(year);
	$target.find('.imdb').html('<a href="http://www.imdb.com/title/'+imdb_id+'/" target="_blank">'+imdb_id+'</a>');

	var data = {'tmdb_id':tmdb_id};
	if(year){
		data.year = year;
	}
	if(imdb_id) {
		data.imdb_id = imdb_id;
	}
	if(imdb_id || year) {
		updateData(data);
	}
}

function updateData(data){
	var url = "http://kovalent.co/clients/kenvideo/kvmdb/api/movies/update/";

	console.log(data);

	$.ajax({
	  type: "POST",
	  url: url,
	  data: data
	}).done(function(d){
		console.log('updated it it');
	});
}


function removeEntry(who){

	var data= {'index':who};

	var $who = $('[data-index="'+who+'"]');
	data.year = $who.find('.year .content').text().trim();
	data.title = $who.find('.title .content').text().trim();
	data.imdb_id = $who.find('.tmdb').text().trim();
	data.tmdb_id = $who.find('.tmdb').text().trim();
	data.blu = $who.find('.blu').text().trim();
	data.dvd = $who.find('.dvd').text().trim();

	console.log('going to remove');
	console.log(data);
	var url = "http://kovalent.co/clients/kenvideo/kvmdb/api/movies/remove/";
	$.ajax({
	  type: "POST",
	  url: url,
	  data: data
	}).done(function(d){
		console.log('removed it');
		$who.remove();
	});
}

$(document).ready(function(){

	syncWithServer();


	$('.sorter').click(function(e){
		e.preventDefault();
		var titles = sortOrFilter(globalData,'sort',$(this).data('sortby'));
		showCurrentTitles(titles);

	});

	$('.filter').click(function(e){
		e.preventDefault();
		var titles = sortOrFilter(globalData,'filter',$(this).data('filterby'));
		console.log(titles);
		showCurrentTitles(titles);
	});


});

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

