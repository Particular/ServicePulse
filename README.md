# ServicePulse ![Current Version](https://img.shields.io/github/release/particular/servicepulse.svg?style=flat&label=current%20version)

## Production monitoring for distributed systems
Real-time monitoring customized to fit distributed applications in general, and your application's specific needs in particular.

Keep track of the health of your system's endpoints, monitor for any processing errors, send failed messages for reprocessing and make sure your specific environment's needs are met, all in one consolidated dashboard.

## Setting up the project for development

### Connecting to ServiceControl and ServiceControl Monitoring

ServicePulse mostly presents data provided by [ServiceControl](http://github.com/Particular/ServiceControl). Endpoint metrics data is provided by [ServiceControl Monitoring](https://github.com/Particular/ServiceControl.Monitoring).

The URLs for both services can be set in `ServicePulse.Host/app/js/app.constants.js` under the constant `scConfig`.

#### URL ACL Reservation

ServicePulse depends on a self-hosted webserver. In order to start the project a URL ACL reservation needs to be setup. Either run Visual Studio with Administrative privileges or run the following command to add the required URL ACL reservation:

```
netsh http add urlacl url=http://+:8081/ user=Everyone
```

### Setting up package manager

ServicePulse uses npm and bower as package managers. For the solution to work dependencies needs to be downloaded before opening the ServicePulse website.

#### Install dependencies

Install the following dependencies if you don't have them installed yet

 - [Node.js](https://nodejs.org/en/download/)
 - [Git for Windows](https://git-for-windows.github.io/)

#### Set up node

 - Open cmd window and navigate into `ServicePulse\src\ServicePulse.Host` path
 - run the following command `npm run setup`. This script will use webpack configuration to finish ServicePulse required configuration and will start watching root folder for changes.
 
In case `npm run setup` fails with an error related to git submodule not properly configured, run the following command `npm install` to ensure all required dependencies are available, and then run `npm run setup`.

After doing the above steps one can open Visual Studio and continue working on this project. You can also run this project from node using `npm run serve`.

### Configuring automated tests

For information how to run automated tests please follow [ServicePulse.Host.Tests/Readme](https://github.com/Particular/ServicePulse/blob/master/src/ServicePulse.Host.Tests/README.md).

## Supported browser versions

ServicePulse is supported on the following desktop browser versions:

- Chrome 70+
- Edge with EdgeHTML v17+
- Firefox ESR [current version](https://www.mozilla.org/en-US/firefox/organizations/)
- Internet Explorer 11
- Safari [latest major version](https://developer.apple.com/safari/download/)
