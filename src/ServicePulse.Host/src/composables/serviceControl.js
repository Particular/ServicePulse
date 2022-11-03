import { ref } from "vue";
import { useFetch } from "./fetch.js";

export function useServiceControl(serviceControlUrl, monitoringUrl) {
  const failedHeartBeatsCount = ref(0)
  const failedMessagesCount = ref(0)
  const failedCustomChecksCount = ref(0)

  const isServiceControlConnecting = ref(true)
  const isServiceControlConnected = ref(false)
  const serviceControlConnectedAtLeastOnce = ref(false)
 
  failedHeartBeatsCount.value = getFailedHeartBeatsCount(serviceControlUrl, isServiceControlConnected, serviceControlConnectedAtLeastOnce)
  failedMessagesCount.value = getFailedMessagesCount(serviceControlUrl, isServiceControlConnected, serviceControlConnectedAtLeastOnce)
  failedCustomChecksCount.value = getFailedCustomChecksCount(serviceControlUrl, isServiceControlConnected, serviceControlConnectedAtLeastOnce)

  isServiceControlConnecting.value = false

  return { failedHeartBeatsCount, failedMessagesCount, failedCustomChecksCount, isServiceControlConnecting, isServiceControlConnected, serviceControlConnectedAtLeastOnce}
}

function getFailedHeartBeatsCount(serviceControlUrl, isServiceControlConnected, serviceControlConnectedAtLeastOnce) {
    const { data, error } = useFetch(serviceControlUrl + 'heartbeats/stats')
    
    if (error) {
        isServiceControlConnected.value = false
        console.log(error)
        return Math.floor(Math.random()*(10-0+1)+0) //NOTE when done with testing change to return 0
    }
    isServiceControlConnected.value = true
    serviceControlConnectedAtLeastOnce.value = true
    return data.data.stat.failing
}

function getFailedMessagesCount(serviceControlUrl, isServiceControlConnected, serviceControlConnectedAtLeastOnce) {
    const { data, error } = useFetch(serviceControlUrl + 'errors?status=unresolved')

    if (error) {
        isServiceControlConnected.value = false
        console.log(error)
        return Math.floor(Math.random()*(10-0+1)+0) //NOTE when done with testing change to return 0
    }
    isServiceControlConnected.value = true
    serviceControlConnectedAtLeastOnce.value = true
    return data.headers('Total-Count')
}

function getFailedCustomChecksCount(serviceControlUrl, isServiceControlConnected, serviceControlConnectedAtLeastOnce) {
    const { data, error } = useFetch(serviceControlUrl + 'customchecks?status=fail')

    if (error) {
        isServiceControlConnected.value = false
        console.log(error)
        return Math.floor(Math.random()*(10-0+1)+0) //NOTE when done with testing change to return 0
    }
    isServiceControlConnected.value = true
    serviceControlConnectedAtLeastOnce.value = true
    return data.headers('Total-Count')
}