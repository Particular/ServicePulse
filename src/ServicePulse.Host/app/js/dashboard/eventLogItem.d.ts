export default interface EventLogItem {
    id: String;
    description: String;
    severity: String;
    raised_at: Date;
    related_to: String[];
    category: String;
    event_type: string;
}