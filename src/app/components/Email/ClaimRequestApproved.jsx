export default function ClaimRequestApproved({
  name,
  link,
  itemName,
  location,
  date
}) {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Claim Request Approved</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            color: #333;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
          }
          .header {
            background-color: #4caf50;
            color: #ffffff;
            text-align: center;
            padding: 20px;
            font-size: 24px;
            font-weight: bold;
          }
          .body {
            padding: 20px;
            font-size: 16px;
            line-height: 1.5;
          }
          .body p {
            margin: 10px 0;
          }
          .highlight {
            color: #4caf50;
            font-weight: bold;
          }
          .button-container {
            text-align: center;
            margin: 20px 0;
          }
          .button {
            background-color: #4caf50;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 5px;
            font-size: 16px;
          }
          .button:hover {
            background-color: #388e3c;
          }
          .footer {
            text-align: center;
            padding: 10px;
            background-color: #f1f1f1;
            font-size: 12px;
            color: #666;
          }
          @media (max-width: 600px) {
            .header {
              font-size: 20px;
            }
            .body {
              font-size: 14px;
            }
            .button {
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            Claim Request Approved
          </div>
          <div class="body">
            <p>Dear <span class="highlight">${name}</span>,</p>
            <p>We are pleased to inform you that your claim request for item, <span class="highlight">${itemName}</span>, has been approved by the SASO.</p>
            <p>Please go to <span class="highlight">${location}</span> at <span class="highlight">${date}</span> for claiming your item.</p>
            <p>For more details, click here:</p>
            <div class="button-container">
              <a href="${link}" class="button">View Item</a>
            </div>
            <p>If you have any questions or need assistance, feel free to contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
            <p>Best regards,</p>
            <p><strong>Tracify</strong></p>
          </div>
          <div class="footer">
            This is an automated email. Please do not reply directly to this message.
          </div>
        </div>
      </body>
      </html>
    `;
}
