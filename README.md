## Production monitoring for distributed systems
Real-time monitoring customized to fit distributed applications in general, and your application's specific needs in particular.
 
Keep track of the health of your system's endpoints, monitor for any processing errors, send failed messages for reprocessing and make sure your specific environment's needs are met, all in one consolidated dashboard.

## Setting up the project for development

### Connecting to ServiceControl

Service Pulse uses [ServiceControl](http://github.com/Particular/ServiceControl) as the source of all presented data.  ServiceControl url can be set in ServicePulse.Host/app/js/app.constants.js under constant scConfig.

### Configuring automated tests

For information how to run automated tests please follow [ServicePulse.Host.Tests/Readme](https://github.com/Particular/ServicePulse/blob/master/src/ServicePulse.Host.Tests/README.md).