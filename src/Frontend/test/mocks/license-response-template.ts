import LicenseInfo, { LicenseStatus } from "@/resources/LicenseInfo";

export const activeLicenseResponse = <LicenseInfo>{
  registered_to: "ACME Software",
  edition: "Enterprise",
  expiration_date: "2026-01-23T00:00:00.0000000Z",
  upgrade_protection_expiration: "",
  license_type: "Commercial",
  instance_name: "Particular.ServiceControl",
  trial_license: false,
  license_status: LicenseStatus.Valid,
  status: "valid",
};
