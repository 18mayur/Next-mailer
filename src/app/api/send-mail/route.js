import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const TEMPLATES = {
  newMail: "src/emails/newMail.html",
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

    if (!subject || typeof subject !== "string") {
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

    // Read template file
    const templatePath = path.join(process.cwd(), TEMPLATES[template]);
    const htmlContent = fs.readFileSync(templatePath, "utf8");

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    const mailOptions = {
      from: `"Next.js Mailer" <${process.env.EMAIL_USER}>`,
      to: recipients,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return Response.json({
      success: true,
      message: `Email sent successfully to ${recipients.length} recipient(s)`,
    });
  } catch (error) {
    console.error("MAIL ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to send email. Please try again later.",
      },
      { status: 500 }
    );
  }
}
