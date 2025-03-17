Feature: 1 Detecting no Saga Data Available
        
    Rule: 1.1: When no saga data is available, display a message indicating the absence of data.​
    "Saga audit plugin needed to visualize saga" - "To visualize your saga, please install the appropriate nuget package in your endpoint"

Feature: 2 Navigation and Contextual Information

    Rule: 2.1: Provide clear navigational elements to move between views.
    A "← Back to Message View" link allows users to easily navigate back to the message flow view.

    Rule: 2.2 Clearly indicate contextual information like Saga ID or Saga Type.
    The saga’s type ("AuditingSaga") and unique identifier (guid) are prominently displayed at the top for reference.

Feature: 3 Visual Representation of Saga Timeline

    Rule: 3.1 Clearly indicate the initiation and completion of a saga.
   "Saga Initiated" is explicitly displayed first, and "Saga Completed" is explicitly displayed at the bottom.

    Rule: 3.2 Display a chronological timeline of saga events.
    Each saga event ("Saga Initiated," "Saga Updated," "Timeout Invoked," "Saga Completed") is timestamped and visually aligned vertically to represent progression over time. Events are ordered by the time they ocurred. Incoming messages are displayed on the left, and outgoing messages are displayed on the right.

Feature: 4 Correlation of Messages and Events

    Rule: 4.1: Display messages associated with saga updates clearly linked to specific saga events.
    "SagaMessage1" and "SagaMessage2" visually connect to their related saga events using lines. (outgoing messages)

    Rule: 4.2: Clearly indicate the Correlation ID used to associate messages with saga instances.
    "CorrelationId = b6c17827" is clearly shown beneath each message for easy identification.

Feature: 5 Timeout Management and Visualization

    Rule: 5.1 Display explicit timeout requests associated with saga events.
    "Timeout Requested = 2s" explicitly shown (between Incoming message and the resulting outgoing message)

    Rule: 5.2 Clearly show timeout invocation and its originating message.
    "Timeout Invoked" displays data that relates to its originating message (e.g., "MyCustomTimeout" indicates "Data = From SagaMessage1").

    Rule: 5.3 Clicking on a timeout configured by a saga navigates to the timeout message.

Feature: 6 Property Visibility Toggle

    Rule: 6.1 Allow toggling between showing "All Properties" or only "Updated Properties" of saga events.
    User selects "UPDATED PROPERTIES" to view only properties that changed in the current event.

Feature: 7 Message Data Visibility

    Rule: 7.1 Allow users to toggle message data visibility within the saga view.
    Clicking the "Show Message Data" button at the top of the view toggles detailed visibility of message properties or hides them.

Feature: 8 Handling Large Number of Changes

    Rule: 8.1 When the number of changes exceeds a predefined threshold, limit the display to prevent performance issues.​
    If a saga has over 1000 changes, only the most recent 100 are displayed, with an option to load more.​

Feature: 9 Navigating to Related Messages

    Rule: 9.1 Highlight specific updates based on user interaction - Enable navigation to messages related to the saga.​
    When a user clicks on a timeout message hyperlink, the corresponding message is scrolled into view and highlighted.
       