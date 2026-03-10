import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_EMAIL,
    SMTP_PASSWORD,
  } = process.env;
  const user = SMTP_USER || SMTP_EMAIL;
  const pass = SMTP_PASS || SMTP_PASSWORD;
  if (SMTP_HOST && SMTP_PORT && user && pass) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user, pass },
    });
    return transporter;
  }
  transporter = {
    sendMail: async ({ to, subject, text }) => {
      console.log("[Mail Fallback] To:", to);
      console.log("[Mail Fallback] Subject:", subject);
      console.log("[Mail Fallback] Body:\n", text);
      return { messageId: "logged" };
    },
  };
  return transporter;
};

export const sendMail = async ({ to, subject, text, html }) => {
  const t = await getTransporter();
  const from = process.env.MAIL_FROM || "no-reply@eventhub.local";
  return t.sendMail({ from, to, subject, text, html });
};
