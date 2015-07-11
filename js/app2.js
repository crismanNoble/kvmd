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
		globalData = d;
		fetchSeeds();
		//showGoogleDocsInputs();
	});
}

var saveMovie = function(data){
	var url = "http://kovalent.co/clients/kenvideo/kvmdb/api/movies/new/";

	console.log('datato be saved');
	console.log(data);

	$.ajax({
	  type: "POST",
	  url: url,
	  data: data
	}).done(function(d){
		console.log('saved it');
		console.log(d);
	});
}

function fetchSeeds(){
	var url = "http://kovalent.co/clients/kenvideo/kvmdb/api/movies/seeds/all/";

	$.ajax({
	  type: "POST",
	  url: url,
	}).done(function(output){
		output = $.parseJSON(output);
		console.log('theseeds are:');
		console.log(output);

		seeds = output

		showGoogleDocsInputs();
	});


}

function addSeed(input){
	var url = "http://kovalent.co/clients/kenvideo/kvmdb/api/movies/seeds/add/";

	$.ajax({
	  type: "POST",
	  url: url,
	  data: input
	}).done(function(output){
		console.log('added to the seeds');
	});
}

function updateSeed(input){
	var url = "http://kovalent.co/clients/kenvideo/kvmdb/api/movies/seeds/update/";

	$.ajax({
	  type: "POST",
	  url: url,
	  data: input
	}).done(function(output){
		console.log('updated that seed');
	});
}

function inOurData(tmdb_id){
	tmdb_id = tmdb_id.toString();
	var logged = _.where(globalData, {'tmdb_id':tmdb_id});
	return logged.length > 0;

}

function updateData() {
	seeds = _.map(seeds,function(d,i){
		var $el = $('[data-entry="'+i+'"]');
		var hits = $el.find('.matches').text();
		if(hits !== ''){
			d.hits = hits;
		}
		if(d.hits == 1) {
			d.tmdbid = $el.data('tmdbid');
		}
		d.title = $el.find('.title-input').val();
		d.more = $el.find('.more-input').val();
		return d;

	});
	console.log(seeds);
	console.log('dataString()');
}

function massageData() {
	if(false) {

		seeds = _.map(seeds,function(d,i){
			d.index = i.toString();
			if(d.DVD == 'x') {
				d.dvd = "1";
			}
			if(d["Blu Ray"] == 'x') {
				d.blu = "1";
			}
			d.more = '';
			if(d.UPC != '') {
				d.more += d.UPC;
			}
			if(d.Director != '') {
				if(d.UPC != '') {
					d.more += ' / ';
				}
				d.more += d.UPC;
			}

			d.title = d.Title;

			delete d.Title;
			delete d.UPC;
			delete d["Blu Ray"];
			delete d.DVD;
			delete d.Director;
			if(d.more == '') {
				delete d.more;
			}
			return d;

		});
	}
	console.log(seeds);
}

function dataString() {
	return JSON.stringify(seeds);
}
function showGoogleDocsInputs() {

	console.log('showing the googleDocsResults');

	seeds = _.map(seeds,function(d,i){
		if(d.tmdb_id && d.logged == '0'){
			if(inOurData(d.tmdb_id)){
				d.logged = '1';
				updateSeed(d);
				totalLogged++;
			}
		}
		return d;
	});
	seeds = _.sortBy(seeds,function (d){
		return parseInt(d.index);
	});

	var d = {'seeds':seeds};
		console.log(d);
	var result   = $("#result-gdocs").html();
	var result_templ = Handlebars.compile(result);
	var movie = result_templ(d);
	$('#results').append(movie);
	initialListeners();
	$('#totalLogged').text(totalLogged);
}
activeResult = null;

function extractDataFromResult($target) {
	var data = {};
	data.logged = $target.hasClass('resultLogged');
	data.tmdb_id = $target.data('tmdbid');
	data.dvd = $target.find('.dvd').text().trim() || '0';
	data.blu = $target.find('.blu').text().trim();
	data.details = $target.find('.more-input').val().trim();
	data.title = $target.find('.title-input').val().trim();
	data.tmdb_matches = $target.find('.matches').text().trim();
	data.index = $target.data('entry').toString();

	if(data.tmdb_id) {
		data.tmdb_id = data.tmdb_id.toString();
	} else {
		data.tmdb_id = ''
	}
	if(data.tmdb_matches == '') {
		data.tmdb_matches = '0';
	}

	if(data.dvd == '') {
		data.dvd = '0';
	}

	if(data.blu == '') {
		data.blu = '0';
	}

	if(data.logged) {
		data.logged = '1';
	} else {
		data.logged = '0';
	}

	return data;
}
function activateResult(iterator,force) {

	console.log('active result' + activeResult + 'activated' + iterator);

	var newResult = 0;
	if(_.isNull(activeResult)){
		activeResult = 0;
	} else {
		newResult = activeResult + iterator;

	}
	if(force || force === 0) {
		newResult = force;
	}
	if(newResult >= 0){
		var $target = $('[data-entry="'+newResult+'"]');

		if($target.hasClass('resultLogged') || false){ //was || false
			//todo: how to skep ahead??
			//activateResult(1);

			var seed = extractDataFromResult($target);
			console.log(seed);
			//addSeed(seed);

		} else {
			$('.entry').removeClass('activated');
			$('.results').hide();

			$target.addClass('activated');
			activeResult = newResult;

			$target.find('.title-input').focus();
			$target.find('.results').show();

			if(!$target.hasClass('hitAPI')) {
				hitAPI($target);
			}
		}


		activeResult = newResult;
	}

}
function hitAPI($target) {
	console.log($target);
	var title = $target.find('.title-input').val();

	var query = encodeURIComponent(title);
	console.log(query);
	query = {"query":query,"include_adult":true};
	theMovieDb.search.getMulti(query, apiSuccess, apiError);

	function apiError(d){
		console.log('error');
		console.log(d);
	}

	function apiSuccess(d){
		d = $.parseJSON(d);
		console.log(d);
		writeResults($target,d);
	}

}

function writeResults($target, results){
	$target.addClass('hitAPI');
	$target.find('.results').html('');
	$target.find('.results').text(results.total_results + ' results:');

	if(results.total_results >= 1) {
		_.each(results.results,function(thisdata,i){
			var yr = '_nf_'
			if(thisdata.release_date) {
				yr = (thisdata.release_date).split('-')[0];
			}
			results.results[i].year = yr;
		});
		if(results.total_results == 1) {
			console.log('found one');
			console.log(results.results[0].id);
			$target.attr('data-tmdbid',results.results[0].id);
		} else {
			console.log('not one');
		}

		var d = results;
		var result   = $("#result-tmdb").html();
		var found_tmpl = Handlebars.compile(result);
		var movies = found_tmpl(d);
		$target.find('.results').append(movies);
		resetListeners()

	} else {

	}


}
function initialListeners(){
	$('.entry .title input').click(function(e){
		var which = $(this).parent().parent().data('entry');
		console.log(which);
		activateResult(0,which);

	});
	$('.title-input').keyup(function(e){
		e.stopPropagation();

		if(e.which == 38) {
			e.preventDefault();
			console.log('up');
			activateResult(-1);
			return false;
		}
		if(e.which == 40) {
			e.preventDefault();
			console.log('down');
			activateResult(1);
			return false;
		}
		if(e.which == 13) {
			e.preventDefault();
			console.log('enter');
			// var entry = $(this).parent().parent().data('entry');
			// var title = $($(this).parent().parent().find('.result-row')[0]).find('.result-title').text().trim();
			// var tmdbid = $($(this).parent().parent().find('.picker')[0]).data('tmdb');
			// console.log(entry);
			// console.log(title);
			// console.log(tmdbid);
			$(this).parent().parent().find('.picker').click();
			//logResult(entry,title,tmdbid);

			return false;

		}

			var $target = $(this).parent().parent();
			var search = $(this).val();



			hitAPI($target);



	});
}
function resetListeners() {
	$('.picker').click(function(){
		var tmdb = $(this).data('tmdb');
		var title = $(this).parent().parent().find('.result-title').text().trim();
		var year = $(this).parent().parent().find('.result-year').text().trim();
		var entry = $(this).parent().parent().parent().parent().data('entry');

		console.log(entry);
		console.log(title);
		console.log(tmdb);

		logResult(entry,title,tmdb,year);
	});

}

function logResult(entry,title,tmdb,year){
	$parent = $('[data-entry="'+entry+'"');
	$parent.addClass('resultLogged');
	var oldTitle = $parent.find('.title-input').val();
	$parent.find('.title-input').val(title);
	var oldMore = $parent.find('.more-input').val();
	var newMore = oldMore + oldTitle;
	$parent.find('.more-input').val(newMore);

	$parent.attr('data-tmdbid',tmdb);
	$parent.find('.matches').text('1');

	$parent.find('.results').html('');

	//actaully send off the data, after grabbing the quantites

	var data = {};
	data.title = title;
	data.year = year;
	data.dvd = $parent.find('.dvd').text() || '0';
	data.blu = $parent.find('.blu').text() || '0';
	data.tmdb_id = tmdb.toString();

	var seedData = extractDataFromResult($parent);
	seedData.tmdb_id = data.tmdb_id;
	updateSeed(seedData);

	activateResult(1);

	saveMovie(data);

	var logged = parseInt($('#totalLogged').text());
	logged += 1;
	$('#totalLogged').text(logged);
}

$(document).ready(function(){

	//massageData();
	syncWithServer();

	// var theTimeout = setInterval(function(){
	// 	activateResult(1);
	// },1000);

	$('#showLogged').click(function(){
		$('.resultLogged').toggle();
	});

	$(document).keyup(function(e){
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
		// console.log(e.which);
		// if(e.which == 87) {
		// 	e.preventDefault();
		// 	console.log('up');
		// 	activateResult(-1);
		// }
		// if(e.which == 83) {
		// 	e.preventDefault();
		// 	console.log('down');
		// 	activateResult(1);

		// }
		// if(e.which == 65) {
		// 	console.log('left');
		// }
		// if(e.which == 68) {
		// 	console.log('right');
		// }
		// if(e.which == 27) {
		// 	clearTimeout(theTimeout);
		// }
	});

});
