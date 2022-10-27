// karma.conf.js
module.exports = function(config) {
    config.set({
        browsers: ['PhantomJS', 'PhantomJS_custom', 'Chrome'],
        basePath: '../ServicePulse.Host/app',
        preprocessors: {
            '**/*.js': ['eslint']
        },
        eslint: {
            showWarnings: false
        },
        files: [
            './angular/modules/dist/shell.dist.js',
            '../../ServicePulse.Host.Tests/tests/js/angular-mocks.js',
            './angular/**/*.html',
            './js/app.constants.js',
            './angular/modules/dist/configuration.dist.js',
            './angular/app.js',
            './angular/app.bootstrap.js',
            './angular/**/*.module.js',
            './angular/**/*.tabset.js',
            './angular/directives/**/*.js',
            './js/polyfill/**/*.js',
            './angular/services/**/*.js',
            './angular/views/**/*.js',
            './angular/modules/dist/monitoring.dist.js',
            '../../ServicePulse.Host.Tests/tests/**/*.spec.js'
        ],
        frameworks: ['jasmine'],
        // you can define custom flags
        customLaunchers: {
            'PhantomJS_custom': {
                base: 'PhantomJS',
                options: {
                    windowName: 'SpecsRunner.html',
                    settings: {
                        webSecurityEnabled: false
                    },
                },
                flags: ['--load-images=true'],
                debug: true
            },
            'chrome_without_security': {
                base: 'Chrome',
                flags: ['--disable-web-security']
            },
        },

        proxies: {
            '/js/views/dashboard/dashboard.html': '/base/angular/views/dashboard/dashboard.html'
        },

        phantomjsLauncher: {
            // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
            exitOnResourceError: true
        }
    });
}