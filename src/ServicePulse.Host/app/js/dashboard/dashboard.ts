import EventLogItems from './eventLogItems';
import EventLogItemComponent from './eventLogItemComponent';
import SpMoment from './spMoment';

let eventlog = new EventLogItems();

function displayEvents() {
    eventlog.getEventLogItems().then(data => {
        let last10 = data.slice(0, 10).map(eventLog => {
            const cssStyle = `  ${eventLog.severity === 'info' ? 'normal' : 'danger'} 
                                ${eventLog.category === 'Endpoints' || eventLog.category === 'EndpointControl' || eventLog.category === 'HeartbeatMonitoring' ? 'fa-heartbeat' : ''}
                                ${eventLog.category === 'CustomChecks' ? 'fa-check' : ''}
                                ${eventLog.category === 'MessageFailures' || eventLog.category === 'Recoverability' ? 'fa-envelope' : ''}
                                ${eventLog.category === 'ExternalIntegrations' ? 'fa-exclamation' : ''}`;

            let redirected = '';
            if (eventLog.severity === 'error' || eventLog.category === 'MessageRedirects') {
                const redirectCssStyle = `  ${eventLog.severity === 'error' ? 'fa-times fa-error' : ''}
                                            ${eventLog.category === 'MessageRedirects' && eventLog.event_type === 'MessageRedirectChanged' ? 'fa-pencil' : ''}
                                            ${eventLog.category === 'MessageRedirects' && eventLog.event_type === 'MessageRedirectCreated' ? 'fa-plus' : ''}
                                            ${eventLog.category === 'MessageRedirects' && eventLog.event_type === 'MessageRedirectRemoved' ? 'fa-trash' : ''}`;

                redirected = `<i class="fa fa-o fa-stack-1x fa-inverse ${redirectCssStyle}"></i>`;
            }

            return `<event-log-item>
            <span slot="event-icon" class="fa-stack fa-lg">
                <i title="${eventLog.category}" class="fa fa-stack-2x ${cssStyle}"></i>
                ${redirected}
            </span>
            <span slot="event-description">${eventLog.description}</span>
            <span slot="raised-at">${eventLog.raised_at}</span>
        </event-log-item>`;
        }).join('');

        let target = document.getElementById('last-ten-events');
        if (target != null) {
            target.innerHTML = last10;
        }
    });
}

displayEvents();
setInterval(displayEvents, 50000);

customElements.define('event-log-item', EventLogItemComponent);
customElements.define('sp-moment', SpMoment);