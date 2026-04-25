import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request) {
  try {
    const { to, cc, bcc, subject, body } = await request.json();

    // Validation
    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: to, subject, body',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid recipient email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (cc && !emailRegex.test(cc)) {
      return new Response(
        JSON.stringify({ error: 'Invalid CC email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (bcc && !emailRegex.test(bcc)) {
      return new Response(
        JSON.stringify({ error: 'Invalid BCC email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      ...(cc && { cc }),
      ...(bcc && { bcc }),
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(to right, #3b82f6, #a855f7); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">Next Mailer</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
            <h3 style="color: #1f2937; margin-bottom: 10px;">${subject}</h3>
            <div style="white-space: pre-wrap; word-break: break-word;">${body}</div>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 12px;">
              Sent via Next Mailer • ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({
        message: 'Email sent successfully',
        data: {
          to,
          subject,
          timestamp: new Date().toISOString(),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Email sending error:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ message: 'Email API is running' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
