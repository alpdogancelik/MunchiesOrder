import { MailService } from '@sendgrid/mail';

// Make SendGrid optional in development to avoid crashing when key is missing
const SENDGRID_ENABLED = !!process.env.SENDGRID_API_KEY;
const mailService = new MailService();
if (SENDGRID_ENABLED) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY as string);
} else {
  console.warn('[sendgrid] SENDGRID_API_KEY is not set. Emails will be skipped.');
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!SENDGRID_ENABLED) {
      console.info(`[sendgrid] Skipping email to ${params.to}: ${params.subject}`);
      return false;
    }
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text ?? '',
      html: params.html,
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendOrderConfirmationEmail(
  orderDetails: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    restaurantName: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    paymentMethod: string;
    deliveryAddress: string;
  }
): Promise<boolean> {
  const itemsHtml = orderDetails.items
    .map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₺${item.price.toFixed(2)}</td>
      </tr>
    `)
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f97316; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🍽️ Munchies</h1>
        <p style="margin: 5px 0 0 0;">Order Confirmation</p>
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Thank you for your order, ${orderDetails.customerName}!</h2>
        <p style="color: #666;">Your order has been confirmed and is being prepared.</p>
        
        <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #f97316;">Order Details</h3>
          <p><strong>Order Number:</strong> #${orderDetails.orderNumber}</p>
          <p><strong>Restaurant:</strong> ${orderDetails.restaurantName}</p>
          <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
          <p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress}</p>
        </div>
        
        <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #f97316;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr style="background-color: #f5f5f5; font-weight: bold;">
                <td colspan="2" style="padding: 12px; text-align: right; border-top: 2px solid #ddd;">Total:</td>
                <td style="padding: 12px; text-align: right; border-top: 2px solid #ddd;">₺${orderDetails.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #666;">Estimated delivery time: 15-30 minutes</p>
          <p style="color: #666;">You can track your order in the Munchies app.</p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          <p>This email was sent to alpdogan.celik1@gmail.com</p>
          <p>Munchies - Food Delivery for METU NCC Campus</p>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: 'alpdogan.celik1@gmail.com',
    from: 'orders@munchies.app',
    subject: `Order Confirmation #${orderDetails.orderNumber} - ${orderDetails.restaurantName}`,
    html,
    text: `Order Confirmation #${orderDetails.orderNumber}\n\nThank you ${orderDetails.customerName}! Your order from ${orderDetails.restaurantName} has been confirmed.\n\nTotal: ₺${orderDetails.total.toFixed(2)}\nPayment: ${orderDetails.paymentMethod}\nDelivery: ${orderDetails.deliveryAddress}\n\nEstimated delivery: 15-30 minutes`
  });
}