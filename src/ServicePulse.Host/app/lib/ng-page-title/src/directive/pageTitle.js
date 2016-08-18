/**
 * pageTitle
 */

"use strict";


/* Node modules */


/* Third-party modules */
var _ = require("lodash");


/* Files */


/* @ngInject */
function PageTitle ($rootScope, $interpolate, $route) {


    return {

        link: function (scope, element, attrs) {

            var listener = function (event, next) {

                var title = attrs.pageTitle || "Untitled page"; /* Get the default title */
                var titleElement = attrs.titleElement || "pageTitle"; /* Where to look for the title in the data */
                var pattern = attrs.pattern || null; /* Do we need to decorate the title? */

                /* Get the page title from the data element */
                if (_.has(next, ["$$route", "data", titleElement]) && _.isEmpty(next.$$route.data[titleElement]) === false) {
                    title = next.$$route.data[titleElement];
                }

                /* Interpolate the title */
                var currentState = next;
                if (_.has(currentState, "locals")) {
                    currentState = currentState.locals;
                }

                title = $interpolate(title)(currentState);

                if (_.isString(pattern)) {
                    title = pattern.replace(/\%s/g, title);
                }

                /* Set the title */
                element.text(title);

            };

            $rootScope.$on("$routeChangeSuccess", listener);

        },

        restrict: "A",

        scope: false

    };


}


module.exports = PageTitle;
