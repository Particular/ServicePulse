import useEnvironmentAndVersionsAutoRefresh from "@/composables/useEnvironmentAndVersionsAutoRefresh";

export const minimumSCVersionForLicenseDetails = "6.19.0";

export default function useIsLicenseDetailsSupported() {
  const { store: environmentStore } = useEnvironmentAndVersionsAutoRefresh();
  return environmentStore.serviceControlIsGreaterThan(minimumSCVersionForLicenseDetails);
}
