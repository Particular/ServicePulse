/**
 * stateTitle
 */

"use strict";


/* Node modules */


/* Third-party modules */
var _ = require("lodash");


/* Files */


/* @ngInject */
function StateTitle ($rootScope, $interpolate, $state) {


    return {

        link: function (scope, element, attrs) {

            var listener = function (event, toState) {

                var title = attrs.stateTitle || "Untitled page"; /* Get the default title */
                var titleElement = attrs.titleElement || "pageTitle"; /* Where to look for the title in the data */
                var pattern = attrs.pattern || null; /* Do we need to decorate the title? */

                /* Get the page title from the data element */
                if (_.has(toState, "data") && _.has(toState.data, titleElement) && _.isEmpty(toState.data[titleElement]) === false) {
                    title = toState.data[titleElement];
                }

                /* Interpolate the title */
                var currentState = $state.$current;
                if (_.has(currentState, "locals") && _.has(currentState.locals, "globals")) {
                    currentState = currentState.locals.globals;
                }

                title = $interpolate(title)(currentState);

                if (_.isString(pattern)) {
                    title = pattern.replace(/\%s/g, title);
                }

                /* Set the title */
                element.text(title);

            };

            $rootScope.$on("$stateChangeSuccess", listener);

        },

        restrict: "A",

        scope: false

    };


}


module.exports = StateTitle;
