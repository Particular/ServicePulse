import { ref } from 'vue'
import { } from "../../angular/app/js/app.constants.js"

const serviceControlUrl = ref(null)
const monitoringUrl = ref(null)

export function useServiceControlUrls(route) {   
  if (route.query.scu) {
      serviceControlUrl.value = route.query.scu;
      window.localStorage.setItem('scu', this.serviceControlUrl);
      console.debug(`ServiceControl Url found in QS and stored in local storage: ${serviceControlUrl.value}`);
  } else if (window.localStorage.getItem('scu')) {
      serviceControlUrl.value = window.localStorage.getItem('scu');
      console.debug(`ServiceControl Url, not in QS, found in local storage: ${serviceControlUrl.value}`);
  } else if (window.defaultConfig && window.defaultConfig.service_control_url) {
      serviceControlUrl.value = window.defaultConfig.service_control_url;
      console.debug(`setting ServiceControl Url to its default value: ${window.defaultConfig.service_control_url}`);
  } else {
      console.warn('ServiceControl Url is not defined.');
  }

  if (route.query.mu) {
      monitoringUrl.value = route.query.mu;
      window.localStorage.setItem('mu', this.monitoringUrl);
      console.debug(`Monitoring Url found in QS and stored in local storage: ${monitoringUrl.value}`);
  } else if (window.localStorage.getItem('mu')) {
      monitoringUrl.value = window.localStorage.getItem('mu');
      console.debug(`Monitoring Url, not in QS, found in local storage: ${monitoringUrl.value}`);
  } else if (window.defaultConfig && window.defaultConfig.monitoring_urls && window.defaultConfig.monitoring_urls.length) {
      monitoringUrl.value = window.defaultConfig.monitoring_urls[0];
      console.debug(`setting Monitoring Url to its default value: ${window.defaultConfig.monitoring_urls[0]}`);
  } else {
      console.warn('Monitoring Url is not defined.');
  }

  return { serviceControlUrl, monitoringUrl }
}

export function updateServiceControlUrls(route, newServiceControlUrl, newMonitoringUrl) {
   //TODO
    if (!newServiceControlUrl) {
        throw 'ServiceControl URL is mandatory';
    }

    route.query['scu'] = newServiceControlUrl;

    if (!newMonitoringUrl) {
        newMonitoringUrl = '!'; //disabled
    } 
    
    route.query['mu'] = newServiceControlUrl;

    //values have changed. They'll be reset after page reloads
    window.localStorage.removeItem('scu');
    window.localStorage.removeItem('mu');

    let newSearch = route.query.fullPath
    console.debug('updateConnections - new query string: ', newSearch);
    window.location.search = newSearch;
}