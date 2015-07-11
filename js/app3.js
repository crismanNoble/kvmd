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
	initialListeners();

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

function activate($who) {
	$('.extendedResults').html('');
	$('.activator').removeClass('active');
	$('.extendedResults').hide();
	$who.find('.activator').addClass('active');

	var $copies = $who.find('.extendedResults');
	var index = $who.data('index').toString();

	api.copies.list({'title_id':index}).done(function(data){
		console.log('got it');

		var data = {'copies':data};
		console.log(data);
		var copies_hb = $("#result-copies").html();
		var copies_tmpl = Handlebars.compile(copies_hb);
		var copies = copies_tmpl(data);
		$copies.append(copies);
		resetListeners();
	}).fail(function(){
		console.log('failed to fetch copies for '+index);
	});

	$copies.show();
	resetListeners();
}

function sendNewCopy(data){
	api.copies.create(data).done(function(){
		console.log('copy creation succeeded');
	}).fail(function(){
		console.log('copy creation failed');
	});
}

///what you were doing

//1. remove a copy with button
//2. add the copy to the list when the id comes back
//3. clear out the new copy field.
//4. update the copy when a field is edited.
//5. require format when saving new one
//6. provide a save button and a deletion alert, put deletes into a delete db
//7. backup db

function saveNewCopy($title){
	console.log('going to add  a new copy');
	var title_id = $title.data('index').toString().trim();
	var format = $title.find('.newCopy.formatType').val().trim();
	var edition = $title.find('.newCopy.editionEditor').val().trim();
	var data = {'title_id':title_id,'format':format,'edition':edition};

	console.log(data);
	api.copies.create(data).done(function(d){
		console.log('copy creation succeeded');
		console.log('the new copies id is');
		console.log(d);

		data.index = d;

		data.total = ($title.find('.copy').length + 1).toString();

		console.log(data.total);
		console.log(data);

		var copy_hb   = $("#result-copy").html();
		var copy_tmpl = Handlebars.compile(copy_hb);
		var newCopy = copy_tmpl(data);

		$title.find('.copies').append(newCopy);

		$title.find('.newCopy.formatType').val('');
		$title.find('.newCopy.editionEditor').val('');
		resetListeners();

	}).fail(function(){
		console.log('copy creation failed');
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
function initialListeners(){
	$('.activator').click(function(){
		activate($(this).parent());
	});

	$('.killit').click(function(e){
		e.preventDefault();

		var who = $(this).data('index');
		console.log(who);
		removeEntry(who);
	});

}
function resetListeners() {

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

	$('button.newCopy').click(function(){
		console.log('clicked new copy');
		saveNewCopy($(this).parent().parent().parent().parent());
	});

}



function createCopies($this) {
	var data = resultToObject($this);
	var copyData = {'title_id':data.index};
	if(data.dvd > 0) {
		for (var i=0; i<data.dvd; i++) {
			var thisCopy = _.extend(copyData,{'format':'DVD'});
			console.log(thisCopy);
			sendNewCopy(thisCopy);
		}
	}
	if(data.blu > 0) {
		for (var i=0; i<data.blu; i++) {
			var thisCopy = _.extend(copyData,{'format':'BLU'});
			console.log(thisCopy);
			sendNewCopy(thisCopy);
		}
	}
}

function crawlDown() {
	var count = 0;
	var $rows = $('.row');

	var intervalID = setInterval(function(){
		if(count < globalData.length) {
			$this = $($rows[count]);
			// var tmdb_id = $this.find('.tmdb').text().trim();
			// if($this.find('.imdb').text().trim() == '' || $this.find('.year').text().trim() == '????'){
			// 	hitAPI(tmdb_id);
			// }

			createCopies($this)


			count ++;
		}	else {
			clearInterval(intervalID);
		}
	}, 200);

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

function resultToObject($result){
	//could be $who = $('[data-index="'+who+'"]');
	//or $who = $('[data-tmdb="'+who+'"]');
	//but it is up to the caller to do that
	var data = {};

	data.year = $result.find('.year .content').text().trim();
	data.title = $result.find('.title .content').text().trim();
	data.imdb_id = $result.find('.tmdb').text().trim();
	data.tmdb_id = $result.find('.imdb').text().trim();
	data.blu = $result.find('.blu').text().trim();
	data.dvd = $result.find('.dvd').text().trim();
	data.index = $result.data('index').toString().trim();

	return data;
}

function removeEntry(who){

	var $who = $('[data-index="'+who+'"]');
	var data = resultToObject($who);

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


