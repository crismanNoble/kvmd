
//only extend results when there the box is checked,
//add a box for blueray / dvd
//setup a server to recieve title, year, tmdbid, and imdbid
var globalData = [];

var activeResult = 0;

var saveMovie = function(data){
	var url = "http://kovalent.co/clients/kenvideo/kvmdb/api/movies/new/";

	$.ajax({
	  type: "POST",
	  url: url,
	  data: data
	}).done(function(d){
		console.log('saved it');
		console.log(d);
		globalData.push(data);
		$('#tmdbid_'+data.tmdb_id).removeClass('needsLogged');
	});
}

function updateQuantity(data){
	var url = "http://kovalent.co/clients/kenvideo/kvmdb/api/movies/update/";

	$.ajax({
	  type: "POST",
	  url: url,
	  data: data
	}).done(function(d){
		console.log('updated it it');
		console.log(d);
		globalData.push(data);
		$('#tmdbid_'+data.tmdb_id).removeClass('needsLogged');
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

	highlightExisting();

	resetListeners();

}

function highlightExisting() {
	$('.result').each(function(){
		$this = $(this);
		var tmdb_id_this = $(this).attr('id').split('_')[1];
		if(inOurData(tmdb_id_this)) {
			var ours = ourVersion(tmdb_id_this);

			var $counter1 = $this.find('.dvdcount');
			var $counter2 = $this.find('.blucount');

			$counter1.text(ours.dvd);
			$counter2.text(ours.blu);

			$this.addClass('owned');
		}
	});
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
		if(e.which == 27) {
			clearout(currentResult);
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

function inOurData(tmdb_id){
	var logged = _.where(globalData, {'tmdb_id':tmdb_id});
	return logged.length > 0;

}

function ourVersion(tmdb_id){
	var logged = _.where(globalData, {'tmdb_id':tmdb_id});
	return logged[0];
}

function saveThisResult(result){
	var $result = $($('[data-resultRow="'+result+'"]')[0]);
	var data = {};
	data.imdb_id = $result.data('imdbid');
	data.dvd = $result.find('.dvdcount').text();
	data.blu = $result.find('.blucount').text();
	data.title = $result.find('.title').text();
	data.tmdb_id = $result.find('.tmdbid').text();

	if(data.dvd == '') {
		data.dvd = '0';
	}
	if(data.blu == '') {
		data.blu = '0';
	}

	if($result.hasClass('needsLogged')){
		if(inOurData(data.tmdb_id)){
			console.log('we are going to do an update');
			updateQuantity(data);
		} else {
			if(data.blu == '0' && data.dvd == '0') {
				console.log('nothing to log');
			} else {
				console.log('sending:');
				console.log(data);
				saveMovie(data);
				$result.addClass('owned');
			}
		}
	} else {
		console.log('nothing changed');
	}

}

function clearout(currentResult) {
	console.log(currentResult);
	var $result = $($('[data-resultRow="'+currentResult+'"]')[0]);
	$result.addClass('needsLogged');

	var $counter1 = $result.find('.dvdcount');
	$counter1.addClass('clearedOut');
	var $counter2 = $result.find('.blucount');
	$counter2.addClass('clearedOut');

	var timeoutID = window.setTimeout(function(){
		$counter1.removeClass('clearedOut');
		$counter2.removeClass('clearedOut');
	}, 200);
	$counter1.text(0);
	$counter2.text(0);

	var data = {};
	data.imdb_id = $result.data('imdbid');
	data.dvd = $result.find('.dvdcount').text();
	data.blu = $result.find('.blucount').text();
	data.title = $result.find('.title').text();
	data.tmdb_id = $result.find('.tmdbid').text();

	updateQuantity(data);



}

function logDVD(currentResult){
	var $result = $($('[data-resultRow="'+currentResult+'"]')[0]);
	$result.addClass('needsLogged');

	var $counter = $result.find('.dvdcount');
	$counter.addClass('plusOne');

	var timeoutID = window.setTimeout(function(){
		$counter.removeClass('plusOne');
	}, 200);
	$counter.text(parseInt($counter.text()) + 1);

}

function logBLU(currentResult){
	var $result = $($('[data-resultRow="'+currentResult+'"]')[0]);
	$result.addClass('needsLogged');

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

	$('.result').removeClass('activatedRightNow');
	$('#result_'+nextResult).parent().parent().addClass('activatedRightNow');

	//what about when you are at the end??
}

function activatePrevResult(currentResult) {
	var nextResult = 0;
	if(currentResult !== undefined && currentResult !== 0) {
		nextResult = parseInt(currentResult) - 1;
		console.log('heading to:' + nextResult);
		$('#result_'+nextResult).focus();
		$('.result').removeClass('activatedRightNow');
		$('#result_'+nextResult).parent().parent().addClass('activatedRightNow');
	}

	if (currentResult == 0) {
		$('.result').removeClass('activatedRightNow');
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

function syncWithServer(){
	$.ajax({
	  type: "GET",
	  url: 'http://kovalent.co/clients/kenvideo/kvmdb/api/movies/all/'
	}).done(function(d){
		console.log('synced it');
		d = $.parseJSON(d);
		console.log(d);
		globalData = d;

	});
}

function showManualForm() {
	$('.cantFindItHelper').show();
	$('.cantFindItHint').hide();
}

function hideManualForm($this) {

	$this.text('saving... ');
	$this.attr('disabled','disabled');

	var data = {};
	data.blu = $('#blu').val();
	data.dvd = $('#dvd').val();
	data.year = $('#yearbox').val();
	data.director = $('#director').val();
	data.upc = $('#upc').val();
	data.notes = $('#notes').val();
	data.title = $('#searchbox').val();


	function resetForm() {
		$('.cantFindItHelper').hide();
		$('.cantFindItHint').show();
		$this.text('Save For Later');
		$this.attr('disabled',false);
		$('#searchbox').val('');
		$('#searchbox').focus();

		$('#blu').val('');
		$('#dvd').val('');
		$('#yearbox').val('');
		$('#director').val('');
		$('#upc').val('');
		$('#notes').val('');
		$('#searchbox').val('');

	}

	if(data.title) {
		console.log('going to save it for later');
		console.log(data);

		var url = "http://kovalent.co/clients/kenvideo/kvmdb/api/movies/later/";

		$.ajax({
		  type: "POST",
		  url: url,
		  data: data
		}).done(function(d){
			console.log('saved it for later');
		}).fail(function(d){
			console.error('that was a major fail');
		}).always(function(d){
			resetForm();
		});

	} else {
		resetForm();
	}





}

$(document).ready(function(){

	syncWithServer();
	theMovieDb.common.api_key = "0489233d5a64e99ec2d3789a8f513c96";

	$('#cantFindIt').mousedown(function(){
		showManualForm();
	});

	$('#findItLater').mousedown(function(){
		hideManualForm($(this));
	});



	var searchInProgress = false;
	$('#searchbox').keyup(function(e){
		e.preventDefault();
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
		var query = $(this).val();
		var year ='';
		if(e.which == 13) {
			doSearch(query, year);
			console.log('you hit enter');
			console.log('doing the search for sure');
		} else {
			if(e.which == 40) {
				console.log('youpressed down');
				activateNextResult();
			} else {
				if(!searchInProgress){
					if(query.length > 1){
						doSearch(query, year);
						searchInProgress = true;
						setTimeout(function(){
							console.log('searchReset');
							searchInProgress = false;
						},200);
					}


				} else {
					console.log('too soon');
				}

			}
		}




	});

	$('#helpToggle').click(function(e){
		e.preventDefault();
		$('#helpme').toggle();
	});

});

Handlebars.registerHelper('greaterThan', function(first, second, options) {
  if(first > second) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

