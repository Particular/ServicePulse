import { useFetchFromServiceControl, usePostToServiceControl, useTypedFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
import EndpointThroughputSummary from "@/resources/EndpointThroughputSummary";
import UpdateUserIndicator from "@/resources/UpdateUserIndicator";
import ConnectionTestResults from "@/resources/ConnectionTestResults";
import ThroughputConnectionSettings from "@/resources/ThroughputConnectionSettings";
import { useDownloadFile } from "@/composables/fileDownloadCreator";
import ReportGenerationState from "@/resources/ReportGenerationState";

class ThroughputClient {
  constructor(readonly basePath: string) {}

  public async endpoints() {
    const [_, data] = await useTypedFetchFromServiceControl<EndpointThroughputSummary[]>(`${this.basePath}/endpoints`);

    return data;
  }

  public async updateIndicators(data: UpdateUserIndicator[]): Promise<void> {
    const response = await usePostToServiceControl(`${this.basePath}/endpoints/update`, data);
  }

  public async test() {
    const [, data] = await useTypedFetchFromServiceControl<ConnectionTestResults>(`${this.basePath}/settings/test`);
    return data;
  }

  public async setting() {
    const [, data] = await useTypedFetchFromServiceControl<ThroughputConnectionSettings>(`${this.basePath}/settings/info`);
    return data;
  }

  public async reportAvailable() {
    const [, data] = await useTypedFetchFromServiceControl<ReportGenerationState>(`${this.basePath}/report/available`);
    return data;
  }

  public downloadReport(masks: string[]) {
    //useDownloadFile();
    //const response = await useFetchFromServiceControl(`${this.basePath}/report/file`);
  }
}

export default new ThroughputClient("throughput");
