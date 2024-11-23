import nodemailer from 'nodemailer';
import EmailTemplate from '@/app/components/Email/EmailTemplate';

export async function POST(req) {
  try {
    const { to, name, link, success, title } = await req.json();

    const htmlContent = EmailTemplate({ name, link, success, title });

    // Configure your transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // or 'SMTP', etc.
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Item Publication Successful',
      html: htmlContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: 'Email sent successfully!' }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
    });
  }
}
