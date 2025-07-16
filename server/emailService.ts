import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendInvitationEmail(
  email: string, 
  firstName: string | null, 
  lastName: string | null, 
  token: string,
  baseUrl: string
): Promise<boolean> {
  const invitationUrl = `${baseUrl}/accept-invitation?token=${token}`;
  const recipientName = firstName && lastName ? `${firstName} ${lastName}` : firstName || email;
  
  const subject = "You're invited to join Wildflower Schools Network";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Wildflower Schools Network Invitation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: #2d5a27; margin-bottom: 30px;">Welcome to Wildflower Schools Network!</h1>
        
        <p style="font-size: 18px; margin-bottom: 25px;">
          Hi ${recipientName},
        </p>
        
        <p style="margin-bottom: 25px;">
          You've been invited to join the Wildflower Schools Network platform. This comprehensive system helps manage school operations, family enrollment, and community communications across our network of Montessori schools.
        </p>
        
        <div style="margin: 30px 0;">
          <a href="${invitationUrl}" style="background-color: #2d5a27; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          This invitation link will expire in 7 days. If you have any questions, please contact your school administrator.
        </p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #888;">
          <p>Wildflower Schools Network<br>
          Supporting teacher-led Montessori education</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Hi ${recipientName},

    You've been invited to join the Wildflower Schools Network platform.

    Click here to accept your invitation: ${invitationUrl}

    This invitation link will expire in 7 days. If you have any questions, please contact your school administrator.

    Wildflower Schools Network
    Supporting teacher-led Montessori education
  `;

  return await sendEmail({
    to: email,
    from: 'noreply@wildflowerschools.org', // Use a verified sender domain
    subject,
    text,
    html
  });
}