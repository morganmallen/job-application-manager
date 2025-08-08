import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // For development, use a test account or configure your own SMTP
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // or your preferred email service
      auth: {
        user: this.configService.get('EMAIL_USER') || 'your-email@gmail.com',
        pass: this.configService.get('EMAIL_PASS') || 'your-app-password',
      },
    });
  }

  async sendInterviewReminder(
    toEmail: string,
    userName: string,
    eventTitle: string,
    eventType: string,
    scheduledAt: Date,
    companyName: string,
  ): Promise<void> {
    const subject = `Interview Reminder: ${eventTitle}`;
    const html = this.generateInterviewReminderEmail(
      userName,
      eventTitle,
      eventType,
      scheduledAt,
      companyName,
    );

    try {
      await this.transporter.sendMail({
        from:
          this.configService.get('EMAIL_USER') || 'noreply@jobappmanager.com',
        to: toEmail,
        subject,
        html,
      });

      this.logger.log(`Interview reminder email sent to ${toEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${toEmail}:`, error);
      // Don't throw error to avoid breaking the notification flow
    }
  }

  private generateInterviewReminderEmail(
    userName: string,
    eventTitle: string,
    eventType: string,
    scheduledAt: Date,
    companyName: string,
  ): string {
    const formattedDate = scheduledAt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = scheduledAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Interview Reminder</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .highlight {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 Interview Reminder</h1>
          <p>Don't forget your upcoming interview!</p>
        </div>
        
        <div class="content">
          <h2>Hello ${userName},</h2>
          
          <p>This is a friendly reminder about your upcoming interview:</p>
          
          <div class="highlight">
            <h3>${eventTitle}</h3>
            <p><strong>Type:</strong> ${eventType.replace('_', ' ')}</p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
          </div>
          
          <p>Please make sure to:</p>
          <ul>
            <li>Review your resume and the job description</li>
            <li>Prepare questions to ask the interviewer</li>
            <li>Test your equipment if it's a virtual interview</li>
            <li>Plan your route and arrive early if it's in-person</li>
          </ul>
          
          <p>Good luck with your interview!</p>
          
          <div class="footer">
            <p>This email was sent from your Job Application Manager.</p>
            <p>You can manage your notifications in your dashboard.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
