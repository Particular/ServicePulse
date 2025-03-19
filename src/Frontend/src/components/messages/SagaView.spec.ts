import { render, describe, test, screen, expect } from "@component-test-utils";
import component from "./SagaView.vue";
import Message from "@/resources/Message";

//Defines a domain-specific language (DSL) for interacting with the system under test (sut)
interface componentDSL {
  action1(value: string): void;
  assert: componentDSLAssertions;
}

//Defines a domain-specific language (DSL) for checking assertions against the system under test (sut)
interface componentDSLAssertions {
  NoSagaDataAvailableMessageIsShown(): void;
}

describe("Feature: Message not involved in Saga", () => {
  describe("Rule: 0.1: When the message is not part of a sage , display a message indicating the no saga data.​", () => {
    test("EXAMPLE: A message that was not involved in a saga is selected", () => {
      const component = rendercomponent({ message: {} as Message });

      component.assert.NoSagaDataAvailableMessageIsShown();
    });
  });
});

function rendercomponent({ message }: { message: Message }): componentDSL {
  render(component, {
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

        const sagaSequence = screen.queryByRole("list", { name: /saga-sequence-list/i });
        expect(sagaSequence).not.toBeInTheDocument();
      },
    },
  };

  return dslAPI;
}
