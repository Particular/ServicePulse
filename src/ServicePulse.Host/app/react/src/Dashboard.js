import React from 'react';
import SystemStatus from './SystemStatus';
import Last10Events from './Last10Events';

function Dashboard() {
  return (
    <div className="container-fluid">
        <div className="container ng-scope">
            <section>
                <div className="row">
                    <div className="col-sm-12">
                        <h1>Dashboard</h1>
                    </div>
                </div>
                <SystemStatus />
                <Last10Events />
            </section>
        </div>
    </div>
  );
}

export default Dashboard;