## Production monitoring for distributed systems
Real-time monitoring customized to fit distributed applications in general, and your application's specific needs in particular.
 
Keep track of the health of your system's endpoints, monitor for any processing errors, send failed messages for reprocessing and make sure your specific environment's needs are met, all in one consolidated dashboard.

## Setting up the project for development

### Connecting to ServiceControl and ServiceControl Monitoring

ServicePulse mostly presents data provided by [ServiceControl](http://github.com/Particular/ServiceControl). Endpoint metrics data is provided by [ServiceControl Monitoring](https://github.com/Particular/ServiceControl.Monitoring).

The URLs for both services can be set in ServicePulse.Host/app/js/app.constants.js under the constant `scConfig`.

### Setting up package manager

ServicePulse uses npm and bower as package managers. For the solution to work dependencies needs to be downloaded before opening the ServicePulse website.

#### Install dependencies

Install the following dependencies if you don't have them installed yet

 - [Node.js](https://nodejs.org/en/download/)
 - [Git for Windows](https://git-for-windows.github.io/)
 
#### Set up node and bower
 
 - Open cmd window and navigate into `ServicePulse\src\ServicePulse.Host` path
 - run the following command `npm run setup`. This script will install all node and bower dependencies and update index.html to include them if needed.

After doing the above steps one can open visual studio and continue working on this project.

### Configuring automated tests

For information how to run automated tests please follow [ServicePulse.Host.Tests/Readme](https://github.com/Particular/ServicePulse/blob/master/src/ServicePulse.Host.Tests/README.md).
