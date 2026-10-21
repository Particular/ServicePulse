import useEnvironmentAndVersionsAutoRefresh from "@/composables/useEnvironmentAndVersionsAutoRefresh";

export const minimumSCVersionForLicenseDetailAmendment = "6.22.0";

export default function useIsLicenseDetailAmendmentSupported() {
  return false;
  const { store: environmentStore } = useEnvironmentAndVersionsAutoRefresh();
  return environmentStore.serviceControlIsGreaterThan(minimumSCVersionForLicenseDetailAmendment);
}
