import React from 'react';

function NavBar() {
  return (
    <nav className="navbar navbar-inverse navbar-fixed-top ng-scope">
        <div className="container-fluid">
            <div className="navbar-header">
                <a className="navbar-brand" href="#/">
                    <img alt="Service Pulse" src="img/logo.svg" />
                </a>
            </div>

            <div id="navbar" className="collapse navbar-collapse navbar-right navbar-inverse">
                <ul className="nav navbar-nav navbar-inverse">
                    <li className="active">
                        <a href="/">
                            <i className="fa fa-dashboard icon-white"></i>
                            <span className="navbar-label">Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a href="migrate/#/endpoints">
                            <i className="fa fa-heartbeat icon-white"></i>
                            <span className="navbar-label">Heartbeats</span>
                            <span ng-show="failedheartbeats > 0" className="badge badge-important  ng-binding ng-hide">0</span>
                        </a>
                    </li>
                    <li>
                        <a href="migrate/#/monitoring">
                            <i className="fa pa-monitoring icon-white"></i>
                            <span className="navbar-label">Monitoring</span>
                            <span ng-show="disconnectedendpoints > 0" className="badge badge-important  ng-binding ng-hide"></span>
                        </a>
                    </li>
                    <li>
                        <a href="migrate/#/failed-messages/groups">
                            <i className="fa fa-envelope icon-white"></i>
                            <span className="navbar-label">Failed Messages</span>
                            <span ng-show="failedmessages > 0" className="badge badge-important  ng-binding ng-hide"></span>
                        </a>
                    </li>
                    <li>
                        <a href="migrate/#/custom-checks">
                            <i className="fa fa-check icon-white"></i>
                            <span className="navbar-label">Custom Checks</span>
                            <span className="badge badge-important ng-binding ng-hide"></span>
                        </a>
                    </li>
                    <li>
                        <a href="migrate/#/events">
                            <i className="fa fa-list-ul icon-white"></i>
                            <span className="navbar-label">Events</span>                        
                        </a>
                    </li>
                    <li>
                        <a href="migrate/#/configuration">
                            <i className="fa fa-cog icon-white"></i>
                            <span className="navbar-label">Configuration</span>
                            <span className="no-margin fa fa-exclamation-triangle  ng-hide" exclamation="" type=""></span>
                            <span className="no-margin fa fa-exclamation-triangle  danger" exclamation="" type="danger"></span>
                        </a>
                    </li>
                    <li>
                        <a className="btn-feedback" href="https://github.com/Particular/ServicePulse/issues/new" target="_blank">
                            <i className="fa fa-comment"></i>
                            <span className="navbar-label">Feedback</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
  );
}

export default NavBar;
