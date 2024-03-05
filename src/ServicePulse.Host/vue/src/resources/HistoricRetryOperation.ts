export default interface HistoricRetryOperation {
    request_id: string;
    retry_type: RetryType;
    start_time: string;
    completion_time: string;
    originator: string;
    failed: boolean;
    number_of_messages_processed: number;
}

export enum RetryType {
    Unknown = "Unknown",
    SingleMessage = "SingleMessage",
    FailureGroup = "FailureGroup",
    MultipleMessages = "MultipleMessages",
    AllForEndpoint = "AllForEndpoint",
    All = "All",
    ByQueueAddress = "ByQueueAddress"
}