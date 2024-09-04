import { computed } from "vue";
import { useIsSupported } from "@/composables/serviceSemVer";
import { environment } from "@/composables/serviceServiceControl";

export const minimumSCVersionForEndpointSettings = "5.6.0";
const isEndpointSettingsSupported = computed(() => useIsSupported(environment.sc_version, minimumSCVersionForEndpointSettings));

export default isEndpointSettingsSupported;
