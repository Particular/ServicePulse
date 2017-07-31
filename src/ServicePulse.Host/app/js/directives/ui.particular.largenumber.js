(function(window, angular, undefined) {
	'use strict';

	angular.module('ui.particular.largenumber', [])
	  .filter('largeNumber', function () {
	  	return function (input, decimals) {
	  		var exp, rounded,
			  suffixes = ['k', 'M', 'G', 'T', 'P', 'E'];

	  		if (window.isNaN(input)) {
	  			return null;
	  		}

	  		if (input < 1000) {
	  			return input;
	  		}

	  		exp = Math.floor(Math.log(input) / Math.log(1000));

	  		return (input / Math.pow(1000, exp)).toFixed(decimals) + suffixes[exp - 1];
	  	};
	  });
}(window, window.angular));