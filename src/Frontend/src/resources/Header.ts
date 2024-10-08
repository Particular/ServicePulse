export default interface Header {
  key: NServiceBusHeaders;
  value?: string;
}

export enum NServiceBusHeaders {
  HttpFrom = "NServiceBus.From",
  HttpTo = "NServiceBus.To",
  RouteTo = "NServiceBus.Header.RouteTo",
  DestinationSites = "NServiceBus.DestinationSites",
  OriginatingSite = "NServiceBus.OriginatingSite",
  SagaId = "NServiceBus.SagaId",
  MessageId = "NServiceBus.MessageId",
  CorrelationId = "NServiceBus.CorrelationId",
  ReplyToAddress = "NServiceBus.ReplyToAddress",
  NServiceBusVersion = "NServiceBus.Version",
  ReturnMessageErrorCodeHeader = "NServiceBus.ReturnMessage.ErrorCode",
  ControlMessageHeader = "NServiceBus.ControlMessage",
  SagaType = "NServiceBus.SagaType",
  OriginatingSagaId = "NServiceBus.OriginatingSagaId",
  OriginatingSagaType = "NServiceBus.OriginatingSagaType",
  DelayedRetries = "NServiceBus.Retries",
  DelayedRetriesTimestamp = "NServiceBus.Retries.Timestamp",
  ImmediateRetries = "NServiceBus.FLRetries",
  ProcessingStarted = "NServiceBus.ProcessingStarted",
  ProcessingEnded = "NServiceBus.ProcessingEnded",
  TimeSent = "NServiceBus.TimeSent",
  DeliverAt = "NServiceBus.DeliverAt",
  RelatedTo = "NServiceBus.RelatedTo",
  EnclosedMessageTypes = "NServiceBus.EnclosedMessageTypes",
  ContentType = "NServiceBus.ContentType",
  SubscriptionMessageType = "SubscriptionMessageType",
  SubscriberTransportAddress = "NServiceBus.SubscriberAddress",
  SubscriberEndpoint = "NServiceBus.SubscriberEndpoint",
  IsSagaTimeoutMessage = "NServiceBus.IsSagaTimeoutMessage",
  IsDeferredMessage = "NServiceBus.IsDeferredMessage",
  OriginatingEndpoint = "NServiceBus.OriginatingEndpoint",
  OriginatingMachine = "NServiceBus.OriginatingMachine",
  OriginatingHostId = "$.diagnostics.originating.hostid",
  ProcessingEndpoint = "NServiceBus.ProcessingEndpoint",
  ProcessingMachine = "NServiceBus.ProcessingMachine",
  HostDisplayName = "$.diagnostics.hostdisplayname",
  HostId = "$.diagnostics.hostid",
  HasLicenseExpired = "$.diagnostics.license.expired",
  OriginatingAddress = "NServiceBus.OriginatingAddress",
  ConversationId = "NServiceBus.ConversationId",
  PreviousConversationId = "NServiceBus.PreviousConversationId",
  MessageIntent = "NServiceBus.MessageIntent",
  NonDurableMessage = "NServiceBus.NonDurableMessage",
  TimeToBeReceived = "NServiceBus.TimeToBeReceived",
  DiagnosticsTraceParent = "traceparent",
  DiagnosticsTraceState = "tracestate",
  DiagnosticsBaggage = "baggage",
  DataBusConfigContentType = "NServiceBus.DataBusConfig.ContentType",
  ExceptionInfoExceptionType = "NServiceBus.ExceptionInfo.ExceptionType",
}
