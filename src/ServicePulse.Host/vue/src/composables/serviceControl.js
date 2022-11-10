import { ref, reactive } from "vue";
import { useIsSupported, useIsUpgradeAvailable } from "./serviceSemVer.js"
import { useServiceProductUrls } from "./serviceProductUrls.js"
import { } from "../../public/js/app.constants.js"
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
    number_of_failed_heartbeats: 0,
    number_of_archived_messages: 0,
    number_of_pending_retries: 0,
    number_of_endpoints: 0
})

export const environment = reactive({
    monitoring_version: "",
    sc_version: "",
    minimum_supported_sc_version: "1.39.0",
    is_compatible_with_sc: true,
    sp_version: window.defaultConfig && window.defaultConfig.version ? window.defaultConfig.version : "1.1.0",
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

  return Promise
  .all([failedHeartBeatsResult, failedMessagesResult, failedCustomChecksResult])
  .then(([failedHB, failedM, failedCC]) => {
    stats.failing_endpoints = failedHB
    stats.number_of_failed_messages = failedM
    stats.number_of_failed_checks = failedCC
    stats.number_of_failed_heartbeats = failedHB

    isServiceControlConnecting.value = false
  })
  .catch(err => {
    console.log(err)(err)
    isServiceControlConnecting.value = false
  });
}

export function useServiceControlMonitoringStats(monitoringUrl) {
    const monitoredEndpointsResult = getMonitoredEndpoints(monitoringUrl)
  
    return Promise
    .all([monitoredEndpointsResult])
    .then((monitoredEP) => {
      //Do something here with the monitoredEP in the future if we are using them
      isServiceControlMonitoringConnecting.value = false
    });
  }

export function useServiceControlVersion(serviceControlUrl, monitoringUrl) {
    const productsResult = useServiceProductUrls()
    const scResult = getSCVersion(serviceControlUrl)
    const mResult = getMonitoringVersion(monitoringUrl)

    return Promise
    .all([productsResult, scResult, mResult])
    .then(([products, scVer, mVer]) => {
        environment.supportsArchiveGroups = scVer.archived_groups_url &&  scVer.archived_groups_url.length > 0
        environment.is_compatible_with_sc = useIsSupported(environment.sc_version, environment.minimum_supported_sc_version)

        if(products.latestSP && useIsUpgradeAvailable(environment.sp_version, products.latestSP.tag)) {
            newVersions.newSPVersion.newspversion = true
            newVersions.newSPVersion.newspversionlink = products.latestSP.release
            newVersions.newSPVersion.newspversionnumber = products.latestSP.tag
        }

        if(products.latestSC && useIsUpgradeAvailable(environment.sc_version, products.latestSC.tag)) {
            newVersions.newSCVersion.newscversion = true
            newVersions.newSCVersion.newscversionlink = products.latestSC.release
            newVersions.newSCVersion.newscversionnumber = products.latestSC.tag
        }

        if(products.latestSC && useIsUpgradeAvailable(environment.monitoring_version, products.latestSC.tag)) {
            newVersions.newMVersion.newmversion = true
            newVersions.newMVersion.newmversionlink = products.latestSC.release
            newVersions.newMVersion.newmversionnumber = products.latestSC.tag
        }
    });   
}

function getSCVersion(serviceControlUrl) {
    return fetch(serviceControlUrl)
    .then(response => {
        environment.sc_version = response.headers.get('X-Particular-Version')
        return response.json()
    }) 
    .catch(err => {
        return null
    });
}

function getMonitoringVersion(monitoringUrl) {
    return fetch(monitoringUrl)
    .then(response => {
        environment.monitoring_version = response.headers.get('X-Particular-Version')
        return response.json()
    }) 
    .catch(err => {
        return null
    });
}

function getFailedHeartBeatsCount(serviceControlUrl) { 
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
        return 0
       // return Math.floor(Math.random()*(10-0+1)+0)
        
    });
}

function getFailedMessagesCount(serviceControlUrl) {
    return fetch(serviceControlUrl + 'errors?status=unresolved')
    .then(response => {
        isServiceControlConnected.value = true
        serviceControlConnectedAtLeastOnce.value = true
        return parseInt(response.headers.get('Total-Count'))
    })
    .catch(err => {
        isServiceControlConnected.value = false
        console.log(err)
        return 0
        //return Math.floor(Math.random()*(10-0+1)+0) 
    });

}

function getFailedCustomChecksCount(serviceControlUrl) {
    return fetch(serviceControlUrl + 'customchecks?status=fail')
    .then(response => {
        isServiceControlConnected.value = true
        serviceControlConnectedAtLeastOnce.value = true
        return parseInt(response.headers.get('Total-Count'))
    }) 
    .catch(err => {
        isServiceControlConnected.value = false
        console.log(err)
        return 0
        //return Math.floor(Math.random()*(10-0+1)+0)
    });
}

function getMonitoredEndpoints(monitoringUrl) {
    return fetch(monitoringUrl + 'monitored-endpoints?history=1')
    .then(response => {
        return response.json()
    })
    .then(json => {
        isServiceControlMonitoringConnected.value = true
        return json
    })
    .catch(err => {
        isServiceControlMonitoringConnected.value = false
        console.log(err)
    });
}