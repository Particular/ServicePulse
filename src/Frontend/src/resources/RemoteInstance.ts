export interface RemoteInstance {
  api_uri: string;
  version: string;
  status: RemoteInstanceStatus;
}

export enum RemoteInstanceStatus {
  Online = "online",
  Unavailable = "unavailable",
}
