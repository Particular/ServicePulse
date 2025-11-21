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

  public async fetchTypedFromServiceControl<T>(suffix: string): Promise<[Response, T]> {
    const response = await fetch(`${this.url}${suffix}`);
    if (!response.ok) throw new Error(response.statusText ?? "No response");
    const data = await response.json();

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
    return await fetch(`${this.url}${suffix}`, requestOptions);
  }

  public async putToServiceControl(suffix: string, payload: object | null) {
    const requestOptions: RequestInit = {
      method: "PUT",
    };
    if (payload != null) {
      requestOptions.headers = { "Content-Type": "application/json" };
      requestOptions.body = JSON.stringify(payload);
    }
    return await fetch(`${this.url}${suffix}`, requestOptions);
  }

  public async deleteFromServiceControl(suffix: string) {
    const requestOptions: RequestInit = {
      method: "DELETE",
    };
    return await fetch(`${this.url}${suffix}`, requestOptions);
  }

  public async patchToServiceControl(suffix: string, payload: object | null) {
    const requestOptions: RequestInit = {
      method: "PATCH",
    };
    if (payload != null) {
      requestOptions.headers = { "Content-Type": "application/json" };
      requestOptions.body = JSON.stringify(payload);
    }
    return await fetch(`${this.url}${suffix}`, requestOptions);
  }

  public async fetchFromServiceControl(suffix: string, options?: { cache?: RequestCache }) {
    const requestOptions: RequestInit = {
      method: "GET",
      cache: options?.cache ?? "default", // Default  if not specified
      headers: {
        Accept: "application/json",
      },
    };
    return await fetch(`${this.url}${suffix}`, requestOptions);
  }

  public async getErrorMessagesCount(status: string) {
    const [response] = await this.fetchTypedFromServiceControl(`errors?status=${status}`);
    if (response?.ok) {
      return parseInt(response.headers.get("Total-Count") ?? "0");
    }
    return undefined;
  }

  private getUrl() {
    const searchParams = new URLSearchParams(window.location.search);
    const scu = searchParams.get("scu");
    const existingScu = window.localStorage.getItem("scu");

    if (scu) {
      if (scu !== existingScu) {
        window.localStorage.setItem("scu", scu);
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

export default new ServiceControlClient();
