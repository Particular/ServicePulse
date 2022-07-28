import React from 'react';

function Last10Events() {
  const scu = 'http://10.211.55.3:33333/api/';
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    if (events.length === 0) {
      fetch(scu + 'eventlogitems')
        .then(response => response.json())
        .then(data => setEvents(data));
    }
  }, [events]);

  const getIcon = (severity) => {
    switch (severity) {
      case 'error':
        return 'fa fa-stack-2x danger fa-check';
      case 'info':
        return 'fa fa-stack-2x normal fa-check';
      default:
        return 'fa fa-stack-2x normal fa-check';
    }
  }

  const getIconSize = (severity) => {
    switch (severity) {
      case 'error':
        return 'fa fa-o fa-stack-1x fa-inverse fa-times fa-error';
      default:
        return 'fa fa-o fa-stack-1x fa-inverse fa-error';
    }
  }

  function timeSince(date) {

    var seconds = Math.floor((new Date() - new Date(date)) / 1000);
    var interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  }

  return (
    <div className="row ng-scope">
      <section className="events ng-scope" name="eventlog" ng-controller="EventLogItemsCtrl">
        <div className="row">
          <div className="col-sm-12">
            <h6>Last 10 events</h6>

            {events.slice(0, 10).map(event => (
              <div className="row box box-event-item ng-scope">
                <div className="col-xs-12">
                  <div className="row">
                    <div className="col-xs-1">
                      <span className="fa-stack fa-lg">
                        <i title="CustomChecks" className={getIcon(event.severity)}></i>
                        <i className={getIconSize(event.severity)}></i>
                      </span>
                    </div>

                    <div className="col-xs-9">
                      <div className="row box-header">
                        <div className="col-sm-12">
                          <p className="lead ng-binding">{event.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-xs-2">
                      <sp-moment>{timeSince(event.raised_at)}</sp-moment>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="row text-center">
              <a className="btn btn-default btn-secondary btn-all-events" href="migrate/#/events">View all events</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Last10Events;