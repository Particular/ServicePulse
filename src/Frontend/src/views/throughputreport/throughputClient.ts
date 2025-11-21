import EndpointThroughputSummary from "@/resources/EndpointThroughputSummary";
import UpdateUserIndicator from "@/resources/UpdateUserIndicator";
import ConnectionTestResults from "@/resources/ConnectionTestResults";
import ThroughputConnectionSettings from "@/resources/ThroughputConnectionSettings";
import { downloadFileFromResponse } from "@/composables/fileDownloadCreator";
import ReportGenerationState from "@/resources/ReportGenerationState";
import { parse } from "@tinyhttp/content-disposition";
import serviceControlClient from "@/components/serviceControlClient";

class ThroughputClient {
  constructor(readonly basePath: string) {}

  public async endpoints() {
    const [, data] = await serviceControlClient.fetchTypedFromServiceControl<EndpointThroughputSummary[]>(`${this.basePath}/endpoints`);

    return data;
  }

  public async updateIndicators(data: UpdateUserIndicator[]): Promise<void> {
    await serviceControlClient.postToServiceControl(`${this.basePath}/endpoints/update`, data);
  }

  public async test() {
    const [, data] = await serviceControlClient.fetchTypedFromServiceControl<ConnectionTestResults>(`${this.basePath}/settings/test`);
    return data;
  }

  public async setting() {
    const [, data] = await serviceControlClient.fetchTypedFromServiceControl<ThroughputConnectionSettings>(`${this.basePath}/settings/info`);
    return data;
  }

  public async reportAvailable() {
    const [, data] = await serviceControlClient.fetchTypedFromServiceControl<ReportGenerationState>(`${this.basePath}/report/available`);
    return data;
  }

  public async downloadReport() {
    const response = await serviceControlClient.fetchFromServiceControl(`${this.basePath}/report/file?spVersion=${encodeURIComponent(window.defaultConfig.version)}`);
    if (response.ok) {
      let fileName = "throughput-report.json";
      const contentType = response.headers.get("Content-Type") ?? "application/json";
      const contentDisposition = response.headers.get("Content-Disposition");
      try {
        if (contentDisposition != null) {
          fileName = parse(contentDisposition).parameters["filename"] as string;
        }
      } catch {
        //fallback to the default name, if filename is missing in response header
      }
      await downloadFileFromResponse(response, contentType, fileName);
      return fileName;
    }
    return "";
  }

  public async getMasks() {
    const [, data] = await serviceControlClient.fetchTypedFromServiceControl<string[]>(`${this.basePath}/settings/masks`);
    return data;
  }

  public async updateMasks(data: string[]): Promise<void> {
    await serviceControlClient.postToServiceControl(`${this.basePath}/settings/masks/update`, data);
  }
}

export default () => new ThroughputClient("licensing");
