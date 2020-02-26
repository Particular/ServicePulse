 (function (window, angular) {
    'use strict';

    angular.module('services.semverService', [])
        .service('semverService', function () {

            this.reSemver = /^v?((\d+)\.(\d+)\.(\d+))(?:-([\dA-Za-z\-_]+(?:\.[\dA-Za-z\-_]+)*))?(?:\+([\dA-Za-z\-_]+(?:\.[\dA-Za-z\-_]+)*))?$/;

            this.stringify = function (obj) {
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
            };

            this.isUpgradeAvailable = function (currentVersion, latestVersion) {

                var latest = this.parse(latestVersion.split('-')[0]);
                var current = this.parse(currentVersion.split('-')[0]);

                if (latest == null) return false;
                if (current == null) return false;

                if (latest.major !== current.major) {
                    return latest.major > current.major;
                }
                if (latest.minor !== current.minor) {
                    return latest.minor > current.minor;
                }
                if (latest.patch !== current.patch) {
                    return latest.patch > current.patch;
                }

                return false;
            };

            this.isSupported = function (currentVersion, minSupportedVersion) {

                var minSupported = this.parse(minSupportedVersion);
                var current = this.parse(currentVersion);

                if (current == null) return false;

                if (minSupported.major !== current.major) {
                    return minSupported.major <= current.major;
                }
                if (minSupported.minor !== current.minor) {
                    return minSupported.minor <= current.minor;
                }
                if (minSupported.patch !== current.patch) {
                    return minSupported.patch <= current.patch;
                }

                return true;
            };

            this.parse = function (version) {
                // semver, major, minor, patch
                // https://github.com/mojombo/semver/issues/32
                // https://github.com/isaacs/node-semver/issues/10
                // optional v
                var m = this.reSemver.exec(version) || [];

                function defaultToZero(num) {
                    var n = parseInt(num, 10);

                    return isNaN(n) ? 0 : n;
                }

                var ver = new SemVer({
                    semver: m[0],
                    version: m[1],
                    major: defaultToZero(m[2]),
                    minor: defaultToZero(m[3]),
                    patch: defaultToZero(m[4]),
                    release: m[5],
                    build: m[6]
                });
                if (0 === m.length) {
                    ver = null;
                }

                return ver;
            };

            function SemVer(obj) {
                if (!obj) {
                    return;
                }

                var me = this;

                Object.keys(obj).forEach(function (key) {
                    me[key] = obj[key];
                });
            }

            SemVer.prototype.toString = function () {
                return this.stringify(this);
            };
         
        });

} (window, window.angular, window.jQuery));