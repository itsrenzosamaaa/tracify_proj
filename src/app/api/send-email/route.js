import nodemailer from "nodemailer";
import ItemRequestApproval from "@/app/components/Email/ItemRequestApproval";
import ItemRequestDecline from "@/app/components/Email/ItemRequestDecline";
import ItemSurrenderInvalid from "@/app/components/Email/ItemSurrenderInvalid";
import ItemSurrenderSuccess from "@/app/components/Email/ItemSurrenderSuccess";
import ClaimRequestApproved from "@/app/components/Email/ClaimRequestApproved";
import ClaimRequestDeclined from "@/app/components/Email/ClaimRequestDecline";
import ClaimProcessDeclined from "@/app/components/Email/ClaimProcessDeclined";
import ClaimProcessSuccess from "@/app/components/Email/ClaimProcessSuccess";

export async function POST(req) {
  try {
    const {
      type,
      to,
      subject,
      name,
      link,
      success,
      itemName,
      location,
      remarks,
    } = await req.json();

    let htmlContent;
    if (type === "ItemRequestApproval") {
      htmlContent = ItemRequestApproval({
        name,
        link,
        success,
        itemName,
        location,
      });
    } else if (type === "ItemRequestDecline") {
      htmlContent = ItemRequestDecline({ name, link, itemName, remarks });
    } else if (type === "ItemSurrenderInvalid") {
      htmlContent = ItemSurrenderInvalid({ name, link, itemName, location });
    } else if (type === "ItemSurrenderSuccess") {
      htmlContent = ItemSurrenderSuccess({ name, link, itemName, location });
    } else if (type === "ClaimRequestApproved") {
      htmlContent = ClaimRequestApproved({ name, link, itemName, location });
    } else if (type === "ClaimRequestDeclined") {
      htmlContent = ClaimRequestDeclined({ name, link, itemName });
    } else if (type === "ClaimProcessDeclined") {
      htmlContent = ClaimProcessDeclined({ name, link, itemName, remarks });
    } else if (type === "ClaimProcessSuccess") {
      htmlContent = ClaimProcessSuccess({ name, link, itemName });
    }

    // Configure your transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or 'SMTP', etc.
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: "Tracify", // Ensure a valid "from" address
      to,
      subject,
      html: htmlContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ message: "Email sent successfully!" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
    });
  }
}
