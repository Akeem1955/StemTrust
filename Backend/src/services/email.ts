import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const logFilePath = path.join(process.cwd(), 'email.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Create a transporter
// If env vars are present, use them. Otherwise, use a logger transport.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass',
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const timestamp = new Date().toISOString();
  
  // Log the email attempt
  const logEntry = `[${timestamp}] SENDING EMAIL TO: ${to} | SUBJECT: ${subject}\n`;
  console.log(logEntry.trim());
  logStream.write(logEntry);

  try {
    // If we don't have real credentials, just log the content and return success
    if (!process.env.SMTP_HOST) {
      const contentLog = `[${timestamp}] EMAIL CONTENT:\n${text}\n----------------------------------------\n`;
      console.log('No SMTP_HOST configured. Logging email content to email.log');
      logStream.write(contentLog);
      return { success: true, message: 'Email logged (Mock Mode)' };
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"StemTrust" <noreply@stemtrust.org>',
      to,
      subject,
      text,
      html: html || text,
    });

    const successLog = `[${timestamp}] EMAIL SENT: ${info.messageId}\n`;
    console.log(successLog.trim());
    logStream.write(successLog);
    
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    const errorLog = `[${timestamp}] EMAIL FAILED: ${error.message}\n`;
    console.error(errorLog.trim());
    logStream.write(errorLog);
    throw error;
  }
}
