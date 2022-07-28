function Footer() {
  return (

    <footer className="footer ng-scope">
      <div className="container">
        <div className="row">
          <div className="connectivity-status">
            <span>
              <i className="fa fa-plus sp-blue"></i>
              <a href="migrate/#/configuration/platformconnection">Connect new endpoint</a>
            </span>
            <span className="ng-binding ng-hide">
              ServicePulse v1.2.0
            </span>
            <span className="ng-binding">
              ServicePulse v1.2.0 (<i className="fa fa-level-up fake-link"></i> <a href="https://github.com/Particular/ServicePulse/releases/tag/1.32.1" target="_blank" className="ng-binding">v1.32.1 available</a>)
            </span>
            <span uib-tooltip="ServiceControl URL http://localhost:33333/api/">
              Service Control:
              <span className="connected-status ng-scope">
                <div className="fa pa-connection-success"></div>
                <span className="ng-hide">Connected</span>
                <span className="versionnumber ng-binding">v4.21.5</span>
                <span className="newscversion">(<i className="fa fa-level-up fake-link"></i> <a target="_blank" className="ng-binding" href="https://github.com/Particular/ServiceControl/releases/tag/4.22.0">v4.22.0 available</a>)</span>
              </span>
            </span>

            <span className="monitoring-connected ng-scope ng-isolate-scope" uib-tooltip="Monitoring URL http://localhost:33633/">
              SC Monitoring:
              <span className="connection-failed ng-scope">
                <i className="fa pa-connection-failed"></i> Not connected
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>

  );
}

export default Footer;