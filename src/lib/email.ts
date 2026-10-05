import { Resend } from "resend";

export async function sendAccountEmail(to: string, subject: string, html: string) {
  const { RESEND_API_KEY, EMAIL_FROM } = process.env;
  if (!RESEND_API_KEY || !EMAIL_FROM) throw new Error("Resend email is not configured");

  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
  if (error) throw new Error(`Resend rejected the email request (${error.name})`);
}