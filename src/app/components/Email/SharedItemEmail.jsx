export default function SharedItem({
  name,
  sharedBy,
  caption,
  itemName,
  link,
}) {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>New Post Shared with You</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
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
            background-color: #3f51b5;
            color: #ffffff;
            text-align: center;
            padding: 20px;
            font-size: 22px;
            font-weight: bold;
          }
          .body {
            padding: 20px;
            font-size: 16px;
            line-height: 1.6;
          }
          .body p {
            margin: 12px 0;
          }
          .highlight {
            font-weight: bold;
            color: #3f51b5;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            background-color: #3f51b5;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 5px;
            font-size: 16px;
          }
          .button:hover {
            background-color: #303f9f;
          }
          .footer {
            background-color: #f1f1f1;
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            You've Received a Shared Post!
          </div>
          <div class="body">
            <p>Hi <span class="highlight">${name}</span>,</p>
            <p><span class="highlight">${sharedBy}</span> just shared an item post with you on <strong>Tracify</strong>.</p>
            <p><strong>Item:</strong> ${itemName}</p>
            <p><strong>Message:</strong> ${
              caption || "No message provided."
            }</p>
            <div class="button-container">
              <a href="${link}" class="button">View Shared Post</a>
            </div>
            <p>If this item seems familiar or you have helpful information, we encourage you to engage and help.</p>
            <p>Thanks for being part of the Tracify community!</p>
            <p><strong>— The Tracify Team</strong></p>
          </div>
          <div class="footer">
            This is an automated email. Please do not reply directly.
          </div>
        </div>
      </body>
      </html>
    `;
}
