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

export async function sendOrderReceipt(orderData: any): Promise<boolean> {
  const receiptHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ff6b35; margin: 0; font-size: 32px;">🍽️ Munchies</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Your Campus Food Delivery</p>
        </div>
        
        <div style="border-left: 4px solid #ff6b35; padding-left: 20px; margin-bottom: 30px;">
          <h2 style="color: #333; margin: 0 0 10px 0;">Order Confirmation</h2>
          <p style="color: #666; margin: 0;">Order #${orderData.id}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Order Details</h3>
          <div style="color: #666;">
            <p><strong>Payment Method:</strong> ${orderData.paymentMethod === 'cash' ? 'Cash on Delivery' : orderData.paymentMethod === 'card_at_door' ? 'Credit Card at Door' : 'Online Payment'}</p>
            <p><strong>Total Amount:</strong> $${orderData.total}</p>
            <p><strong>Order Status:</strong> ${orderData.status}</p>
            <p><strong>Placed At:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px;">Thank you for choosing Munchies!</p>
          <p style="color: #999; font-size: 14px;">METU NCC Campus Food Delivery Service</p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: "alpdogan.celik1@gmail.com",
    from: "noreply@munchies.app", // Use your verified sender
    subject: `Munchies Order Confirmation #${orderData.id}`,
    html: receiptHtml,
    text: `Order #${orderData.id} confirmed. Payment: ${orderData.paymentMethod}. Total: $${orderData.total}`
  });
}