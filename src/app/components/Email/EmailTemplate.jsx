export default function EmailTemplate({ name, link, success, title }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
        }
        .container {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          max-width: 600px;
          margin: auto;
        }
        .header {
          background-color: ${success ? '#4caf50' : '#ff0000'};
          color: white;
          padding: 10px 20px;
          text-align: center;
        }
        .content {
          padding: 20px;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          text-align: center;
          color: gray;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>The item that you reported to us has been published. Please check at your items to track their status:</p>
          <button href="${link}" target="_blank">Redirect to site</button>
          <p>Thank you for supporting Tracify!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Tracify. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
