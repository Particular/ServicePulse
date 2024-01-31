namespace ServicePulse.Host.Tests
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Text.RegularExpressions;
    using NUnit.Framework;

    [TestFixture]
    public class VerifyAppConstantsJSTextReplacement
    {
        // app.constants.js holds the URL used to connect to SC
        // this both user configurable and updated during installation
        Regex sc_url_regex = new Regex(@"(service_control_url\s*\:\s*['""])(.*?)(['""])");
        Regex version_regex = new Regex(@"(version\s*\:\s*['""])(.*?)(['""])");

        [Test]
        public void App_constants_js_validation()
        {
            var pathToConfig = Path.Combine(TestContext.CurrentContext.TestDirectory, "app.constants.js");
            Assert.That(File.Exists(pathToConfig), Is.True, "app.constants.js does not exist - this will break installation code");

            var config = File.ReadAllText(pathToConfig);
            var matchUrl = sc_url_regex.Match(config);
            Assert.That(matchUrl.Success, Is.True, "regex failed to match app.constant.js for SC URI update");

            Assert.That(Uri.TryCreate(matchUrl.Groups[2].Value, UriKind.Absolute, out _), Is.True, "regex match found in app.constants.js is not a valid URI");
            var matchVersion = version_regex.Match(config);
            Assert.That(matchVersion.Success, Is.True, "regex failed to match app.constant.js for the version string");
        }

        [Test]
        public void Replace_version_regex_tests()
        {
            var configSnippets = new Dictionary<string, (string ConfigSnippet, Regex VersionRegex)>()
            {
                {
                    "1.3.0",
                    (
                        ConfigSnippet: @"angular.module('sc')
                            .constant('version', '1.3.0')
                            .constant('scConfig';",
                        VersionRegex: new Regex(@"(constant\s*\(\s*'version'\s*,\s*['""])(.*?)(['""])")
                    )
                },
                {
                    "1.3.0-beta1",
                    (
                        ConfigSnippet: @"angular.module('sc')
                            .constant ( 'version' , '1.3.0-beta1')
                            .constant('scConfig';",
                        VersionRegex: new Regex(@"(constant\s*\(\s*'version'\s*,\s*['""])(.*?)(['""])")
                    )
                },
                {
                    "",
                    (
                        ConfigSnippet: @"angular.module('sc')
                            .constant('version' , '' )
                            .constant('scConfig';",
                        VersionRegex: new Regex(@"(constant\s*\(\s*'version'\s*,\s*['""])(.*?)(['""])")
                    )
                },
                {
                    "1.20.0",
                    (
                        ConfigSnippet: @"window.defaultConfig = {
                                version: '1.20.0',
                                service_control_url: '
                            };",
                        VersionRegex: new Regex(@"(version\s*\:\s*['""])(.*?)(['""])")
                    )
                },
            };

            foreach (var config in configSnippets)
            {
                var expectedResult = config.Key;
                var text = config.Value.ConfigSnippet;

                var match = config.Value.VersionRegex.Match(text);
                Assert.That(match.Success, Is.True, "regex failed to match version string");
                Assert.That(match.Groups[2].Value.Equals(expectedResult), Is.True, string.Format("Version regex did not return expected value which was {0}", expectedResult));
            }
        }

        [Test]
        public void Test_regex_match_against_config_variants()
        {
            var configVariations = new[]
            {
                // Standard 1.20.0 config
                @"window.defaultConfig = {
                    default_route: '/dashboard',
                    version: '1.20.0',
                    service_control_url: 'http://localhost:33333/api/',
                    monitoring_urls: ['http://localhost:33633/']
                };
                ",
                // Standard 1.3 config
                @"angular.module('sc')
                    .constant('version', '1.3.0')
                    .constant('scConfig', {
                        service_control_url:'http://localhost:33333/api/',
                        service_pulse_url: 'https://platformupdate.particular.net/servicepulse.txt'
                    });
                ",
                // Added whitespace and custom FQDN
                @"angular.module('sc')
                    .constant('version', '1.3.0')
                    .constant('scConfig', {
                        service_control_url :  'http://host.network.com:33333/api/'  ,
                        service_pulse_url: 'https://platformupdate.particular.net/servicepulse.txt'
                });
                ",
                // Line breaks and flip urls
                @"angular.module('sc')
                    .constant('version', '1.3.0')
                    .constant('scConfig', {
                    service_pulse_url:
                            'https://platformupdate.particular.net/servicepulse.txt',
                            service_control_url :
                            'http://localhost:33333/api/'
                    });
                ",
                // 1.1 Config (config.js)
                @"
                    'use strict';
                    var SC = SC || {};
                    SC.config = {
                        service_control_url: 'http://localhost:33333/api/'
                    };
                ",

                // 1.1 Config custom URL(config.js)
                @"
                    'use strict';
                    var SC = SC || {};
                    SC.config = {
                        service_control_url: 'http://gb-dev:33333/api/'
                    };
                ",
                // Double Quotes instead of single
                @"
                    'use strict';
                    var SC = SC || {};
                    SC.config = {
                        service_control_url:""http://localhost:33333/api/\""
                    };
                "};

            for (var i = 0; i < configVariations.Length; i++)
            {
                var config = configVariations[i];
                var match = sc_url_regex.Match(config);
                Assert.That(match.Success, Is.True, string.Format("regex failed on config variation {0} ", i));
                Assert.That(Uri.TryCreate(match.Groups[2].Value, UriKind.Absolute, out _), Is.True, string.Format("regex match in did not return a URI in config variation {0}", i));
            }
        }
    }
}
