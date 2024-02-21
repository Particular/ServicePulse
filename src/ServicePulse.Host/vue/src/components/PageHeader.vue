<script setup>
import { RouterLink, useRoute } from "vue-router";
import { computed } from "vue";
import { connectionState, monitoringConnectionState, stats } from "../composables/serviceServiceControl";
import { useIsMonitoringEnabled } from "../composables/serviceServiceControlUrls";
import { licenseStatus } from "../composables/serviceLicense";
import ExclamationMark from "./ExclamationMark.vue";
import { LicenseWarningLevel } from "@/composables/LicenseStatus";
import { WarningLevel } from "@/components/WarningLevel";
import routeLinks from "@/router/routeLinks";

function subIsActive(input, exact) {
  const paths = Array.isArray(input) ? input : [input];
  const route = useRoute();
  return paths.some((path) => {
    return exact ? route.path.endsWith(path) : route.path.indexOf(path) === 0; // current path starts with this path string
  });
}

const displayWarn = computed(() => {
  return licenseStatus.warningLevel === LicenseWarningLevel.Warning;
});
const displayDanger = computed(() => {
  return connectionState.unableToConnect || (monitoringConnectionState.unableToConnect && useIsMonitoringEnabled()) || licenseStatus.warningLevel === LicenseWarningLevel.Danger;
});
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-inverse navbar-dark">
    <div class="container-fluid">
      <div class="navbar-header">
        <a class="navbar-brand" href="/">
          <img alt="Service Pulse" src="@/assets/logo.svg" />
        </a>
      </div>

      <div id="navbar" class="navbar navbar-expand-lg">
        <ul class="nav navbar-nav navbar-inverse">
          <li :class="{ active: subIsActive('/dashboard', true) }">
            <RouterLink :to="routeLinks.dashboard">
              <i class="fa fa-dashboard icon-white" title="Dashboard"></i>
              <span class="navbar-label">Dashboard</span>
            </RouterLink>
          </li>
          <li :class="{ active: subIsActive('/a/#/endpoints') }">
            <a :href="routeLinks.heartbeats">
              <i class="fa fa-heartbeat icon-white" title="Heartbeats"></i>
              <span class="navbar-label">Heartbeats</span>
              <span v-if="stats.number_of_failed_heartbeats > 0" class="badge badge-important">{{ stats.number_of_failed_heartbeats }}</span>
            </a>
          </li>
          <li v-if="useIsMonitoringEnabled()" :class="{ active: subIsActive('/a/#/monitoring') || subIsActive('/a/#/monitoring/endpoint') }">
            <a :href="routeLinks.monitoring">
              <i class="fa pa-monitoring icon-white" title="Monitoring"></i>
              <span class="navbar-label">Monitoring</span>
              <span v-if="stats.number_of_disconnected_endpoints > 0" class="badge badge-important">{{ stats.number_of_disconnected_endpoints }}</span>
            </a>
          </li>
          <li :class="{ active: subIsActive('/failed-messages') }">
            <RouterLink :to="routeLinks.failedMessage.root">
              <i class="fa fa-envelope icon-white" title="Failed Messages"></i>
              <span class="navbar-label">Failed Messages</span>
              <span v-if="stats.number_of_failed_messages > 0" class="badge badge-important">{{ stats.number_of_failed_messages }}</span>
            </RouterLink>
          </li>
          <li :class="{ active: subIsActive('/a/#/custom-checks') }">
            <a :href="routeLinks.customChecks">
              <i class="fa fa-check icon-white" title="Custom Checks"></i>
              <span class="navbar-label">Custom Checks</span>
              <span v-if="stats.number_of_failed_checks > 0" class="badge badge-important">{{ stats.number_of_failed_checks }}</span>
            </a>
          </li>
          <li :class="{ active: subIsActive('/events') }">
            <RouterLink :to="routeLinks.events" exact>
              <i class="fa fa-list-ul icon-white" title="Events"></i>
              <span class="navbar-label">Events</span>
            </RouterLink>
          </li>
          <li :class="{ active: subIsActive('/configuration') }">
            <RouterLink :to="routeLinks.configuration.root" exact>
              <i class="fa fa-cog icon-white" title="Configuration"></i>
              <span class="navbar-label">Configuration</span>
              <exclamation-mark :type="WarningLevel.Warning" v-if="displayWarn" />
              <exclamation-mark :type="WarningLevel.Danger" v-if="!displayDanger && displayDanger" />
            </RouterLink>
          </li>
          <li>
            <a class="btn-feedback" href="https://github.com/Particular/ServicePulse/issues/new" target="_blank">
              <i class="fa fa-comment" title="Feedback"></i>
              <span class="navbar-label">Feedback</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  height: 60px;
  flex-wrap: nowrap;
  --bs-link-color: #9d9d9d;
  --bs-link-hover-color: #fff;
}

.navbar-inverse {
  background-color: #1a1a1a;
}

.navbar > .navbar-right {
  margin-right: -15px;
}

.navbar-brand {
  height: 60px;
  padding-bottom: 9px;
  padding-top: 10px;
}

.navbar-brand img {
  width: 160px;
  margin-left: 3px;
}

.navbar-nav > li {
  margin-left: 4px;
  margin-right: 1px;
}

.navbar-nav > li > a > span {
  margin-left: 8px;
}

.nav > li > a {
  position: relative;
  display: block;
  padding: 10px 15px 15px 10px;
  color: var(--bs-link-color);
  text-decoration: none;
}

.nav > li > a:hover,
.nav > li > a:focus {
  color: #fff;
}

.navbar-nav > li > a > span.no-margin {
  margin: 0;
}

.nav > li > a .navbar-toggle {
  margin-top: 13px;
}

.navbar a {
  font-weight: normal;
  text-decoration: none;
}

.navbar a:hover {
  font-weight: normal;
}

.navbar-inverse .navbar-nav > .active > a,
.navbar-inverse .navbar-nav > .active > a:hover,
.navbar-inverse .navbar-nav > .active > a:focus {
  color: #fff;
}

.label-important,
.badge-important {
  background-color: #fa603d;
  border-color: #fa5833;
}

a.btn-feedback,
a.btn-feedback:visited,
a.btn-feedback:focus {
  color: #fff !important;
  background-color: #00a3c4 !important;
  padding: 6px 16px !important;
  margin: 14px 0 0 0;
  border-radius: 3px;
  font-weight: bold;
}

a.btn-feedback:hover,
a.btn-feedback:focus {
  background-color: hsl(194, 95%, 61%) !important;
  font-weight: bold;
}

.navbar-nav > li > .btn-feedback > .fa {
  color: #fff;
}

@media (min-width: 768px) {
  .navbar-nav > li.active > a {
    background: transparent !important;
    border-bottom: 5px solid #00a3c4;
  }

  .navbar-nav > li > a {
    padding-bottom: 15px;
    padding-top: 20px;
  }

  .graph-values .col-sm-6 {
    width: 45%;
  }
}

@media only screen and (min-width: 1072px) {
  .navbar-label {
    display: inline;
  }
}

@media only screen and (max-width: 768px) {
  .navbar-collapse.collapse.in {
    padding: 0 0 0 16px !important;
  }
}

@media (max-width: 1199px) {
  .navbar-header {
    float: none;
  }

  .navbar-toggle {
    display: block;
  }

  .navbar-collapse {
    border-top: 1px solid transparent;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .navbar-collapse.collapse {
    display: none !important;
  }

  .navbar-nav {
    float: none !important;
    margin: 7.5px -15px;
  }

  .navbar-nav > li {
    float: none;
  }

  .navbar-nav > li > a {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .navbar-text {
    float: none;
    margin: 15px 0;
  }

  .navbar-collapse.collapse.in {
    display: block !important;
    padding: 0 32px 16px 32px;
  }

  .collapsing {
    overflow: hidden !important;
  }
}

@media (max-width: 1300px) {
  .navbar-label {
    display: none;
  }

  .nav > li > a .icon-white {
    color: #929e9e;
  }

  .nav > li > a:hover .icon-white,
  .nav > li > a:focus .icon-white {
    color: #fff;
  }

  .nav > li > a:hover .pa-monitoring,
  .nav > li > a:focus .pa-monitoring {
    background-color: #fff;
  }
}

@media (max-width: 1439px) {
  nav.navbar {
    position: sticky;
  }

  div.navbar-header {
    float: left;
  }

  ul.navbar-nav {
    margin: 0 8px 0 0;
    display: block;
  }

  .navbar-nav > li > a {
    padding-top: 18px;
    padding-bottom: 17px;
  }

  .navbar-collapse.collapse {
    display: block !important;
  }

  .navbar-nav > li,
  .navbar-nav {
    float: left !important;
    height: 59px;
  }

  .navbar-nav.navbar-right:last-child {
    margin-right: -15px !important;
  }

  .navbar-right {
    float: right !important;
  }

  .navbar-nav > li.active > a {
    background: transparent !important;
    border-bottom: 5px solid #00a3c4 !important;
  }

  .tabs h5 {
    margin-bottom: 0;
    padding-bottom: 10px;
  }
}

@media (max-width: 1439px) and (-ms-high-contrast: active), (-ms-high-contrast: none) {
  nav.navbar {
    margin-top: 0;
  }
}

.pa-monitoring {
  mask-image: url("@/assets/monitoring.svg");
  background-color: #929e9e;
  background-position: center;
  background-repeat: no-repeat;
  width: 16px;
  height: 14px;
  position: relative;
  top: 2px;
}

span.fa-exclamation-triangle.danger {
  color: #ce4844;
  font-weight: normal !important;
  background: linear-gradient(white, white) center/20% 72% no-repeat;
}
</style>
