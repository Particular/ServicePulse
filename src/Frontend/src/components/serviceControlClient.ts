import { authFetch } from "@/composables/useAuthenticatedFetch";
import type RootUrls from "@/resources/RootUrls";
import type { RemoteInstance } from "@/resources/RemoteInstance";
import { HttpError } from "@/utils/HttpError";

export interface ServiceControlInstanceConnection {
  settings: { [key: string]: object };
  errors: string[];
}

export type ServiceControlRootDocument = RootUrls & {
  platform_health_status: "healthy" | "degraded" | "unavailable";
  platform_health_version: string;
};

class ServiceControlClient {
  private _url: string | undefined = undefined;

  get url(): string | undefined {
    if (this._url === undefined) {
      this._url = this.getUrl();
    }
    return this._url;
  }

  public resetUrl() {
    this._url = undefined;
  }

  public async getServiceControlConnection() {
    try {
      const [, data] = await this.fetchTypedFromServiceControl<ServiceControlInstanceConnection>("connection");
      return data;
    } catch {
      return { errors: [`Error reaching ServiceControl at ${this.url} connection`] } as ServiceControlInstanceConnection;
    }
  }

  public async getRoot(): Promise<[Response, ServiceControlRootDocument]> {
    return await this.fetchTypedFromServiceControl<ServiceControlRootDocument>("");
  }

  public async getRemoteInstances() {
    const [, data] = await this.fetchTypedFromServiceControl<RemoteInstance[]>("configuration/remotes");
    return data;
  }

  public fetchTypedFromServiceControl<T>(suffix: string, signal?: AbortSignal): Promise<[Response, T]> {
    return this.fetchTypedFromUrl<T>(`${this.url}${suffix}`, signal);
  }

  // Fetch from an absolute URL, e.g. one discovered from the ServiceControl root document.
  public async fetchTypedFromUrl<T>(url: string, signal?: AbortSignal): Promise<[Response, T]> {
    const response = await authFetch(url, { signal });
    if (!response.ok) {
      let error: Error = new HttpError(response.status, response.statusText ?? "No response");
      if (response.status === 400) {
        try {
          const errorResponse = await response.json();
          error = new Error(errorResponse.detail ?? errorResponse.title);
          // eslint-disable-next-line no-empty
        } catch {}
      }
      throw error;
    }
    const data = response.status !== 204 && (await response.json());

    return [response, data];
  }

  public async postToServiceControl(suffix: string, payload: object | null = null) {
    const requestOptions: RequestInit = {
      method: "POST",
    };
    if (payload != null) {
      requestOptions.headers = { "Content-Type": "application/json" };
      requestOptions.body = JSON.stringify(payload);
    }
    return await authFetch(`${this.url}${suffix}`, requestOptions);
  }

  public async postFileToServiceControl(suffix: string, file: File, paramName = "file") {
    const formData = new FormData();
    formData.append(paramName, file);

    const requestOptions: RequestInit = {
      method: "POST",
      body: formData,
    };

    return await authFetch(`${this.url}${suffix}`, requestOptions);
  }

  public async putToServiceControl(suffix: string, payload: object | null) {
    const requestOptions: RequestInit = {
      method: "PUT",
    };
    if (payload != null) {
      requestOptions.headers = { "Content-Type": "application/json" };
      requestOptions.body = JSON.stringify(payload);
    }
    return await authFetch(`${this.url}${suffix}`, requestOptions);
  }

  public async deleteFromServiceControl(suffix: string) {
    const requestOptions: RequestInit = {
      method: "DELETE",
    };
    return await authFetch(`${this.url}${suffix}`, requestOptions);
  }

  public async patchToServiceControl(suffix: string, payload: object | null) {
    const requestOptions: RequestInit = {
      method: "PATCH",
    };
    if (payload != null) {
      requestOptions.headers = { "Content-Type": "application/json" };
      requestOptions.body = JSON.stringify(payload);
    }
    return await authFetch(`${this.url}${suffix}`, requestOptions);
  }

  public fetchFromServiceControl(suffix: string, options?: { cache?: RequestCache }) {
    return this.fetchFromUrl(`${this.url}${suffix}`, options);
  }

  // Fetch from an absolute URL, e.g. one discovered from the ServiceControl root document.
  public async fetchFromUrl(url: string, options?: { cache?: RequestCache }) {
    const requestOptions: RequestInit = {
      method: "GET",
      cache: options?.cache ?? "default", // Default  if not specified
      headers: {
        Accept: "application/json",
      },
    };
    return await authFetch(url, requestOptions);
  }

  public async getErrorMessagesCount(status: string) {
    const [response] = await this.fetchTypedFromServiceControl(`errors?status=${status}`);
    if (response?.ok) {
      return parseInt(response.headers.get("Total-Count") ?? "0");
    }
    return undefined;
  }

  private getUrl() {
    if (window.defaultConfig?.isIntegrated && window.defaultConfig.service_control_url?.length) {
      return window.defaultConfig.service_control_url;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const scu = searchParams.get("scu");
    const existingScu = safeStorageGet("scu");

    if (scu) {
      if (scu !== existingScu) {
        safeStorageSet("scu", scu);
      }
      return scu;
    } else if (existingScu) {
      return existingScu;
    } else if (window.defaultConfig && window.defaultConfig.service_control_url && window.defaultConfig.service_control_url.length) {
      return window.defaultConfig.service_control_url;
    }

    return undefined;
  }
}

function safeStorageGet(key: string) {
  try {
    return window.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string) {
  try {
    window.localStorage?.setItem(key, value);
  } catch {
    // ignore storage access errors
  }
}

export default new ServiceControlClient();
