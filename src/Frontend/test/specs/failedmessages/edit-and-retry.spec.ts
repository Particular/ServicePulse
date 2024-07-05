import { test, describe } from "../../drivers/vitest/driver";

describe("FEATURE: Deleting failed messages", () => {
  describe("RULE: Editing of a message should only be allowed when ServiceControl 'AllowMessageEditing' is enabled", () => {
    test.todo(
      "EXAMPLE: ServiceControl 'AllowMessageEditing' is disabled"
      /* 
          Given a failed message is displayed in the Failed Messages list
          and the ServiceControl 'AllowMessageEditing' is disabled
          When the user sees the details of the message
          Then button for editing the message is not shown
        */
    );

    test.todo(
      "EXAMPLE: ServiceControl 'AllowMessageEditing' is enabled"
      /* 
            Given a failed message is displayed in the Failed Messages list
            and the ServiceControl 'AllowMessageEditing' is enabled
            When the user sees the details of the message
            Then button for editing the message is shown
            */
    );
  });

  describe("RULE: Only messages with with a content-type that is editable text should be allowed to be edited", () => {

    //Background: ServiceControl 'AllowMessageEditing' is enabled

    [
        { contentType: "application/atom+xml" }, 
        { contentType: "application/ld+json" }, 
        { contentType: "application/vnd.masstransit+json" }
    ].forEach(({ contentType }) => {
      test.todo(`EXAMPLE: Editing a message with "${contentType}" content-type`

        /* 
        Given a failed message is displayed in the Failed Messages list
        And the message has a content-type of "${contentType}"
        When the user opens the message editor
        And swtiches to the message body
        The message body should be editable */
      );
      
    });

    test.todo(`EXAMPLE: Editing a message with a content-type not recognized as editable text`
    /*
    Given a failed message is displayed in the Failed Messages list
    And the message has a content-type of "application/octet-stream"
    When the user opens the message editor
    And swtiches to the message body
    The message body should NOT be editable 
    And a legend with the following message should be shown:
    |Message body cannot be edited because content type "application/octet-stream" is not supported. Only messages with content types "application/json" and "text/xml" can be edited. |*/
    );
  });
});
