

/*what you were doing

* all of these sleek changes are going to need to translate to the seeds page too

* get a tv serach working
* get a rudimentary upc search working too

*/
theMovieDb.common.api_key = "0489233d5a64e99ec2d3789a8f513c96";
var globalData = [];

var activeResult = 0;



var saveMovie = function(data){

	api.titles.create(data).done(function(d){
		console.log(d);
		globalData.push(data);
		$('#tmdbid_'+data.tmdb_id).removeClass('needsLogged');
	}).fail(function(){
		alert('something went wrong');
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

function newTMDBTvResult(d) {
	$('#loading').hide();
	$('.result').remove();
	$('.nexty').remove();
	if(d.results){
		_.each(d.results,function(thisdata,i){
			var yr = '_nf_'
			if(thisdata.first_air_date) {
				yr = (thisdata.first_air_date).split('-')[0];
			}
			d.results[i].year = yr;
		});

		var tmdbResult   = $("#result-tmdb-tv").html();
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
		if(inOurData(tmdb_id_this,'movie')) {
			var ours = ourVersion(tmdb_id_this);
			console.log('ours says');
			console.log(ours);
			$(this).attr('data-title_id',ours.index);
			$(this).attr('data-imdb_id',ours.imdb_id);
			$this.addClass('owned');
		}
	});

	$('.season').each(function(){
		$this = $(this);
		console.log($(this));
		var tmdb_id_this = $(this).data('tmdb_id').toString();
		if(inOurData(tmdb_id_this,'series')) {
			var ours = ourVersion(tmdb_id_this);
			console.log('ours says');
			console.log(ours);
			$this.attr('data-title_id',ours.index);
			$this.attr('data-imdb_id',ours.imdb_id);
			$this.addClass('owned');
		}
	})
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
		var mode = $('#searchType:checked').val();

		searchTMDB(searchString, false, thePage, mode);
	});

	$('#prev').click(function(){
		var thePage = $(this).data('page') - 1;
		var searchString = $('#searchbox').val();
		console.log(thePage);

		searchTMDB(searchString, false, thePage, mode);
	});

	$('.activated').focus(function(){
		var $who = $(this).parent().parent();
		console.log($who.attr('class'));
		activateResult($who);
	});

	$('.activated').keyup(function(e){
		var currentResult = parseInt($(this).data('result'));
		var $result = $($('[data-resultRow="'+currentResult+'"]')[0]);


		if (e.which == 37) {//left
			logTitleAndCopy($result,'DVD');
		}
		if (e.which == 39) {//right
			logTitleAndCopy($result,'BLU');
		}

	});
}

function resetSeasonListeners(){
	$('.season .activated').focus(function(){
		var $who = $(this).parent().parent();
		console.log($who.attr('class'));
		activateResult($who);
	});

	$('.season .activated').keyup(function(e){
		var $copy = $(this).parent().parent();
		if (e.which == 37) {//left
			logTitleAndCopy($copy,'DVD');
		}
		if (e.which == 39) {//right
			logTitleAndCopy($copy,'BLU');
		}

	});
}

function resetCopyListeners(){

	$('.copyTool').blur(function(){
		console.log('blurred the copy tool');
		updateCopy($(this).parent().parent());
	});

	$('button.updateCopy').click(function(){
		console.log('clicked update copy');
		updateCopy($(this).parent().parent());
	});

	$('button.removeCopy').click(function(){
		console.log('clicked remove copy');
		removeCopy($(this).parent().parent());
	});
}

function removeCopy($copy){
	var data = copyToObject($copy);

	api.copies.remove(data).done(function(d){
		console.log('copy removal completed');
		console.log(d);

		$copy.remove();
	}).fail(function(){
		alert('copy removal failed');
	});
}

function copyToObject($copy){
	var index = $copy.data('index').toString().trim();
	var format = $copy.find('.formatEditor').val().trim();
	var edition = $copy.find('.editionEditor').val().trim();
	var title_id = $copy.data('title_id').toString().trim();

	var data = {'index':index,'format':format,'edition':edition,'title_id':title_id};
	return data;
}

function updateCopy($copy){
	var data = copyToObject($copy);

	api.copies.update(data).done(function(d){
		console.log('copy update completed');
		console.log(d);
	}).fail(function(){
		console.log('copy update failed');
	});
}


function writeTheCopy(d,title_id){
	console.log(d);

	var $result = $('[data-title_id="'+title_id+'"]');

	var $copies = $result.find('.copiesWrapper');
	$copies.html('');

	console.log($copies);

	api.copies.list({'title_id':title_id}).then(function(d){
		var results_data = {'copies': d};
		console.log(results_data);

		var results_hb   = $("#result-copies").html();
		var results_tmpl = Handlebars.compile(results_hb);
		var copies = results_tmpl(results_data);
		$copies.append(copies);
		resetCopyListeners();
	});

}

function createTheCopy(title_id,format) {
	var data = {'title_id':title_id,'format':format};

	api.copies.create(data).done(function(d){
		console.log('all done with creating the copy record:');
		writeTheCopy(d, title_id);
	}).fail(function(d){
		alert('something went wrong');
	});
}

function logTitleAndCopy($result,format) {
	if($result.hasClass('tvresult')){
		console.log('i suppose i could log all the seasons at once... not yet tho');
	} else if($result.hasClass('result')){

		var owned = $result.hasClass('owned');

		var $glow = $result.find('.'+format);
		$glow.addClass('plusOne');
		var timeoutID = window.setTimeout(function(){
			$glow.removeClass('plusOne');
		}, 200);

		var data = {}

		if($result.data('imdb_id')){
			data.imdb_id = $result.data('imdb_id').toString().trim();
		}

		data.title = $result.find('.title').text();
		data.year = $result.find('.year').text();
		data.tmdb_id = $result.find('.tmdbid').text();
		data.type = 'movie';

		if(owned){
			console.log('no need to log a title, its already there');
			var title_id = $result.data('title_id').toString().trim();
			createTheCopy(title_id,format);
		} else {
			console.log('we are going to need to create a title first');
			$result.addClass('owned');

			api.titles.create(data).done(function(d){
				console.log('all done with creating the title record:');
				$result.attr('data-title_id',d);
				console.log(d);
				createTheCopy(d,format);

			}).fail(function(){
				alert('something went wrong');
			});

		}
	} else {
		console.log('you tried to log a season eh?');
		var $glow = $result.find('.'+format);
		$glow.addClass('plusOne');
		var timeoutID = window.setTimeout(function(){
			$glow.removeClass('plusOne');
		}, 200);

		var $parent = $result.parent().parent();

		var series_tmdb_id = $parent.data('tmdb_id').toString().trim();
		var season_tmdb_id = $result.data('tmdb_id').toString().trim();

		if($result.hasClass('owned')) {
			console.log('well we already have that as a title, just create a copy');
			var title_id = $result.data('title_id').toString().trim();
			createTheCopy(title_id,format);
		} else {

			var data = {};

			var year = $result.data('airdate');
			if(year != ''){
				year = year.split('-')[0];
			}

			data.type = 'series';
			data.series_tmdb_id = series_tmdb_id;
			data.tmdb_id = season_tmdb_id;
			data.season_number = $result.data('season_number').toString().trim();
			data.title = $parent.find('.title').text().trim();
			data.year = year;

			console.log('we need to log the title first');
			console.log(data);

			//$result.addClass('owned');

			api.titles.create(data).done(function(d){
				console.log('all done with creating the title record:');
				$result.attr('data-title_id',d);
				console.log(d);
				createTheCopy(d,format);
			}).fail(function(){
				alert('something went wrong');
			});

		}
	}
}

function findSeasonInfo($result){
	var tmdb_id = $result.find('.tmdbid').text();
	var success = function(d){
			console.log('found tv byid:');
			d = $.parseJSON(d);
			console.log(d);
			var season_data = {'seasons':d.seasons};

			console.log(season_data);

			$result.find('.extraInfo').text(d.number_of_seasons+' Seasons');

			var $seasons = $result.find('.seasonWrapper');
			$seasons.html('');

			var seasons_hb   = $("#result-seasons").html();
			var seasons_tmpl = Handlebars.compile(seasons_hb);
			var  seasons = seasons_tmpl(season_data);
			$seasons.append(seasons);
			highlightExisting();
			resetSeasonListeners();
	}
	var fail = function(d){
			console.log(d);
		}
	theMovieDb.tv.getById({"id":tmdb_id },success,fail);
}

function locateIMDBID($result){

	if(!$result.data('imdb_id')){
		console.log('I need the imdb_id');
		var tmdb_id = $result.find('.tmdbid').text();

		var success = function(d){
			console.log('found byid:');
			d = $.parseJSON(d);

			$result.attr('data-imdb_id',d.imdb_id);
			console.log(d.imdb_id);
			console.log(d);
		}

		var fail = function(d){
			console.log(d);
		}

		theMovieDb.movies.getById({"id":tmdb_id },success,fail);
	} else {
		console.log('already had the imdb_id');
	}

}

function inOurData(tmdb_id,type){
	var logged = _.where(globalData, {'tmdb_id':tmdb_id,'type':type});
	return logged.length > 0;

}

function ourVersion(tmdb_id){
	var logged = _.where(globalData, {'tmdb_id':tmdb_id});
	return logged[0];
}

function resetActiveResult(){
	resetActive();

	$('.copiesWrapper').each(function(){
		$(this).html('');
	});

	$('.seasonWrapper').each(function(){
		$(this).html('');
	});

	$('.result .activated').each(function(){
		$(this).removeClass('purpleActive');
	});
}

function resetActive() {
	$('.season .activated').removeClass('purpleActive');
	$('.possiblyActive').removeClass('activatedRightNow');
}
function activateRow(iterator){

	var currentlyOn = globalActivated;
	console.log('currently on ' + currentlyOn);

	if(currentlyOn == 0 && iterator == -1) {
		//back to search
		globalActivated = null;
		console.log('heading to searchbox');
		$('#searchbox').val('');
		$('#searchbox').focus();
		resetActiveResult();

	} else {
		var headedTo = 0;
		if(currentlyOn !== null) {
			headedTo = currentlyOn + iterator;
		}
		globalActivated = headedTo;
		console.log('headed to ' + headedTo);

		var $active = $($('.possiblyActive')[headedTo]);


		if($active.hasClass('result')){
			activateAResultRow($active);
		} else {
			activateASeasonRow($active);
		}

		$active.find('.activated').focus();
		activateColors($active);

	}
}

function activateColors($row){
	$row.find('.activated').addClass('purpleActive');
	$row.addClass('activatedRightNow');
}

function activateASeasonRow($row){
	console.log('activating a season');
	resetActive();

	$result = $row.parent().parent();
	globalActivated = parseInt($row.data('season_counter') + $result.data('resultrow'));
	console.log('setting global activated back to ' + globalActivated);

	activateColors($row);
}

function activateAResultRow($row){

	console.log('activating a result');
	console.log($row);
	resetActiveResult();
	globalActivated = parseInt($row.data('resultrow'));
	console.log('setting global activated back to ' + globalActivated);
	if(mode == 'movie') {
		locateIMDBID($row);
	}
	if(mode == 'tv') {
		findSeasonInfo($row);
	}

	activateColors($row);

}

function activateResult($result){
	console.log('you clicked it');

	if($result.hasClass('result')) {
		console.log('its a real result');
		activateAResultRow($result);
	} else {
		console.log('its a season');
		activateASeasonRow($result);
	}

}

function activatePrevResult() {
	activateRow(-1);
}
function activateNextResult() {
	activateRow(1);
}

function TMDBMovieSuccess(data,year) {
  console.log("theMovieDb movie search callback:");
  data = $.parseJSON(data);
  console.log(data);
  newTMDBResult(data);

};

function TMDBTvSuccess(data){
	console.log("theMovieDb tv search callback:");
  data = $.parseJSON(data);
  console.log(data);
  newTMDBTvResult(data);
}

function errorCB() {
	console.log('error');
}

function searchTMDB(searchString, year, mode, page) {
		searchStringEnc = encodeURIComponent(searchString);
		query = {"query":searchStringEnc,"include_adult":true};

		if(page) {
			query.page = page.toString();
		}
		if(year) {
			query.primary_release_year = year.toString();
		}
		if(mode == 'movie'){
			theMovieDb.search.getMovie(query, TMDBMovieSuccess, errorCB);
		} else if (mode == 'tv') {
			theMovieDb.search.getTv(query, TMDBTvSuccess, errorCB);
		}

}

function doSearch(searchString, year){
		globalActivated = null;
		var mode = $('#searchType:checked').val();

  	$('#loading').show();
  	$('#results').show();
  	$('#initialMsg').hide();

  	activeResult = 0;

  	searchStringEnc = encodeURIComponent(searchString);

  	year = false;
  	searchTMDB(searchString, year, mode);
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
	if($('#tv').is(':checked')) {
		data.tv = '1';
	} else {
		data.tv = '0';
	}


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
		$('#tv').attr('checked', false);
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

var mode = 'movie';
var globalActivated = null;

$(document).ready(function(){

	syncWithServer();


	$('#cantFindIt').mousedown(function(){
		showManualForm();
	});

	$('#findItLater').mousedown(function(){
		hideManualForm($(this));
	});

	$('[name="searchType"]').click(function(){
		mode = $(this).val();
		doSearch($('#searchbox').val(),false);
	});

	var searchInProgress = false;


	$(document).keyup(function(e){
		if(e.which == 40) {//down
			e.preventDefault();
			console.log('youpressed down');
			console.log('currentlyOn:' + globalActivated)

			activateNextResult(globalActivated);
		}
		if (e.which == 38) {//up
			e.preventDefault();
			activatePrevResult(globalActivated);
		}
	});

	$('#searchbox').keyup(function(e){
		e.preventDefault();



		// console.log(e.which); //down = 40,Right: 39,Left: 37,Esc: 27,Up: 38
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
			if(e.which == 40) {//down
				e.preventDefault();
			} else if(!searchInProgress){
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


	});

	$('#helpToggle').click(function(e){
		e.preventDefault();
		$('#helpme').toggle();
	});

});

