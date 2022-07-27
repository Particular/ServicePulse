import React from 'react';

function SystemStatus() {
  return (
    <div className="row">
      <div className="col-sm-12">
        <h6>System status</h6>
        <div className="row box system-status">
          <div className="col-sm-12">
            <div className="row">
              <div className="col-xs-4">
                <a className="summary-item summary-info" href="migrate/#/endpoints">
                  <i className="fa fa-heartbeat fa-3x"></i>
                  <span className="badge badge-important ng-binding ng-hide">0</span>
                  <h4>Heartbeats</h4>
                </a>
              </div>

              <div className="col-xs-4">
                <a className="summary-item summary-info" href="migrate/#/failed-messages/groups">
                  <i className="fa fa-envelope fa-3x "></i>
                  <span className="badge badge-important ng-binding ng-hide"></span>
                  <h4>Failed Messages</h4>
                </a>
              </div>

              <div className="col-xs-4">
                <a className="summary-item summary-info" href="migrate/#/custom-checks">
                  <i className="fa fa-check fa-3x "></i>
                  <span ng-show="failedcustomchecks > 0" className="badge badge-important ng-binding ng-hide"></span>
                  <h4>Custom Checks</h4>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemStatus;
