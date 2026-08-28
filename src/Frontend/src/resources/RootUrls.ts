export default interface RootUrls {
  description: string;
  endpoints_error_url: string;
  known_endpoints_url: string;
  endpoints_message_search_url: string;
  endpoints_messages_url: string;
  audit_count_url: string;
  endpoints_url: string;
  errors_url: string;
  configuration: string;
  remote_configuration: string;
  message_search_url: string;
  license_status: string;
  license_details: string;
  name: string;
  sagas_url: string;
  event_log_items: string;
  archived_groups_url: string;
  get_archive_group: string;
  mypermissions_all?: string;
  mypermissions_summary?: string;
  my_routes_url?: string;
  platform_health_status?: "healthy" | "degraded" | "unavailable";
  platform_health_warnings?: string[];
  platform_health_version?: string;
}
