/**
 * Gruntfile
 *
 * Handles the building of the application.
 *
 * @param grunt
 */

"use strict";

/* Node modules */
var _ = require("lodash");
var semver = require("semver");


function cleanTarget (target) {

    if (target) {
        target = ":" + target;
    } else {
        target = "";
    }

    return target;

}


module.exports = function (grunt) {

    /* Load all grunt tasks */
    require("load-grunt-tasks")(grunt);
    require("grunt-timer").init(grunt);

    var bower = grunt.file.readJSON("bower.json");
    var pkg = grunt.file.readJSON("package.json");

    var config = {
        app: pkg.name,
        build: "dist",
        coverage: "coverage",
        port: 3000,
        src: "src",
        test: "test",
        version: bower.version
    };

    grunt.initConfig({
        banner: [
            "/*!",
            " * <%= pkg.name %>",
            " *",
            " * @author <%= pkg.author %>",
            " * @build <%= grunt.template.today(\"isoDateTime\") %>",
            " * @description <%= pkg.description %>",
            " * @license <%= pkg.license %>",
            " * @version v<%= config.version %>", /* Use bower as can set this manually for building before tagging */
            " */"
        ].join("\n"),
        config: config,
        pkg: pkg,
        browserify: {
            src: {
                options: {
                    banner: "<%= banner %>"
                },
                files: {
                    "./<%= config.build %>/<%= config.app %>.js": [
                        "./<%= config.src %>/<%= config.app %>.js"
                    ]
                }
            }
        },
        clean: {
            build: {
                files: [{
                    src: [
                        "./<%= config.build %>"
                    ]
                }]
            },
            coverage: {
                files: [{
                    src: [
                        "./<%= config.coverage %>"
                    ]
                }]
            }
        },
        copy: {
            src: {
                files: [{
                    expand: true,
                    src: [
                        "./<%= config.src %>/**/*.js"
                    ],
                    dest: "./<%= config.build %>"
                }]
            }
        },
        jscs: {
            options: {
                config: ".jscsrc"
            },
            src: {
                files: {
                    src: [
                        "./<%= config.src %>/**/*.js",
                        "./<%= config.test %>/**/*.js"
                    ]
                }
            }
        },
        jshint: {
            options: {
                bitwise: true,
                camelcase: true,
                curly: true,
                eqeqeq: true,
                esnext: true,
                globals: {
                    angular: true
                },
                immed: true,
                indent: 4,
                latedef: true,
                noarg: true,
                node: true,
                newcap: true,
                quotmark: "double",
                regexp: true,
                strict: true,
                trailing: true,
                undef: true,
                unused: false
            },
            src: {
                files: {
                    src: [
                        "Gruntfile.js",
                        "./<%= config.src %>/**/*.js"
                    ]
                }
            }
        },
        jsonlint: {
            src: {
                src: [
                    "./*.json",
                    "./<%= config.src %>/**/*.json",
                    "./<%= config.test %>/**/*.json"
                ]
            }
        },
        karma: {
            src: {
                configFile: "./<%= config.test %>/karma.conf.js",
                singleRun: true
            }
        },
        ngAnnotate: {
            src: {
                files: {
                    "./<%= config.build %>/<%= config.app %>.js": [
                        "./<%= config.build %>/<%= config.app %>.js"
                    ]
                }
            }
        },
        prompt: {
            npmVersion: {
                options: {
                    questions: [{
                        choices: [{
                            value: "build",
                            name:  "Build:  " + (pkg.version + "-?").yellow + " Unstable, betas, and release candidates."
                        }, {
                            value: "patch",
                            name:  "Patch:  " + semver.inc(pkg.version, "patch").yellow + "   Backwards-compatible bug fixes."
                        }, {
                            value: "minor",
                            name:  "Minor:  " + semver.inc(pkg.version, "minor").yellow + "   Add functionality in a backwards-compatible manner."
                        }, {
                            value: "major",
                            name:  "Major:  " + semver.inc(pkg.version, "major").yellow + "   Incompatible API changes."
                        }, {
                            value: "custom",
                            name:  "Custom: " + "?.?.?".yellow + "   Specify version..."
                        }
                        ],
                        config: "bump.increment",
                        message: "What sort of increment would you like?",
                        type: "list"
                    }, {
                        config: "bump.version",
                        message: "What specific version would you like",
                        type: "input",
                        when: function (answers) {
                            return answers["bump.increment"] === "custom";
                        },
                        validate: function (value) {
                            var valid = semver.valid(value) && true;
                            return valid || "Must be a valid semver, such as 1.2.3-rc1. See " +
                                "http://semver.org/".blue.underline + " for more details.";
                        }
                    }]
                }
            }
        },
        shell: {
            gitPush: {
                command: "git push"
            },
            gitPushTags: {
                command: "git push origin --tags"
            },
            npmVersion: {
                command: function () {
                    var bump = {
                        increment: grunt.config.get("bump.increment"),
                        version: grunt.config.get("bump.version")
                    };

                    var script = bump.increment;

                    if (script === "custom") {
                        script = bump.version;
                    }

                    return "npm version " + script;
                }
            }
        },
        uglify: {
            options: {
                banner: "<%= banner %>"
            },
            src: {
                files: {
                    "./<%= config.build %>/<%= config.app %>.min.js": [
                        "./<%= config.build %>/<%= config.app %>.js"
                    ]
                }
            }
        },
        watch: {
            options: {
                atBegin: true,
                dateFormat: function (time) {
                    grunt.log.writeln("The task finished in " + time + "ms");
                    grunt.log.writeln("Waiting for more changes…");
                }
            },
            compile: {
                files: [
                    "Gruntfile.js",
                    "package.json",
                    "<%= config.src %>/**/*.js",
                    "<%= config.src %>/**/*.json",
                    "<%= config.test %>/**/*.js",
                    "<%= config.test %>/**/*.json"
                ],
                tasks: [
                    "compile"
                ]
            },
            test: {
                files: [
                    "Gruntfile.js",
                    "package.json",
                    "<%= config.src %>/**/*.js",
                    "<%= config.src %>/**/*.json",
                    "<%= config.test %>/**/*.js",
                    "<%= config.test %>/**/*.json"
                ],
                tasks: [
                    "test"
                ]
            }
        }
    });

    grunt.registerTask("build", "Builds an artifact", [
        "clean:build",
        "test",
        "compile"
    ]);

    grunt.registerTask("compile", "Compiles the public application", [
        "browserify:src",
        "ngAnnotate:src",
        "uglify:src"
    ]);

    grunt.registerTask("default", [
        "build"
    ]);

    grunt.registerTask("lint", "Runs code quality tests", [
        "jshint",
        "jscs",
        "jsonlint"
    ]);

    grunt.registerTask("test", "Runs tests on the application", [
        "lint",
        "unittest"
    ]);

    grunt.registerTask("tag", "Tag a new release", [
        "prompt:npmVersion",
        "shell:npmVersion",
        "shell:gitPush",
        "shell:gitPushTags"
    ]);

    grunt.registerTask("unittest", "Executes the unit tests", [
        "karma:src"
    ]);

};
