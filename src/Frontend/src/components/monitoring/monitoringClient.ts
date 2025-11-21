import { Endpoint, EndpointDetails } from "@/resources/MonitoringEndpoint";

export interface MetricsConnectionDetails {
  Enabled: boolean;
  MetricsQueue?: string;
  Interval?: string;
}

class MonitoringClient {
  private _url: string | undefined | null = null;

  get url(): string | undefined {
    if (this._url === null) {
      this._url = this.getUrl();
    }
    return this._url;
  }

  public resetUrl() {
    this._url = null;
  }

  public async getEndpointDetails(endpointName: string, historyPeriod = 1) {
    const [, details] = await this.fetchTypedFromMonitoring<EndpointDetails>(`monitored-endpoints/${endpointName}?history=${historyPeriod}`);
    return details;
  }

  public async getMonitoringConnection() {
    try {
      const [, data] = await this.fetchTypedFromMonitoring<{ Metrics: MetricsConnectionDetails }>("connection");
      return { ...data, errors: [] };
    } catch {
      return { Metrics: null, errors: ["Could not retrieve the monitoring connection"] };
    }
  }

  public async getMonitoringVersion() {
    const [response] = await this.fetchTypedFromMonitoring("");
    if (response?.ok) {
      return response.headers.get("X-Particular-Version") ?? "";
    }
    return "";
  }

  public async getDisconnectedEndpointsCount() {
    const [, data] = await this.fetchTypedFromMonitoring<number>("monitored-endpoints/disconnected");
    return data;
  }

  public async getMonitoredEndpoints(historyPeriod: number) {
    const [, data] = await this.fetchTypedFromMonitoring<Endpoint[]>(`monitored-endpoints?history=${historyPeriod}`);
    return data ?? [];
  }

  public async deletedMonitoredEndpoint(endpointName: string, instanceId: string) {
    if (this.isMonitoringDisabled) {
      return;
    }
    await fetch(`${this.url}monitored-instance/${endpointName}/${instanceId}`, {
      method: "DELETE",
    });
  }

  public async isRemovingEndpointEnabled() {
    if (this.isMonitoringDisabled) {
      return false;
    }

    const response = await fetch(`${this.url}`, {
      method: "OPTIONS",
    });

    if (response.ok) {
      const headers = response.headers;
      const allow = headers.get("Allow");
      if (allow) {
        const deleteAllowed = allow.indexOf("DELETE") >= 0;
        return deleteAllowed;
      }
    }
    return false;
  }

  public get isMonitoringEnabled() {
    return this.url && this.url !== "!" ? true : false;
  }

  public get isMonitoringDisabled() {
    return !this.isMonitoringEnabled;
  }

  private async fetchTypedFromMonitoring<T>(suffix: string): Promise<[Response?, T?]> {
    if (this.isMonitoringDisabled) {
      return [];
    }

    const response = await fetch(`${this.url}${suffix}`);
    const data = await response.json();

    return [response, data];
  }

  private getUrl() {
    const searchParams = new URLSearchParams(window.location.search);
    const mu = searchParams.get("mu");
    const existingMu = window.localStorage.getItem("mu");

    if (mu) {
      if (mu !== existingMu) {
        window.localStorage.setItem("mu", mu);
      }
      return mu;
    } else if (existingMu) {
      return existingMu;
    } else if (window.defaultConfig && window.defaultConfig.monitoring_urls && window.defaultConfig.monitoring_urls.length) {
      return window.defaultConfig.monitoring_urls[0];
    }

    return undefined;
  }
}

export default new MonitoringClient();
