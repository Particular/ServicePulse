var system = require('system'),
  env = system.env;

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001, //< Default Max Timeout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function () {
            if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof (testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if (!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof (onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 100); //< repeat check every 100ms
};

if (system.args.length !== 2) {
    console.log('Usage: run-jasmine.js URL');
    phantom.exit(1);
}

var page = require('webpage').create();

/**
 *
##teamcity[testSuiteStarted name='suite.name']
##teamcity[testSuiteStarted name='nested.suite']
##teamcity[testStarted name='package_or_namespace.ClassName.TestName']
##teamcity[testFailed name='package_or_namespace.ClassName.TestName' message='The number should be 20000' details='expected:<20000> but was:<10000>']
##teamcity[testFinished name='package_or_namespace.ClassName.TestName']
##teamcity[testSuiteFinished name='nested.suite']
##teamcity[testSuiteFinished name='suite.name']
 */
// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function (msg) {
    var teamCityMessage = msg.indexOf('TEAMCITY_') === 0;
    if (teamCityMessage) {
        if (!env.hasOwnProperty('TEAMCITY_PROJECT_NAME')) return;
        var separatorIndex = msg.indexOf(':');
        var command = msg.substring(0, separatorIndex);
        var data = JSON.parse(msg.substring(separatorIndex + 1));
        switch (command) {
            case 'TEAMCITY_TESTSTARTED': {
                console.log("##teamcity[testStarted name='" + escape(data.name) + "']");
                break;
            }
            case 'TEAMCITY_TESTFINISHED': {
                console.log("##teamcity[testFinished name='" + escape(data.name) + "']");
                break;
            }
            case 'TEAMCITY_SUITESTARTED': {
                console.log("##teamcity[testSuiteStarted name='" + escape(data.suite) + "']");
                break;
            }
            case 'TEAMCITY_SUITEFINISHED': {
                console.log("##teamcity[testSuiteFinished name='" + escape(data.suite) + "']");
                break;
            }
            case 'TEAMCITY_TESTFAILED': {
                console.log("##teamcity[testFailed name='" + escape(data.name) + "' message='" + escape(data.message) + "']");
                break;
            }
        }
    }
    else {
        if (env.hasOwnProperty('TEAMCITY_PROJECT_NAME')) return;
        console.log(msg);
    }

    function escape(message) {
        while (message.indexOf("'") >= 0) message = message.replace("'", '"');
        return message;
    }
};

page.open(system.args[1], function (status) {
    if (status !== "success") {
        console.log("Unable to access network");
        phantom.exit();
    } else {
        waitFor(function () {
            return page.evaluate(function () {
                return document.body.querySelector('.symbolSummary .pending') === null
            });
        }, function () {
            var exitCode = page.evaluate(function () {
                var currentSuite;
                var successList = document.body.querySelectorAll('.results > .summary .specs > .passed');
                var suites = {};
                if (successList && successList.length > 0) {
                    for (var i = 0; i < successList.length; ++i) {
                        var el = successList[i],
                            name = el.children[0].innerText,
                            suite = el.parentElement.parentElement.querySelector('.suite-detail').innerText;

                        suites[suite] = suites[suite] || [];
                        suites[suite].push({ status: 'success', name: name });
                    }
                }

                var failedList = document.body.querySelectorAll('.results > .failures > .spec-detail.failed');
                if (failedList && failedList.length > 0) {
                    console.log('');
                    console.log(failedList.length + ' test(s) FAILED:');
                    for (var i = 0; i < failedList.length; ++i) {
                        var el = failedList[i],
                            name = el.querySelector('.description').innerText,
                            msg = el.querySelector('.result-message').innerText,
                            suite = name.substring(0, name.indexOf(' '));

                        // remove trailing period
                        name = name.substring(0, name.length - 1);

                        suites[suite] = suites[suite] || [];
                        suites[suite].push({ suite: suite, status: 'failed', name: name, message: name + ': ' + msg });
                    }
                }

                for (var suite in suites) {
                    var tests = suites[suite];
                    console.log('TEAMCITY_SUITESTARTED:' + JSON.stringify({ suite: suite }));
                    for (var i in tests) {
                        var test = tests[i];
                        console.log('TEAMCITY_TESTSTARTED:' + JSON.stringify({ name: test.name }));
                        if (test.status === 'success') {
                        }
                        else if (test.status === 'failed') {
                            console.log('TEAMCITY_TESTFAILED:' + JSON.stringify({ name: test.name, message: test.message }));
                            console.log('');
                            console.log(test.suite);
                            console.log(test.message);
                        }

                        console.log('TEAMCITY_TESTFINISHED:' + JSON.stringify({ name: test.name }));
                    }

                    console.log('TEAMCITY_SUITEFINISHED:' + JSON.stringify({ suite: suite }));
                }

                if (failedList && failedList.length > 0) {
                    return 1;
                } else {
                    console.log(document.body.querySelector('.alert > .bar.passed').innerText);
                    return 0;
                }
            });
            phantom.exit(exitCode);
        });
    }
});