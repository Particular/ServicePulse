import { useTypedFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";

import { EndpointSettings } from "@/resources/EndpointSettings";

class EndpointSettingsClient {
  public async endpointSettings(): Promise<EndpointSettings[]> {
    const [response, data] = await useTypedFetchFromServiceControl<EndpointSettings[]>(`endpointssettings`);
    if (response.status === 200) {
      return data;
    }

    return [this.defaultEndpointSettingsValue()];
  }

  public defaultEndpointSettingsValue() {
    return <EndpointSettings>{ name: "", track_instances: true };
  }
}

export default new EndpointSettingsClient();
