
//only extend results when there the box is checked,
//add a box for blueray / dvd
//setup a server to recieve title, year, tmdbid, and imdbid

var newOMDBResult = function(d){
	if(d.Released) {
			yr = (d.Released).split(' ')[2];
		}
	d.year = yr;

	if (d && d.Title) {
		var omdbResult   = $("#result-omdb").html();
		var omdbResultTemplate = Handlebars.compile(omdbResult);
		var result = omdbResultTemplate(d);
		$('#results').append(result);
	}

	var templ = '<div class="title">'+d.Title+'</div>';
	templ += '<div class="actors">'+d.Actors+'</div>';
	templ += '<div class="plot">'+d.Plot+'</div>';
	templ += '<div class="poster"><img src="'+d.Poster+'"/></div>';
	templ += '<div class="year">'+d.Released+'</div>';
	templ += '<div class="imdbID">'+d.imdbID+'</div>';
	templ += '<div class="rating">'+d.Rated+'</div>';


}

var newTMDBResult = function(d) {
	$('#loading').hide();
	$('.result').remove();
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
	$('.result').click(function(){
		var tmdbid = $(this).attr('id').split('_')[1];
		console.log(tmdbid);
		theMovieDb.movies.getById({"id":tmdbid }, extendResult, errorCB);
	});
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

  function doSearch(searchString, year){
  	$('#loading').show();
  	$('#results').show();
  	$('#initialMsg').hide();

  	searchStringEnc = encodeURIComponent(searchString);
  	searchString2 = $.param({q:searchString});
  	searchString3 = $.param({t:searchString});
  	theMovieDb.search.getMovie({"query":searchStringEnc}, TMDBSuccess, errorCB);

  	omdbQuery = 'http://www.omdbapi.com/?t='+searchString+'&y='+year+'&plot=full&r=json';

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

	$('#searchform1').submit(function(e){
		e.preventDefault();
		var query = $(this).find('#searchbox').val();
		var year = $(this).find('#yearbox').val();
		doSearch(query, year);
	});

	$('#searchbox').keypress(function(e){
		var query = $(this).val();
		//var year = $(this).find('#yearbox').val();
		var year ='';
		doSearch(query, year);
	});

});


