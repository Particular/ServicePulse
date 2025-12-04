export interface RemoteInstanceDataRetention {
  audit_retention_period?: string;
  error_retention_period?: string;
}

export interface RemoteInstanceConfiguration {
  data_retention?: RemoteInstanceDataRetention;
}

export enum RemoteInstanceType {
  Audit = "audit",
  Error = "error",
  Unknown = "unknown",
}

export interface RemoteInstance {
  api_uri: string;
  version: string;
  status: RemoteInstanceStatus;
  configuration?: RemoteInstanceConfiguration;
  /** Cached instance type - determined when the instance was last online */
  cachedInstanceType?: RemoteInstanceType;
}

export enum RemoteInstanceStatus {
  Online = "online",
  Unavailable = "unavailable",
}
