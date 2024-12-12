import { Resend } from 'resend';

type EmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiKey || !fromEmail) {
    console.warn('Email sending is disabled: Missing RESEND_API_KEY or EMAIL_FROM environment variable');
    return;
  }

  const resend = new Resend(apiKey);

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
