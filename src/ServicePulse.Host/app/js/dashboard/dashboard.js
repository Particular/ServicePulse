import { createApp } from 'vue/dist/vue.esm-browser.js';
import html from './dashboard.html';
import { getEventLogItems } from './eventLogItems';
import { moment } from 'moment';

let eventData = {
    eventLogItems : []
};

function StepsIndicatorComponent(props) {
    return {
    stepsCount: props.stepsCount,
    get stepsCountWithSuccessPage() {
        return this.stepsCount + 1;
    }
  }
};

let app = createApp({
    StepsIndicatorComponent,
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
                    event.raised_at = moment(event.raised_at)
                });

                this.eventLogItems = data;
            });
        }
    },
}).mount('#last-ten-events');