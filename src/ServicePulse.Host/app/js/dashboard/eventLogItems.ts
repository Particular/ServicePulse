import EventLogItem from "./eventLogItem";

const scu = 'http://localhost:33333/api/';

export default class EventLogItems {
    getEventLogItems() : Promise<EventLogItem[]> {
        var url = scu + 'eventlogitems';

        return fetch(url).then<EventLogItem[]>(response => {
            return response.json();
        });
    }
}