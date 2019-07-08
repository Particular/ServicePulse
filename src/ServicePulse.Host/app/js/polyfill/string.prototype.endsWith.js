// Code taken from MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith#Polyfill
// which is shared using the following license: cc-by-sa 2.5 https://creativecommons.org/licenses/by-sa/2.5/
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(search, this_len) {
		if (this_len === undefined || this_len > this.length) {
			this_len = this.length;
		}
		return this.substring(this_len - search.length, this_len) === search;
	};
}