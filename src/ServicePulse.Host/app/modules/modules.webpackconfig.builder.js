const fs = require('fs');

var config = require('./modules.webpackconfig.js');

delete config.watch;
delete config.watchOptions;
// function to replace src="modules/dist/*.js" with the hash appended
config.plugins.push(function() {
    this.plugin('done', function (statsData) {
        const stats = statsData.toJson();

        if (!stats.errors.length) {
            const html = fs.readFileSync('./app/index.html', 'utf8');
            const now = Date.now();

            let tokenizedMarkup = html.split('.js?v=').map(token => token.split('"></script>'));
            let flattenedTokens = tokenizedMarkup.reduce((acc, val) => acc.concat(val), []);
            let htmlOutput = flattenedTokens.filter((token, index) => index % 2 == 0).join('.js?v=' + now + '"></script>');

            fs.writeFileSync('./app/index.html', htmlOutput);
        }
    });
})

module.exports = config;