/**
 * Email utilities using nodemailer
 * Ported from Streamlit app email functions
 */
import nodemailer from 'nodemailer';

interface EmailConfig {
  sender: string;
  password: string;
  smtpServer: string;
  smtpPort: number;
}

function getEmailConfig(): EmailConfig {
  const sender = process.env.SENDER_EMAIL;
  const password = process.env.SENDER_PASSWORD;
  const smtpServer = process.env.SMTP_SERVER || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);

  if (!sender || !password) {
    throw new Error('Email credentials not configured. Please set SENDER_EMAIL and SENDER_PASSWORD.');
  }

  return { sender, password, smtpServer, smtpPort };
}

async function createTransporter() {
  const config = getEmailConfig();

  return nodemailer.createTransport({
    host: config.smtpServer,
    port: config.smtpPort,
    secure: config.smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: config.sender,
      pass: config.password,
    },
  });
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  productUrl: string
): Promise<boolean> {
  try {
    const config = getEmailConfig();
    const transporter = await createTransporter();

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl.replace(/\/$/, '')}?token=${encodeURIComponent(token)}`;

    const mailOptions = {
      from: config.sender,
      to: email,
      subject: "Verify your Arc'teryx Stock Alert Subscription",
      text: `
Thank you for subscribing to Arc'teryx stock alerts!

Please verify your email by clicking this link:
${verifyUrl}

Product: ${productUrl}

If you didn't subscribe, you can ignore this email.
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Error sending verification email: ${error}`);
    return false;
  }
}

export async function sendStockNotification(
  email: string,
  productName: string,
  productUrl: string,
  backInStock: Array<[string, string | null]>,
  outOfStock: Array<[string, string | null]>
): Promise<boolean> {
  try {
    const config = getEmailConfig();
    const transporter = await createTransporter();

    let body = `Arc'teryx ${productName} - Stock Status Update\n\n`;

    if (backInStock.length > 0) {
      body += '🎉 BACK IN STOCK:\n';
      for (const [color, size] of backInStock) {
        if (size) {
          body += `  ✅ ${color} - Size ${size}\n`;
        } else {
          body += `  ✅ ${color}\n`;
        }
      }
      body += '\n';
    }

    if (outOfStock.length > 0) {
      body += '❌ NOW OUT OF STOCK:\n';
      for (const [color, size] of outOfStock) {
        if (size) {
          body += `  ❌ ${color} - Size ${size}\n`;
        } else {
          body += `  ❌ ${color}\n`;
        }
      }
      body += '\n';
    }

    body += `Product URL: ${productUrl}\n`;
    body += `Checked at: ${new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}\n`;

    if (backInStock.length > 0) {
      body += '\nHurry and get yours before it sells out again!\n';
    }

    const mailOptions = {
      from: config.sender,
      to: email,
      subject: `🎉 Arc'teryx ${productName} Stock Alert!`,
      text: body,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Error sending stock notification: ${error}`);
    return false;
  }
}
