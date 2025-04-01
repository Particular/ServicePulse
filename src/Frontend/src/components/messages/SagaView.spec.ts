import { render, describe, test, screen, expect, within } from "@component-test-utils";
import sut from "./SagaView.vue";
import Message, { SagaInfo } from "@/resources/Message";
import { SagaHistory } from "@/resources/SagaHistory";
import makeRouter from "@/router";

//Defines a domain-specific language (DSL) for interacting with the system under test (sut)
interface componentDSL {
  action1(value: string): void;
  assert: componentDSLAssertions;
}

//Defines a domain-specific language (DSL) for checking assertions against the system under test (sut)
interface componentDSLAssertions {
  displayedSagaGuidIs(sagaId: string): void;
  displayedSagaNameIs(humanizedSagaName: string): void;
  linkIsShown(arg0: { withText: string; withHref: string }): void;
  NoSagaDataAvailableMessageIsShownWithMessage(message: RegExp): void;
  SagaPlugInNeededIsShownWithTheMessages({ messages, withPluginDownloadUrl }: { messages: RegExp[]; withPluginDownloadUrl: string }): void;
  SagaSequenceIsNotShown(): void;
}

describe("Feature: Message not involved in Saga", () => {
  describe("Rule: When the selected message has not participated in a Saga, display a legend indicating it.​", () => {
    test("EXAMPLE: A message that has not participated in a saga is selected", () => {
      const message = {} as Message;
      message.invoked_sagas = [];

      const componentDriver = rendercomponent({ message: message });

      componentDriver.assert.NoSagaDataAvailableMessageIsShownWithMessage(/no saga data/i);
    });
  });
});

describe("Feature: Detecting no Audited Saga Data Available", () => {
  describe("Rule: When a message participates in a Saga, but the Saga data is unavailable, display a legend indicating that the Saga audit plugin is needed to visualize the saga.", () => {
    test("EXAMPLE: A message that was participated in a Saga without the Saga audit plugin being active gets selected", () => {
      const message = {} as Message;
      const invokedSaga = {} as SagaInfo;
      invokedSaga.saga_id = "saga_id";
      message.invoked_sagas = [invokedSaga];

      const componentDriver = rendercomponent({ message: message, sagaHistory: undefined });
      componentDriver.assert.SagaPlugInNeededIsShownWithTheMessages({
        messages: [/Saga audit plugin needed to visualize saga/i, /To visualize your saga, please install the appropriate nuget package in your endpoint/i, /install-package NServiceBus\.SagaAudit/i],
        withPluginDownloadUrl: "https://www.nuget.org/packages/NServiceBus.SagaAudit",
      });
    });
  });
});

describe("Feature: Navigation and Contextual Information", () => {
  describe("Rule: Provide clear navigational elements to move between the message flow diagram and the saga view.", () => {
    test("EXAMPLE: An record with id 123 gets selected", () => {
      //A "← Back to Messages" link allows users to easily navigate back to the flow diagram.
      const message = {} as Message;
      const invokedSaga = {} as SagaInfo;
      invokedSaga.saga_id = "saga_id";
      message.invoked_sagas = [invokedSaga];

      const storedMessageRecordId = "123";
      message.id = storedMessageRecordId;

      const componentDriver = rendercomponent({ message: message, sagaHistory: sampleSagaHistory });
      //TODO: this link needs to be configured so it navigates back but to the corresponding message in the flow diagram
      componentDriver.assert.linkIsShown({ withText: "← Back to Messages", withHref: `#/messages/${storedMessageRecordId}` });
    });
  });

  describe("Rule: Clearly indicate contextual information like Saga ID and Saga Type.", () => {
    test("EXAMPLE: A message with a Saga Id '123' and a Saga Type 'ServiceControl.SmokeTest.AuditingSaga' gets selected", () => {
      //The saga’s type ("AuditingSaga") and unique identifier (guid) are prominently displayed at the top for reference.
      const message = {} as Message;
      const invokedSaga = {} as SagaInfo;
      invokedSaga.saga_id = "123";
      invokedSaga.saga_type = "ServiceControl.SmokeTest.AuditingSaga";
      message.invoked_sagas = [invokedSaga];

      const componentDriver = rendercomponent({ message: message, sagaHistory: sampleSagaHistory });

      componentDriver.assert.displayedSagaNameIs("AuditingSaga");
      componentDriver.assert.displayedSagaGuidIs("123");
    });
  });
});

describe("Feature: 3 Visual Representation of Saga Timeline", () => {
  describe("Rule: 3.1 Clearly indicate the initiation and completion of a saga.", () => {
    test.todo("EXAMPLE: A message with a Saga Id '123' and a Saga Type 'ServiceControl.SmokeTest.AuditingSaga' gets selected", () => {
      //"Saga Initiated" is explicitly displayed first, and "Saga Completed" is explicitly displayed at the bottom.
    });
  });

  describe("Rule: 3.2 Display a chronological timeline of saga events.", () => {
    test.todo("EXAMPLE: A message with a Saga Id '123' and a Saga Type 'ServiceControl.SmokeTest.AuditingSaga' gets selected", () => {
      //     Each saga event ("Saga Initiated," "Saga Updated," "Timeout Invoked," "Saga Completed") is timestamped and visually aligned vertically to represent progression over time. Events are ordered by the time they ocurred. Incoming messages are displayed on the left, and outgoing messages are displayed on the right.
    });
  });
});

function rendercomponent({ message, sagaHistory = undefined }: { message: Message; sagaHistory?: SagaHistory }): componentDSL {
  const router = makeRouter();

  render(sut, {
    props: {
      message,
      sagaHistory,
    },
    global: {
      plugins: [router],
    },
  });

  const dslAPI: componentDSL = {
    action1: () => {
      // Add actions here
    },
    assert: {
      NoSagaDataAvailableMessageIsShownWithMessage(message: RegExp) {
        //ensure that the only one status message is shown
        expect(screen.queryAllByRole("status")).toHaveLength(1);

        const status = screen.queryByRole("status", { name: /message-not-involved-in-saga/i });
        expect(status).toBeInTheDocument();
        const statusText = within(status!).getByText(message);
        expect(statusText).toBeInTheDocument();

        this.SagaSequenceIsNotShown();
      },
      SagaPlugInNeededIsShownWithTheMessages({ messages, withPluginDownloadUrl }: { messages: RegExp[]; withPluginDownloadUrl: string }) {
        // Use the matcher to find the container element
        const messageContainer = screen.queryByRole("status", { name: /saga-plugin-needed/i });
        expect(messageContainer).toBeInTheDocument();

        // using within to find the text inside the container per each item in messages
        messages.forEach((message) => {
          const statusText = within(messageContainer!).getByText(message);
          expect(statusText).toBeInTheDocument();
        });

        // Verify the link
        const link = screen.getByRole("link", { name: "install-package NServiceBus.SagaAudit" });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", withPluginDownloadUrl);

        this.SagaSequenceIsNotShown();
      },
      SagaSequenceIsNotShown() {
        const sagaSequence = screen.queryByRole("list", { name: /saga-sequence-list/i });
        expect(sagaSequence).not.toBeInTheDocument();
      },
      linkIsShown(args: { withText: string; withHref: string }) {
        const link = screen.getByRole("link", { name: args.withText });
        expect(link).toBeInTheDocument();
        expect(link.getAttribute("href")).toBe(args.withHref);
      },
      displayedSagaNameIs(name: string) {
        const sagaName = screen.getByRole("heading", { name: /saga name/i });
        expect(sagaName).toBeInTheDocument();
        expect(sagaName).toHaveTextContent(name);
      },
      displayedSagaGuidIs(guid: string) {
        const sagaGuid = screen.getByRole("note", { name: /saga guid/i });
        expect(sagaGuid).toBeInTheDocument();
        expect(sagaGuid).toHaveTextContent(guid);
      },
    },
  };

  return dslAPI;
}

const sampleSagaHistory = <SagaHistory>{
  id: "45f425fc-26ce-163b-4f64-857b889348f3",
  saga_id: "45f425fc-26ce-163b-4f64-857b889348f3",
  saga_type: "ServiceControl.SmokeTest.AuditingSaga",
  changes: [
    {
      start_time: "2025-03-28T03:04:08.3819211Z",
      finish_time: "2025-03-28T03:04:08.3836Z",
      status: "completed",
      state_after_change: '{"Id":"45f425fc-26ce-163b-4f64-857b889348f3","Originator":null,"OriginalMessageId":"4b9fdea7-d78c-41f0-91ee-b2ae00328f9c"}',
      initiating_message: {
        message_id: "876d89bd-7a1f-43f1-b384-b2ae003290e8",
        is_saga_timeout_message: true,
        originating_endpoint: "Endpoint1",
        originating_machine: "mobvm2",
        time_sent: "2025-03-28T03:04:06.321561Z",
        message_type: "ServiceControl.SmokeTest.MyCustomTimeout",
        intent: "Send",
      },
      outgoing_messages: [],
      endpoint: "Endpoint1",
    },
    {
      start_time: "2025-03-28T03:04:07.5416262Z",
      finish_time: "2025-03-28T03:04:07.5509712Z",
      status: "updated",
      state_after_change: '{"Id":"45f425fc-26ce-163b-4f64-857b889348f3","Originator":null,"OriginalMessageId":"4b9fdea7-d78c-41f0-91ee-b2ae00328f9c"}',
      initiating_message: {
        message_id: "1308367f-c6a2-418f-9df2-b2ae00328fc9",
        is_saga_timeout_message: true,
        originating_endpoint: "Endpoint1",
        originating_machine: "mobvm2",
        time_sent: "2025-03-28T03:04:05.37723Z",
        message_type: "ServiceControl.SmokeTest.MyCustomTimeout",
        intent: "Send",
      },
      outgoing_messages: [],
      endpoint: "Endpoint1",
    },
    {
      start_time: "2025-03-28T03:04:06.3088353Z",
      finish_time: "2025-03-28T03:04:06.3218175Z",
      status: "updated",
      state_after_change: '{"Id":"45f425fc-26ce-163b-4f64-857b889348f3","Originator":null,"OriginalMessageId":"4b9fdea7-d78c-41f0-91ee-b2ae00328f9c"}',
      initiating_message: {
        message_id: "e5bb5304-7892-4d39-96e2-b2ae003290df",
        is_saga_timeout_message: false,
        originating_endpoint: "Sender",
        originating_machine: "mobvm2",
        time_sent: "2025-03-28T03:04:06.293765Z",
        message_type: "ServiceControl.SmokeTest.SagaMessage2",
        intent: "Send",
      },
      outgoing_messages: [
        {
          delivery_delay: "00:00:02",
          destination: "Endpoint1",
          message_id: "876d89bd-7a1f-43f1-b384-b2ae003290e8",
          time_sent: "2025-03-28T03:04:06.3214397Z",
          message_type: "ServiceControl.SmokeTest.MyCustomTimeout",
          intent: "Send",
        },
      ],
      endpoint: "Endpoint1",
    },
    {
      start_time: "2025-03-28T03:04:05.3332078Z",
      finish_time: "2025-03-28T03:04:05.3799483Z",
      status: "new",
      state_after_change: '{"Id":"45f425fc-26ce-163b-4f64-857b889348f3","Originator":null,"OriginalMessageId":"4b9fdea7-d78c-41f0-91ee-b2ae00328f9c"}',
      initiating_message: {
        message_id: "4b9fdea7-d78c-41f0-91ee-b2ae00328f9c",
        is_saga_timeout_message: false,
        originating_endpoint: "Sender",
        originating_machine: "mobvm2",
        time_sent: "2025-03-28T03:04:05.235534Z",
        message_type: "ServiceControl.SmokeTest.SagaMessage1",
        intent: "Send",
      },
      outgoing_messages: [
        {
          delivery_delay: "00:00:02",
          destination: "Endpoint1",
          message_id: "1308367f-c6a2-418f-9df2-b2ae00328fc9",
          time_sent: "2025-03-28T03:04:05.3715034Z",
          message_type: "ServiceControl.SmokeTest.MyCustomTimeout",
          intent: "Send",
        },
      ],
      endpoint: "Endpoint1",
    },
  ],
};
