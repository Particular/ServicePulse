import { useRoute } from "vue-router";
import { useServiceControlUrls } from "./serviceControlUrls.js";

const { serviceControlUrl } = "http://localhost:33333/"; //= useServiceControlUrls(useRoute())

export function getEventLogItems() {
    var url = serviceControlUrl + 'eventlogitems';

    return fetch(url).then(response => {
        return response.json();
    });
};