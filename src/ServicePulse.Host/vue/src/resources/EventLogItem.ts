export default interface EventLogItem {
  id: string;
  description: string;
  severity: string;
  raised_at: string;
  related_to: string[];
  category: string;
  event_type: string;
}
