// karma.conf.js
module.exports = function(config) {
    config.set({
        browsers: ['PhantomJS', 'PhantomJS_custom', 'Chrome'],
        basePath: '../ServicePulse.Host/app',
        files: [
            './modules/dist/shell.dist.js',
            '../../ServicePulse.Host.Tests/tests/js/angular-mocks.js',
            './js/app.js',            
            './js/**/*.html',
            './js/config/app.constants.js',
            './js/**/*.module.js',
            './js/**/*.tabset.js',
            './js/**/*.js',            
            './modules/dist/configuration.dist.js',
            './modules/dist/monitoring.dist.js',            
            '../../ServicePulse.Host.Tests/tests/**/*.spec.js'],        
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
            '/js/views/dashboard/dashboard.html': '/base/js/views/dashboard/dashboard.html'            
        },
        
        phantomjsLauncher: {
            // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
            exitOnResourceError: true
        }        
    })
}