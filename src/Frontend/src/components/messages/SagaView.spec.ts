import { render, describe, test, screen, expect } from "@component-test-utils";
import sut from "./SagaView.vue";
import Message from "@/resources/Message";

//Defines a domain-specific language (DSL) for interacting with the system under test (sut)
interface componentDSL {
  action1(value: string): void;
  assert: componentDSLAssertions;
}

//Defines a domain-specific language (DSL) for checking assertions against the system under test (sut)
interface componentDSLAssertions {
  NoSagaDataAvailableMessageIsShown(): void;
  SagaPlugInNeededIsShown(): void;
  SagaSequenceIsNotShown(): void;
}

describe("Feature: Message not involved in Saga", () => {
  describe("Rule: 0.1: When the selected message has not participated in a Saga, display a legend indicating it.​", () => {
    test("EXAMPLE: A message that has not participated in a saga is selected", () => {
      const componentDriver = rendercomponent({ message: {} as Message });

      componentDriver.assert.NoSagaDataAvailableMessageIsShown();
    });
  });
});

describe("Feature: 1 Detecting no Audited Saga Data Available", () => {
  describe("Rule: 1.1: When a message participates in a Saga, but the Saga data is unavailable, display a legend indicating that the Saga audit plugin is needed to visualize the saga.", () => {
    test("EXAMPLE: A message that was participated in a Saga without the Saga audit plugin being active gets selected", () => {
      const componentDriver = rendercomponent({ message: {} as Message });

      //"Saga audit plugin needed to visualize saga" - "To visualize your saga, please install the appropriate nuget package in your endpoint"
      componentDriver.assert.SagaPlugInNeededIsShown();
    });
  });
});

function rendercomponent({ message }: { message: Message }): componentDSL {
  render(sut, {
    props: {
      message,
    },
  });

  const dslAPI: componentDSL = {
    action1: () => {
      // Add actions here
    },
    assert: {
      NoSagaDataAvailableMessageIsShown() {
        const status = screen.queryByRole("status", { name: /message-not-involved-in-saga/i });
        expect(status).toBeInTheDocument();

        this.SagaSequenceIsNotShown();
      },
      SagaPlugInNeededIsShown() {
        const status = screen.queryByRole("status", { name: /saga-plugin-needed/i });
        expect(status).toBeInTheDocument();
        this.SagaSequenceIsNotShown();
      },
      SagaSequenceIsNotShown() {
        const sagaSequence = screen.queryByRole("list", { name: /saga-sequence-list/i });
        expect(sagaSequence).not.toBeInTheDocument();
      },
    },
  };

  return dslAPI;
}
