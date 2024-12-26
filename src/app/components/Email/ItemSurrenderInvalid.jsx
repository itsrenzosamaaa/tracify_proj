export default function ItemSurrenderInvalid({ name, link, itemName, location }) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Item Surrender Reminder</title>
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
            background-color: #f44336;
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
            color: #f44336;
            font-weight: bold;
          }
          .button-container {
            text-align: center;
            margin: 20px 0;
          }
          .button {
            background-color: #f44336;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 5px;
            font-size: 16px;
          }
          .button:hover {
            background-color: #e53935;
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
            Item Surrender Reminder
          </div>
          <div class="body">
            <p>Dear <span class="highlight">${name}</span>,</p>
            <p>We noticed that you did not surrender the item, <span class="highlight">${itemName}</span>, to the office.</p>
            <p>That item was supposed to be surrendered to <span class="highlight">${location}</span> for verification, but it seems the action was not completed.</p>
            <p>Please make sure to surrender the item next time to avoid any further issues. You can view your item details using the link below:</p>
            <div class="button-container">
              <a href="${link}" class="button">View Your Item</a>
            </div>
            <p>If you have any questions or need assistance, feel free to contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
            <p>Thank you for your cooperation!</p>
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
