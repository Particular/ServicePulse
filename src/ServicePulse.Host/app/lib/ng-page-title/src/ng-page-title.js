/**
 * app
 */

"use strict";


/* Node modules */


/* Third-party modules */


/* Files */


var app = angular.module("ngPageTitle", [])

    /* Directives */
    .directive("stateTitle", require("./directive/stateTitle"))
    .directive("pageTitle", require("./directive/pageTitle"));


module.exports = app;
