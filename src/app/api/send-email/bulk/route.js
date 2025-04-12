import nodemailer from "nodemailer";
import SharedItem from "@/app/components/Email/SharedItemEmail";

export async function POST(req) {
  try {
    const {
      type,
      users, // array of { to, name }
      subject,
      link,
      itemName,
      sharedBy,
    } = await req.json();

    if (!Array.isArray(users) || users.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid user list." }),
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailJobs = users.map(({ to, name }) => {
      const htmlContent = SharedItem({
        name,
        link,
        itemName,
        sharedBy,
      });

      const mailOptions = {
        from: "Tracify",
        to,
        subject,
        html: htmlContent,
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.allSettled(emailJobs); // 🚀 Don't fail if one email fails

    return new Response(
      JSON.stringify({ message: "Emails sent successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to send emails" }), {
      status: 500,
    });
  }
}
