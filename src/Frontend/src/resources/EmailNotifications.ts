export default interface EmailNotifications {
  enabled: boolean;
  smtp_server?: string;
  smtp_port?: number;
  authentication_account?: string;
  // Only returned by ServiceControl versions before 6.21.2.
  authentication_password?: string;
  enable_tls: boolean;
  to?: string;
  from?: string;
}
