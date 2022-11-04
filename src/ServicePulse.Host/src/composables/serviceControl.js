import { ref } from "vue";
//import { useFetch } from "./fetch.js";

export const isServiceControlConnecting = ref(true)
export const isServiceControlConnected = ref(false)
export const serviceControlConnectedAtLeastOnce = ref(false)
export const failedHeartBeatsCount = ref(0)
export const failedMessagesCount = ref(0)
export const failedCustomChecksCount = ref(0)

export function useServiceControl(serviceControlUrl, monitoringUrl) {
  const failedHeartBeatsResult = getFailedHeartBeatsCount(serviceControlUrl)
  const failedMessagesResult = getFailedMessagesCount(serviceControlUrl)
  const failedCustomChecksResult = getFailedCustomChecksCount(serviceControlUrl)

  Promise
  .all([failedHeartBeatsResult, failedMessagesResult, failedCustomChecksResult])
  .then(([failedHB, failedM, failedCC]) => {
    failedHeartBeatsCount.value = failedHB
    failedMessagesCount.value = failedM
    failedCustomChecksCount.value = failedCC

    isServiceControlConnecting.value = false   
  });
}

function getFailedHeartBeatsCount(serviceControlUrl) {
    //const { data, error, retry } = useFetch(serviceControlUrl + 'heartbeats/stats')

    return fetch(serviceControlUrl + 'heartbeats/stats')
    .then(response => {
        return response.json()
    })
    .then(json => {
        isServiceControlConnected.value = true
        serviceControlConnectedAtLeastOnce.value = true
        return json.failing
    })
    .catch(err => {
        isServiceControlConnected.value = false
        console.log(err)
        return Math.floor(Math.random()*(10-0+1)+0) //NOTE when done with testing change to return 0
    });
}

function getFailedMessagesCount(serviceControlUrl) {
    //const { data, error, retry } = useFetch(serviceControlUrl + 'errors?status=unresolved')

    return fetch(serviceControlUrl + 'errors?status=unresolved')
    .then(response => {
        isServiceControlConnected.value = true
        serviceControlConnectedAtLeastOnce.value = true
        return response.headers.get('Total-Count')
    })
    .catch(err => {
        isServiceControlConnected.value = false
        console.log(err)
        return Math.floor(Math.random()*(10-0+1)+0) //NOTE when done with testing change to return 0
    });

}

function getFailedCustomChecksCount(serviceControlUrl) {
    //const { data, error, retry } = useFetch(serviceControlUrl + 'customchecks?status=fail')

    return fetch(serviceControlUrl + 'customchecks?status=fail')
    .then(response => {
        isServiceControlConnected.value = true
        serviceControlConnectedAtLeastOnce.value = true
        return response.headers.get('Total-Count')
    }) 
    .catch(err => {
        isServiceControlConnected.value = false
        console.log(err)
        return Math.floor(Math.random()*(10-0+1)+0) //NOTE when done with testing change to return 0
    });
}