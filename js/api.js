var baseURL = 'http://kovalent.co/clients/kenvideo/kvmdb/api/';
var api = {};
api.copies = {}

api.copies.create = function(data){
	var dfd = $.Deferred();

	console.log('creating a copy with');
	console.log(data);
	var url = baseURL + "movies/copies/add/";
	$.ajax({
	  type: "POST",
	  url: url,
	  data: data
	}).success(function(d){
		console.log('api.copies.create: success');
		dfd.resolve(d);
	}).error(function(d){
		console.log('api.copies.create: error');
		dfd.reject(d);
	});

	return dfd.promise();
}

api.copies.list = function(data){
	var dfd = $.Deferred();

	console.log('finding copies for');
	console.log(data);
	var url = baseURL + "/movies/copies/list/";
	$.ajax({
	  type: "POST",
	  url: url,
	  data: data
	}).success(function(d){
		console.log('api.copies.list: success');
		d = $.parseJSON(d);
		dfd.resolve(d);
	}).error(function(d){
		console.log('api.copies.list: error');
		dfd.reject(d);
	});

	return dfd.promise();
}

api.copies.update = function(data){
	var dfd = $.Deferred();

	console.log('updating copy for');
	console.log(data);
	var url = baseURL + "/movies/copies/update/";
	$.ajax({
	  type: "POST",
	  url: url,
	  data: data
	}).success(function(d){
		console.log('api.copies.update: success');
		dfd.resolve(d);
	}).error(function(d){
		console.log('api.copies.update: error');
		dfd.reject(d);
	});

	return dfd.promise();
}

api.copies.remove = function(data){
	var dfd = $.Deferred();

	console.log('removing copy for');
	console.log(data);
	var url = baseURL + "/movies/copies/remove/";
	$.ajax({
	  type: "POST",
	  url: url,
	  data: data
	}).success(function(d){
		console.log('api.copies.remove: success');
		dfd.resolve(d);
	}).error(function(d){
		console.log('api.copies.remove: error');
		dfd.reject(d);
	});

	return dfd.promise();
}