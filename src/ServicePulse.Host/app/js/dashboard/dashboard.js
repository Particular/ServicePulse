import { createApp } from 'vue/dist/vue.esm-browser.js';
import html from './dashboard.html';
import { getEventLogItems } from './eventLogItems';
import { moment } from 'moment';

let eventData = {
    eventLogItems : []
};

let app = createApp({
    data() {
      return eventData;
    },
    template: html,
    methods: {
        inc() {
            this.count++;
        },
        loadEvents() {
            getEventLogItems().then(data => {
                data.forEach(event => {
                    // set date to moment date
                    event.raised_at = moment(event.raised_at);
                });

                this.eventLogItems = data;
            });
        }
    },
    computer: {
        iconClasses() {
            return {
                'normal': this.severity ==='info',
                'danger': this.severity ==='error',
                'fa-heartbeat': this.category === 'Endpoints' || this.category === 'EndpointControl' || this.category === 'HeartbeatMonitoring',
                'fa-check': this.category === 'CustomChecks',
                'fa-envelope': this.category === 'MessageFailures' || this.category === 'Recoverability',
                'pa-redirect-source pa-redirect-large': this.category === 'MessageRedirects',
                'fa-exclamation': this.category === 'ExternalIntegrations',
                'fa-times fa-error': (this.severity === 'error' || this.category === 'MessageRedirects') && this.severity === 'error',
                'fa-pencil': (this.severity === 'error' || this.category === 'MessageRedirects') && this.category === 'MessageRedirects' && this.event_type === 'MessageRedirectChanged',
                'fa-plus': (this.severity === 'error' || this.category === 'MessageRedirects') && this.category === 'MessageRedirects' && this.event_type === 'MessageRedirectCreated',
                'fa-trash': (this.severity === 'error' || this.category === 'MessageRedirects') && this.category === 'MessageRedirects' && this.event_type === 'MessageRedirectRemoved'
              }
        }
    }
}).mount('#last-ten-events');