import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendReminderEmail = async (email: string, name: string, daysLeft: number) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: `Subscription Reminder: ${name} renews in ${daysLeft} days`,
    html: `
      <h2>Subscription Reminder</h2>
      <p>Your subscription <b>${name}</b> renews in <b>${daysLeft} days</b>.</p>
      <p>Go cancel or renew it before you're charged.</p>
    `,
  });
};