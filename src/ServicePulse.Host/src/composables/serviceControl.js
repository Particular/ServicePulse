import { ref } from "vue";
import { useFetch } from "./fetch.js";

export const isSCConnected = ref(false)
export const scConnectedAtLeastOnce = ref(false)

export function useServiceControl(serviceControlUrl, monitoringUrl) {
  const failedHeartBeatsCount = ref(0)
  const failedMessagesCount = ref(0)
  const failedCustomChecksCount = ref(0)

  failedHeartBeatsCount.value = getFailedHeartBeatsCount(serviceControlUrl)
  failedMessagesCount.value = getFailedMessagesCount(serviceControlUrl)
  failedCustomChecksCount.value = getFailedCustomChecksCount(serviceControlUrl)

  return { failedHeartBeatsCount, failedMessagesCount, failedCustomChecksCount }
}

function getFailedHeartBeatsCount(serviceControlUrl) {
    const { data, error } = useFetch(serviceControlUrl + 'heartbeats/stats')
    
    if (error) {
        isSCConnected.value = false
        console.log(error)
        return Math.floor(Math.random()*(10-0+1)+0) //NOTE when done with testing change to return 0
    }
    isSCConnected.value = true
    scConnectedAtLeastOnce.value = true
    return data.data.stat.failing
}

function getFailedMessagesCount(serviceControlUrl) {
    const { data, error } = useFetch(serviceControlUrl + 'errors?status=unresolved')

    if (error) {
        isSCConnected.value = false
        console.log(error)
        return Math.floor(Math.random()*(10-0+1)+0) //NOTE when done with testing change to return 0
    }
    isSCConnected.value = true
    scConnectedAtLeastOnce.value = true
    return data.headers('Total-Count')
}

function getFailedCustomChecksCount(serviceControlUrl) {
    const { data, error } = useFetch(serviceControlUrl + 'customchecks?status=fail')

    if (error) {
        isSCConnected.value = false
        console.log(error)
        return Math.floor(Math.random()*(10-0+1)+0) //NOTE when done with testing change to return 0
    }
    isSCConnected.value = true
    scConnectedAtLeastOnce.value = true
    return data.headers('Total-Count')
}