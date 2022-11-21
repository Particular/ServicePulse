const reSemver =
  /^v?((\d+)\.(\d+)\.(\d+))(?:-([\dA-Za-z\-_]+(?:\.[\dA-Za-z\-_]+)*))?(?:\+([\dA-Za-z\-_]+(?:\.[\dA-Za-z\-_]+)*))?$/;

export function useIsUpgradeAvailable(currentVersion, latestVersion) {
  var latest = parse(latestVersion.split("-")[0]);
  var current = parse(currentVersion.split("-")[0]);

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
}

export function useIsSupported(currentVersion, minSupportedVersion) {
  var minSupported = parse(minSupportedVersion);
  var current = parse(currentVersion);

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
}

function SemVer(obj) {
  if (!obj) {
    return;
  }

  var me = this;

  Object.keys(obj).forEach(function (key) {
    me[key] = obj[key];
  });
}

function parse(version) {
  // semver, major, minor, patch
  // https://github.com/mojombo/semver/issues/32
  // https://github.com/isaacs/node-semver/issues/10
  // optional v
  var m = reSemver.exec(version) || [];

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
    build: m[6],
  });
  if (0 === m.length) {
    ver = null;
  }

  return ver;
}
