import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
 
    const filePath = path.join(
      process.cwd(),
      "src/emails/index.html"
    );
    const htmlContent = fs.readFileSync(filePath, "utf8");
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Next.js Mailer" <${process.env.EMAIL_USER}>`,
      to: ["sarika.patil@credila.com","mayu2003shinde@gmail.com","mayu2003shinde@outlook.com","rushabh.anam@credila.com"], 
      subject: "Test HTML Mailer",
      html: htmlContent,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("MAIL ERROR:", error);
    return Response.json(
      { success: false },
      { status: 500 }
    );
  }
}

// rushabh.anam@credila.com