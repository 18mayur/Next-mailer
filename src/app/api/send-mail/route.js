import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// Define available email templates
const TEMPLATES = {
  newMail: {
    name: "Process Note / SOP Advisory",
    path: "src/emails/newMail.html",
  },
};

export async function POST(request) {
  try {
    const { recipients, subject, template } = await request.json();

    // Validation
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return Response.json(
        { success: false, message: "No recipients provided" },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return Response.json(
        { success: false, message: "Subject is required" },
        { status: 400 }
      );
    }

    if (!template || !TEMPLATES[template]) {
      return Response.json(
        { success: false, message: "Invalid template selected" },
        { status: 400 }
      );
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter((email) => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      return Response.json(
        {
          success: false,
          message: `Invalid email addresses: ${invalidEmails.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Read email template
    const templateConfig = TEMPLATES[template];
    const filePath = path.join(process.cwd(), templateConfig.path);

    if (!fs.existsSync(filePath)) {
      return Response.json(
        {
          success: false,
          message: `Template file not found: ${templateConfig.path}`,
        },
        { status: 404 }
      );
    }

    const htmlContent = fs.readFileSync(filePath, "utf8");

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Next.js Mailer" <${process.env.EMAIL_USER}>`,
      to: recipients,
      subject: subject.trim(),
      html: htmlContent,
    });

    console.log(`Email sent successfully to ${recipients.length} recipient(s)`);

    return Response.json({
      success: true,
      message: `Email sent to ${recipients.length} recipient(s)`,
      recipientCount: recipients.length,
    });
  } catch (error) {
    console.error("MAIL ERROR:", error);
    return Response.json(
      {
        success: false,
        message: error.message || "Failed to send email",
      },
      { status: 500 }
    );
  }
}
