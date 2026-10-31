import nodemailer from "nodemailer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const { recipients, subject, html } = await request.json();

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return Response.json({ success: false, message: "No recipients provided" }, { status: 400 });
    }
    if (!subject || typeof subject !== "string") {
      return Response.json({ success: false, message: "Subject is required" }, { status: 400 });
    }
    if (!html || typeof html !== "string") {
      return Response.json({ success: false, message: "HTML content is required" }, { status: 400 });
    }

    const invalidEmails = recipients.filter((email) => !EMAIL_REGEX.test(email));
    if (invalidEmails.length > 0) {
      return Response.json(
        { success: false, message: `Invalid email addresses: ${invalidEmails.join(", ")}` },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Next.js Mailer" <${process.env.EMAIL_USER}>`,
      to: recipients,
      subject,
      html,
    });

    return Response.json({
      success: true,
      message: `Email sent successfully to ${recipients.length} recipient(s)`,
    });
  } catch (error) {
    console.error("MAIL ERROR:", error);
    return Response.json(
      { success: false, message: "Failed to send email. Please try again later." },
      { status: 500 }
    );
  }
}