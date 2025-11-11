import { Resend } from 'resend';

interface EmailUser {
  email: string;
  firstName?: string;
  lastName?: string;
}

class EmailService {
  private resend: Resend;

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is required');
    }
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  /**
   * Send registration confirmation email
   */
  async sendRegistrationConfirmationEmail(user: EmailUser): Promise<boolean> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'CRM System <noreply@edgereachtech.com>',
        to: [user.email],
        subject: 'Account Registration Confirmation - CRM System',
        html: this.getRegistrationConfirmationTemplate(user),
      });

      if (error) {
        console.error('Error sending registration confirmation email:', error);
        return false;
      }

      console.log('Registration confirmation email sent successfully:', data?.id);
      return true;
    } catch (error) {
      console.error('Failed to send registration confirmation email:', error);
      return false;
    }
  }

  /**
   * Send approval notification email
   */
  async sendApprovalNotificationEmail(user: EmailUser): Promise<boolean> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'CRM System <noreply@edgereachtech.com>',
        to: [user.email],
        subject: 'Account Approved - Welcome to CRM System',
        html: this.getApprovalNotificationTemplate(user),
      });

      if (error) {
        console.error('Error sending approval notification email:', error);
        return false;
      }

      console.log('Approval notification email sent successfully:', data?.id);
      return true;
    } catch (error) {
      console.error('Failed to send approval notification email:', error);
      return false;
    }
  }

  /**
   * Send rejection notification email
   */
  async sendRejectionNotificationEmail(user: EmailUser, reason?: string): Promise<boolean> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'CRM System <noreply@your-domain.com>',
        to: [user.email],
        subject: 'Account Registration Update - CRM System',
        html: this.getRejectionNotificationTemplate(user, reason),
      });

      if (error) {
        console.error('Error sending rejection notification email:', error);
        return false;
      }

      console.log('Rejection notification email sent successfully:', data?.id);
      return true;
    } catch (error) {
      console.error('Failed to send rejection notification email:', error);
      return false;
    }
  }

  /**
   * Send password reset email with a one-time token link
   */
  async sendPasswordResetEmail(user: EmailUser, resetUrl: string): Promise<boolean> {
    try {
      console.log('🔍 Attempting to send password reset email to:', user.email);
      console.log('🔗 Reset URL:', resetUrl);
      console.log('🔑 RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY);
      
      // Reuse the existing template implementation that expects a user object containing resetLink
      const templateHtml = this.getPasswordResetTemplate({ ...user, resetLink: resetUrl } as EmailUser & { resetLink: string });
      
      console.log('📧 Calling Resend API...');
      const { data, error } = await this.resend.emails.send({
        from: 'CRM System <noreply@edgereachtech.com>',
        to: [user.email],
        subject: 'Reset your CRM System password',
        html: templateHtml,
      });

      if (error) {
        console.error('❌ Error sending password reset email:', error);
        return false;
      }

      console.log('✅ Password reset email sent successfully:', data?.id);
      return true;
    } catch (error) {
      console.error('💥 Failed to send password reset email:', error);
      return false;
    }
  }

  /**
   * Send password reset confirmation email
   */
  async sendPasswordResetConfirmationEmail(user: EmailUser): Promise<boolean> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'CRM System <noreply@edgereachtech.com>',
        to: [user.email],
        subject: 'Password Reset Successful - CRM System',
        html: this.getPasswordResetConfirmationTemplate(user),
      });

      if (error) {
        console.error('Error sending password reset confirmation email:', error);
        return false;
      }

      console.log('Password reset confirmation email sent successfully:', data?.id);
      return true;
    } catch (error) {
      console.error('Failed to send password reset confirmation email:', error);
      return false;
    }
  }

  /**
   * Registration confirmation email template
   */
  private getRegistrationConfirmationTemplate(user: EmailUser): string {
    const userName = user.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : 'User';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Confirmation</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white; 
          border-radius: 12px; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .welcome-box {
          background: #f1f5f9;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .status-badge {
          display: inline-block;
          background: #fbbf24;
          color: #92400e;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          margin: 20px 0;
        }
        .footer { 
          background: #f8fafc; 
          padding: 30px; 
          text-align: center; 
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
        .logo {
          display: inline-block;
          margin-bottom: 10px;
        }
        .btn {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" rx="20" fill="white" fill-opacity="0.1"/>
              <path d="M25 35h50v30H25z" fill="white" fill-opacity="0.2"/>
              <circle cx="35" cy="45" r="4" fill="white"/>
              <circle cx="50" cy="45" r="4" fill="white"/>
              <circle cx="65" cy="45" r="4" fill="white"/>
              <path d="M30 55h40l-8 10H38z" fill="white" fill-opacity="0.8"/>
            </svg>
          </div>
          <h1>CRM System</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Customer Relationship Management</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Registration Successful!</h2>
          
          <p>Hello ${userName},</p>
          
          <div class="welcome-box">
            <p style="margin: 0; font-weight: 600; color: #1e293b;">
              Thank you for registering with our CRM System!
            </p>
          </div>
          
          <p>Your account has been created successfully and is currently under review by our administrators.</p>
          
          <div style="text-align: center;">
            <span class="status-badge">⏳ Pending Admin Approval</span>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ul style="color: #475569;">
            <li>Our admin team will review your registration request</li>
            <li>You'll receive an email notification once your account is approved</li>
            <li>After approval, you can log in and access all CRM features</li>
          </ul>
          
          <p><strong>Account Details:</strong></p>
          <ul style="color: #475569;">
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
            <li><strong>Status:</strong> Pending Approval</li>
          </ul>
          
          <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>CRM System Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">
            This is an automated message. Please do not reply to this email.
          </p>
          <p style="margin: 10px 0 0 0;">
            © ${new Date().getFullYear()} CRM System. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Approval notification email template
   */
  private getApprovalNotificationTemplate(user: EmailUser): string {
    const userName = user.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : 'User';
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Approved</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white; 
          border-radius: 12px; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #059669 0%, #10b981 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .success-box {
          background: #ecfdf5;
          border-left: 4px solid #10b981;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .status-badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          margin: 20px 0;
        }
        .footer { 
          background: #f8fafc; 
          padding: 30px; 
          text-align: center; 
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
        .logo {
          display: inline-block;
          margin-bottom: 10px;
        }
        .btn {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          font-size: 16px;
        }
        .btn:hover {
          background: #059669;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" rx="20" fill="white" fill-opacity="0.1"/>
              <circle cx="50" cy="50" r="30" fill="white" fill-opacity="0.2"/>
              <path d="M40 50l8 8 16-16" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1>Account Approved!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Welcome to CRM System</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1e293b; margin-bottom: 20px;">🎉 Great News!</h2>
          
          <p>Hello ${userName},</p>
          
          <div class="success-box">
            <p style="margin: 0; font-weight: 600; color: #1e293b;">
              Your CRM System account has been approved and is now active!
            </p>
          </div>
          
          <div style="text-align: center;">
            <span class="status-badge">✅ Account Approved</span>
          </div>
          
          <p>You can now log in to your account and start using all the features of our CRM System:</p>
          
          <ul style="color: #475569;">
            <li><strong>Contact Management:</strong> Organize and track all your customer interactions</li>
            <li><strong>Lead Tracking:</strong> Monitor prospects through your sales pipeline</li>
            <li><strong>Opportunity Management:</strong> Track deals and close more sales</li>
            <li><strong>Campaign Tools:</strong> Create and manage marketing campaigns</li>
            <li><strong>Analytics & Reports:</strong> Get insights into your business performance</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}/login" class="btn">Login to CRM System</a>
          </div>
          
          <p><strong>Your Account Details:</strong></p>
          <ul style="color: #475569;">
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Approval Date:</strong> ${new Date().toLocaleDateString()}</li>
            <li><strong>Status:</strong> Active</li>
          </ul>
          
          <p><strong>Getting Started Tips:</strong></p>
          <ol style="color: #475569;">
            <li>Complete your profile setup after logging in</li>
            <li>Import your existing contacts</li>
            <li>Explore the dashboard to familiarize yourself with the interface</li>
            <li>Set up your first campaign or add leads to get started</li>
          </ol>
          
          <p>If you need any assistance getting started, our support team is here to help!</p>
          
          <p style="margin-top: 30px;">
            Welcome aboard!<br>
            <strong>CRM System Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">
            This is an automated message. Please do not reply to this email.
          </p>
          <p style="margin: 10px 0 0 0;">
            © ${new Date().getFullYear()} CRM System. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Rejection notification email template
   */
  private getRejectionNotificationTemplate(user: EmailUser, reason?: string): string {
    const userName = user.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : 'User';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Update</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white; 
          border-radius: 12px; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .notice-box {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .footer { 
          background: #f8fafc; 
          padding: 30px; 
          text-align: center; 
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Registration Update</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">CRM System</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Registration Status Update</h2>
          
          <p>Hello ${userName},</p>
          
          <div class="notice-box">
            <p style="margin: 0; font-weight: 600; color: #1e293b;">
              We regret to inform you that your registration request could not be approved at this time.
            </p>
          </div>
          
          ${reason ? `
          <p><strong>Reason:</strong></p>
          <p style="color: #475569; font-style: italic;">${reason}</p>
          ` : ''}
          
          <p>If you believe this is an error or would like to reapply, please contact our support team for assistance.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>CRM System Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">
            This is an automated message. Please do not reply to this email.
          </p>
          <p style="margin: 10px 0 0 0;">
            © ${new Date().getFullYear()} CRM System. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private getPasswordResetTemplate(user: EmailUser & { resetLink: string }): string {
    const userName = user.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : 'User';
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f8fafc; color:#111827; }
        .container { max-width:600px; margin:20px auto; background:#fff; border-radius:10px; padding:30px; box-shadow:0 6px 18px rgba(2,6,23,0.08); }
        .btn { display:inline-block; background:#2563eb; color:#fff; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:600 }
      </style>
    </head>
    <body>
      <div class="container">
        <h2 style="margin-top:0;">Reset your password</h2>
        <p>Hello ${userName},</p>
        <p>We received a request to reset the password for your account. Click the button below to reset it. This link will expire in 1 hour.</p>
        <p style="text-align:center; margin:28px 0;"><a class="btn" href="${user.resetLink}">Reset my password</a></p>
        <p>If you didn't request this change, you can safely ignore this email. Your password will not be changed.</p>
        <p style="margin-top:20px;">If the button doesn't work, copy and paste the following link into your browser:</p>
        <p style="word-break:break-all;">${user.resetLink}</p>
        <hr />
        <p style="font-size:12px;color:#6b7280;">If you're having trouble, contact support at support@edgereachtech.com</p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Get password reset confirmation email template
   */
  private getPasswordResetConfirmationTemplate(user: EmailUser): string {
    const userName = user.firstName || 'there';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Successful</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 0; 
          background-color: #f8fafc; 
          color: #334155;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white; 
          border-radius: 12px; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .success-box {
          background: #ecfdf5;
          border-left: 4px solid #10b981;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .footer { 
          background: #f8fafc; 
          padding: 30px; 
          text-align: center; 
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
        .icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">✅</div>
          <h1>Password Reset Successful</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <div class="success-box">
            <h3 style="margin-top: 0; color: #047857;">Your password has been successfully reset!</h3>
            <p style="margin-bottom: 0;">You can now sign in to your CRM System account using your new password.</p>
          </div>
          <p>For your security, we recommend:</p>
          <ul style="padding-left: 20px;">
            <li>Using a strong, unique password</li>
            <li>Enabling two-factor authentication if available</li>
            <li>Not sharing your password with anyone</li>
          </ul>
          <p>If you did not reset your password, please contact our support team immediately.</p>
        </div>
        <div class="footer">
          <p>Need help? Contact us at support@edgereachtech.com</p>
          <p>&copy; 2025 EdgeReach Tech. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}

export default new EmailService();