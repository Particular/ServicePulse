import moment from 'moment';

export default class EventLogItemComponent extends HTMLElement {
    date: moment.Moment | null = null;

    constructor() {
        super();

        // Wait for slots to be populated
        let observer = new MutationObserver((changes, observer) => {
            observer.disconnect();

            this.date = moment(this.firstChild?.firstChild?.nodeValue);
            this.innerText = this.date.fromNow();

            this.startUpdateLoop();
        });

        observer.observe(this, { childList: true});
    }

    startUpdateLoop() {
        setInterval(() => {
            this.innerText = this.date!.fromNow();
        }, 5000);
    }
}