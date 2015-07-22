'use strict';

angular.module('services.semverService', [])
    .service('semverService', function() {



        function SemVer(obj) {
            if (!obj) {
                return;
            }

            var me = this
            ;

            Object.keys(obj).forEach(function (key) {
                me[key] = obj[key];
            });
        }

        SemVer.prototype.toString = function () {
            return stringify(this);
        };


            this.reSemver = /^v?((\d+)\.(\d+)\.(\d+))(?:-([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?(?:\+([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?$/;
            this.reSemverRange = /\s*((\|\||\-)|(([<>~]?=?)\s*(v)?([0-9]+)(\.(x|\*|[0-9]+))?(\.(x|\*|[0-9]+))?(([\-+])([a-zA-Z0-9\.]+))?))\s*/g;

            this.stringify = function (obj)
            {
                var str = '';

                str += obj.major || '0';
                str += '.';
                str += obj.minor || '0';
                str += '.';
                str += obj.patch || '0';
                if (obj.release) {
                    str += '-' + obj.release;
                }
                if (obj.build) {
                    str += '+' + obj.build;
                }
                return str;
            }

            this.isUpgradeAvailable = function(myVersion, latestVersion)
            {

                var r = this.parse(latestVersion);
                var i = this.parse(myVersion);

                var upgrade = !(r['major'] === i['major']
                                && r['minor'] === i['minor']
                                && r['patch'] === i['patch']);

                return upgrade;


            }

            this.isSupported = function (currentVersion, minSupportedVersion) {
                var min = this.parse(minSupportedVersion);
                var cur = this.parse(currentVersion);

                var minInt = parseInt(min['major'] + min['minor'] + min['patch'], 10);
                var curInt = parseInt(cur['major'] + cur['minor'] + cur['patch'], 10);

                return minInt <= curInt;
            };

            this.parse = function (version)
            {
                // semver, major, minor, patch
                // https://github.com/mojombo/semver/issues/32
                // https://github.com/isaacs/node-semver/issues/10
                // optional v
                var m = this.reSemver.exec(version) || []
                  , ver = new SemVer({
                      semver: m[0]
                      , version: m[1]
                      , major: m[2]
                      , minor: m[3]
                      , patch: m[4]
                      , release: m[5]
                      , build: m[6]
                  })
                ;

                if (0 === m.length) {
                    ver = null;
                }

                return ver;
            }

       

        }
    );