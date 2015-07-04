
//only extend results when there the box is checked,
//add a box for blueray / dvd
//setup a server to recieve title, year, tmdbid, and imdbid

var activeResult = 0;

var saveMovie = function(data){
	var url = "http://kenvideo.net/kvmdb/api/add_movie/";

	$.ajax({
	  type: "POST",
	  url: url,
	  data: data
	}).done(function(d){
		console.log('saved it');
		console.log(d);
	});
}

var newOMDBResult = function(d){
	// if(d.Released) {
	// 		yr = (d.Released).split(' ')[2];
	// 	}
	// d.year = yr;

	// if (d && d.Title) {
	// 	var omdbResult   = $("#result-omdb").html();
	// 	var omdbResultTemplate = Handlebars.compile(omdbResult);
	// 	var result = omdbResultTemplate(d);
	// 	$('#results').append(result);
	// }

	// var templ = '<div class="title">'+d.Title+'</div>';
	// templ += '<div class="actors">'+d.Actors+'</div>';
	// templ += '<div class="plot">'+d.Plot+'</div>';
	// templ += '<div class="poster"><img src="'+d.Poster+'"/></div>';
	// templ += '<div class="year">'+d.Released+'</div>';
	// templ += '<div class="imdbID">'+d.imdbID+'</div>';
	// templ += '<div class="rating">'+d.Rated+'</div>';


}

var newTMDBResult = function(d) {
	$('#loading').hide();
	$('.result').remove();
	$('.nexty').remove();
	if(d.results){
		_.each(d.results,function(thisdata,i){
			var yr = '_nf_'
			if(thisdata.release_date) {
				yr = (thisdata.release_date).split('-')[0];
			}
			d.results[i].year = yr;
		});

		console.log(d);

		var tmdbResult   = $("#result-tmdb").html();
		var tmdbResultTemplate = Handlebars.compile(tmdbResult);

		var results    = tmdbResultTemplate(d);

		$('#results').append(results);
	}

	var nextResults   = $("#result-tmdb-next").html();
	var next_tmpl = Handlebars.compile(nextResults);
	var next = next_tmpl(d);
	$('#nav').append(next);

	resetListeners();

}

var extendResult = function(data) {
	console.log("theMovieDb extended callback:");
  data = $.parseJSON(data);
  console.log(data);

  var tmdbResult   = $("#result-tmdb-ext").html();
	var tmdbResultTemplate = Handlebars.compile(tmdbResult);
	var result    = tmdbResultTemplate(data);
	$('#tmdbid_'+data.id).append(result);
}

function resetListeners(){
	// $('.result').click(function(){
	// 	var tmdbid = $(this).attr('id').split('_')[1];
	// 	console.log(tmdbid);
	// 	theMovieDb.movies.getById({"id":tmdbid }, extendResult, errorCB);
	// });

	$('#next').click(function(){
		var thePage = $(this).data('page') + 1;
		var searchString = $('#searchbox').val();
		console.log(thePage);

		searchTMDB(searchString, false, thePage);
	});

	$('#prev').click(function(){
		var thePage = $(this).data('page') - 1;
		var searchString = $('#searchbox').val();
		console.log(thePage);

		searchTMDB(searchString, false, thePage);
	});

	$('.activated').blur(function(){
		saveThisResult($(this).data('result'));
	});
	$('.activated').focus(function(){
		locateIMDBID($(this).data('result'));
	});
	$('.activated').keyup(function(e){
		//console.log(e.which);
		var currentResult = parseInt($(this).data('result'));

		if(e.which == 40) {
			console.log('youpressed down');
			console.log('currentlyOn:' + currentResult)

			activateNextResult(currentResult);
		}
		if (e.which == 38) {
			activatePrevResult(currentResult);
		}
		if (e.which == 37) {//left
			logDVD(currentResult);
		}
		if (e.which == 39) {//right
			logBLU(currentResult);
		}

	});


}

function locateIMDBID(result){
	var $result = $($('[data-resultRow="'+result+'"]')[0]);
	var tmdbid = $result.find('.tmdbid').text();


	var success = function(d){
		console.log('found byid:');
		d = $.parseJSON(d);
		$result.attr('data-imdbid',d.imdb_id);
		console.log(d.imdb_id);
	}
	var fail = function(d){
		console.log(d);
	}

	theMovieDb.movies.getById({"id":tmdbid },success,fail);

}

function saveThisResult(result){
	var $result = $($('[data-resultRow="'+result+'"]')[0]);
	var data = {};
	data.imdb_id = $result.data('imdbid');
	data.dvd = $result.find('.dvdcount').text();
	data.blu = $result.find('.blucount').text();
	data.title = $result.find('.title').text();
	data.tmdbid = $result.find('.tmdbid').text();

	if(data.dvd == '') {
		data.dvd = '0';
	}
	if(data.blu == '') {
		data.blu = '0';
	}

	if(data.blu == '0' && data.dvd == '0') {
		console.log('nothing to log');
	} else {
		console.log('sending:');
		console.log(data);
	}



}

function logDVD(currentResult){
	var $result = $($('[data-resultRow="'+currentResult+'"]')[0]);

	var $counter = $result.find('.dvdcount');
	$counter.addClass('plusOne');

	var timeoutID = window.setTimeout(function(){
		$counter.removeClass('plusOne');
	}, 200);
	$counter.text(parseInt($counter.text()) + 1);

}

function logBLU(currentResult){
	var $result = $($('[data-resultRow="'+currentResult+'"]')[0])

	var $counter = $result.find('.blucount');
	$counter.addClass('plusOne');

	var timeoutID = window.setTimeout(function(){
		$counter.removeClass('plusOne');
	}, 200);

	$counter.text(parseInt($counter.text()) + 1);

}

function activateNextResult(currentResult) {
	var nextResult = 0;
	if(currentResult !== undefined) {
		nextResult = parseInt(currentResult) + 1;
	}
	console.log('heading to:' + nextResult);
	$('#result_'+nextResult).focus();

	//what about when you are at the end??
}

function activatePrevResult(currentResult) {
	var nextResult = 0;
	if(currentResult !== undefined && currentResult !== 0) {
		nextResult = parseInt(currentResult) - 1;
		console.log('heading to:' + nextResult);
		$('#result_'+nextResult).focus();
	}

	if (currentResult == 0) {
		$('#searchbox').val('');
		$('#searchbox').focus();
	}
}

function successCB2(data) {
    console.log("rottentomatoes callback:");
    console.log(data);
	};
	function TMDBSuccess(data,year) {
    console.log("theMovieDb callback:");
    data = $.parseJSON(data);
    console.log(data);
     newTMDBResult(data);

   	if(year){
   		console.log('i heard you want a year');
   	}
	};

function successCB2(data) {
    console.log("openMovieDB callback:");
    console.log(data);
    newOMDBResult(data);
	};

	function errorCB(data) {
            console.log("Error callback:")
            console.log(data);
    };

function searchTMDB(searchString, year, page) {
		searchStringEnc = encodeURIComponent(searchString);
		query = {"query":searchStringEnc,"include_adult":true};
		if(page) {
			query.page = page.toString();
		}
		if(year) {
			query.primary_release_year = year.toString();
		}
		theMovieDb.search.getMovie(query, TMDBSuccess, errorCB);
}
  function doSearch(searchString, year){
  	$('#loading').show();
  	$('#results').show();
  	$('#initialMsg').hide();

  	activeResult = 0;

  	searchStringEnc = encodeURIComponent(searchString);
  	// searchString2 = $.param({q:searchString});
  	// searchString3 = $.param({t:searchString});
  	year = false;
  	searchTMDB(searchString, year);

  	theMovieDb.search.getMovie({"query":searchStringEnc}, TMDBSuccess, errorCB);

  	// omdbQuery = 'http://www.omdbapi.com/?t='+searchString+'&y='+year+'&plot=full&r=json';

  	// $.getJSON(omdbQuery).success(function(d){

  	// 	successCB2(d);
  	// });


  	// $.getJSON('http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey=srfr7f2hcnbzrsgug6ffgnp3&q='+searchString+'&page_limit=1').success(function(d){
  	// 	successCB3(d);
  	// });
  }

$(document).ready(function(){
	theMovieDb.common.api_key = "0489233d5a64e99ec2d3789a8f513c96";

	//doSearch('Fight Club');

	// $('#searchform').submit(function(e){
	// 	e.preventDefault();
	// 	var query = $(this).find('#searchbox').val();
	// 	//var year = $(this).find('#yearbox').val();
	// 	year = '';
	// 	doSearch(query, year);
	// });

	$('#searchbox').keyup(function(e){
		console.log(e.which); //down = 40,Right: 39,Left: 37,Esc: 27,Up: 38
		//Enter: 13
// Up: 38
// Down: 40
// Right: 39
// Left: 37
// Esc: 27
// SpaceBar: 32
// Ctrl: 17
// Alt: 18
// Shift: 16

		if(e.which == 40) {
			console.log('youpressed down');
			activateNextResult();
		} else {
			var query = $(this).val();
			//var year = $(this).find('#yearbox').val();
			var year ='';
			doSearch(query, year);
		}


	});

});

Handlebars.registerHelper('greaterThan', function(first, second, options) {
  if(first > second) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

