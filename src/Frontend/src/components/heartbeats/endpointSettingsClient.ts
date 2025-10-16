import { useTypedFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
import { EndpointSettings } from "@/resources/EndpointSettings";

//TODO: why is this a class?
class EndpointSettingsClient {
  public async endpointSettings(isEndpointSettingsSupported: boolean): Promise<EndpointSettings[]> {
    if (isEndpointSettingsSupported) {
      const [, data] = await useTypedFetchFromServiceControl<EndpointSettings[]>(`endpointssettings`);
      return data;
    }

    return [this.defaultEndpointSettingsValue()];
  }

  public defaultEndpointSettingsValue() {
    return <EndpointSettings>{ name: "", track_instances: true };
  }
}

export default new EndpointSettingsClient();
