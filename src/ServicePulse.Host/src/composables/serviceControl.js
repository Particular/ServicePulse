import { ref, reactive } from "vue";
import { useIsSupported, useIsUpgradeAvailable } from "./serviceSemVer.js"
import { useServiceProductUrls } from "./serviceProductUrls.js"
//import { useFetch } from "./fetch.js";

export const isServiceControlConnecting = ref(true)
export const isServiceControlConnected = ref(false)
export const serviceControlConnectedAtLeastOnce = ref(false)
export const isServiceControlMonitoringConnecting = ref(true)
export const isServiceControlMonitoringConnected = ref(false)
export const stats = reactive({
    active_endpoints: 0,
    failing_endpoints: 0,
    number_of_exception_groups: 0,
    number_of_failed_messages: 0,
    number_of_failed_checks: 0,
    number_of_archived_messages: 0,
    number_of_pending_retries: 0,
    number_of_endpoints: 0
})

export const environment = reactive({
    monitoring_version: "",
    sc_version: "",
    minimum_supported_sc_version: "1.39.0",
    is_compatible_with_sc: true,
    sp_version: "1.32.4", //TODO where do we get this from?
    supportsArchiveGroups: false
});

export const newVersions = reactive({
    newSPVersion: {
        newspversion:false,
        newspversionlink: "",
        newspversionnumber:""
    },
    newSCVersion: {
        newscversion:false,
        newscversionlink: "",
        newscversionnumber:""
    },
    newMVersion: {
        newmversion:false,
        newmversionlink: "",
        newmversionnumber:""
    }
})

export function useServiceControlStats(serviceControlUrl) {
  const failedHeartBeatsResult = getFailedHeartBeatsCount(serviceControlUrl)
  const failedMessagesResult = getFailedMessagesCount(serviceControlUrl)
  const failedCustomChecksResult = getFailedCustomChecksCount(serviceControlUrl)

  Promise
  .all([failedHeartBeatsResult, failedMessagesResult, failedCustomChecksResult])
  .then(([failedHB, failedM, failedCC]) => {
    stats.failing_endpoints = failedHB
    stats.number_of_failed_messages = failedM
    stats.number_of_failed_checks = failedCC

    isServiceControlConnecting.value = false
  });
}

export function useServiceControlMonitoringStats(monitoringUrl) {
    const monitoredEndpointsResult = getMonitoredEndpoints(monitoringUrl)
  
    Promise
    .all([monitoredEndpointsResult])
    .then((monitoredEP) => {
      //Do something here with the monitoredEP in the future if we are using them
      isServiceControlMonitoringConnecting.value = false
    });
  }

export function useServiceControlVersion(serviceControlUrl, monitoringUrl) {
    return fetch(serviceControlUrl)
    .then(response => {
        environment.sc_version = response.headers.get('X-Particular-Version')
        return response.json()        
    })
    .then(json => {
        environment.supportsArchiveGroups = json.archived_groups_url &&  json.archived_groups_url.length > 0
        environment.is_compatible_with_sc = useIsSupported(environment.sc_version, environment.minimum_supported_sc_version)
        
        useServiceProductUrls()
        .then(result => {
            if(result.latestSP && useIsUpgradeAvailable(environment.sp_version, result.latestSP.tag)) {
                newVersions.newSPVersion.newspversion = true
                newVersions.newSPVersion.newspversionlink = result.latestSP.release
                newVersions.newSPVersion.newspversionnumber = result.latestSP.tag
            }

            if(result.latestSC && useIsUpgradeAvailable(environment.sc_version, result.latestSC.tag)) {
                newVersions.newSCVersion.newscversion = true
                newVersions.newSCVersion.newscversionlink = result.latestSC.release
                newVersions.newSCVersion.newscversionnumber = result.latestSC.tag
            }

            return fetch(monitoringUrl)
            .then(response => {
                environment.monitoring_version = response.headers.get('X-Particular-Version')
                if(result.latestSC && useIsUpgradeAvailable(environment.monitoring_version, result.latestSC.tag)) {
                    newVersions.newMVersion.newmversion = true
                    newVersions.newMVersion.newmversionlink = result.latestSC.release
                    newVersions.newMVersion.newmversionnumber = result.latestSC.tag
                }
            })
        })

    })
    .catch(err => {
        isServiceControlConnected.value = false
        console.log(err)
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
        return parseInt(json.failing)
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
        return parseInt(response.headers.get('Total-Count'))
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
        return parseInt(response.headers.get('Total-Count'))
    }) 
    .catch(err => {
        isServiceControlConnected.value = false
        console.log(err)
        return Math.floor(Math.random()*(10-0+1)+0) //NOTE when done with testing change to return 0
    });
}

function getMonitoredEndpoints(monitoringUrl) {
    //const { data, error, retry } = useFetch(serviceControlUrl + 'heartbeats/stats')

    return fetch(monitoringUrl + 'monitored-endpoints?history=1')
    .then(response => {
        //return response.json()
        isServiceControlMonitoringConnected.value = true
    })
    /* .then(json => {
        isServiceControlMonitoringConnected.value = true
        return json
    }) */
    .catch(err => {
        isServiceControlMonitoringConnected.value = false
        console.log(err)
    });
}