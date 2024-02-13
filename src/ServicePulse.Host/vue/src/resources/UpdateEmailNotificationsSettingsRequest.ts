export default interface UpdateEmailNotificationsSettingsRequest {
  smtp_server: string;
  smtp_port: number;
  authentication_account: string;
  authentication_password: string;
  enable_tls: boolean;
  to: string;
  from: string;
}
