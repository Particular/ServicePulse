const scu = 'http://localhost:33333/api/';

function getEventLogItems() {
    var url = scu + 'eventlogitems';

    return fetch(url).then(response => {
        return response.json();
    });
};

export { getEventLogItems };