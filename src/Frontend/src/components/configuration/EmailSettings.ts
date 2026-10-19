// The settings the email configuration dialog edits. The SMTP password is write-only, so it is not part of them.
export default interface EmailSettings {
  enable_tls: boolean | null;
  smtp_server: string;
  smtp_port: number | null;
  authentication_account: string;
  from: string;
  to: string;
}
