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
		showGoogleDocsInputs();

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
	seeds = _.map(seeds,function(d,i){
		if(d.tmdbid){
			if(inOurData(d.tmdbid)){
				d.logged = 'logged';
				totalLogged++;
			}
		}
		return d;
	});
	seeds = _.sortBy(seeds,function(d){
		var theComparator = parseInt(d.hits);
		if(d.hits == 0) {
			theComparator = 1.1;
		}
		return theComparator - 1;
	});
	var d = {'seeds':seeds};
	var result   = $("#result-gdocs").html();
	var result_templ = Handlebars.compile(result);
	var movie = result_templ(d);
	$('#results').append(movie);
	initialListeners();
	$('#totalLogged').text(totalLogged);
}
activeResult = null;
function activateResult(iterator,force) {

	var newResult = 0;
	if(_.isNull(activeResult)){
		newResult = 0;
	} else {
		newResult = activeResult + iterator;
	}
	if(force || force === 0) {
		newResult = force;
	}
	if(newResult >= 0 && newResult < seeds.length){
		var $target = $('[data-entry="'+newResult+'"]');
		if($target.hasClass('resultLogged') || false){
			//todo: how to skep ahead??
			//activateResult(1);
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


	}
}
function hitAPI($target) {
	console.log($target);
	var title = $target.find('.title-input').val();

	var query = encodeURIComponent(title);
	console.log(query);
	query = {"query":query,"include_adult":true};
	theMovieDb.search.getMovie(query, apiSuccess, apiError);

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
	$('.entry').click(function(e){
		var which = $(this).data('entry');
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

	activateResult(1);

	saveMovie(data);

	seeds[entry].title = title;
	seeds[entry].more = newMore;
	seeds[entry].tmdbid = data.tmdb_id;
	seeds[entry].logged = "logged";

	var logged = parseInt($('#totalLogged').text());
	logged += 1;
	$('#totalLogged').text(logged);
}

$(document).ready(function(){

	//massageData();
	syncWithServer();

	var theTimeout = setInterval(function(){
		//activateResult(1);
	},1000);

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

Handlebars.registerHelper('greaterThan', function(first, second, options) {
  if(first > second) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

