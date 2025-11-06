// Placeholder for Iyzico integration on mobile.
// Likely implemented via WebView-based checkout. See client/lib/iyzico.ts for reference.

export type PaymentInit = {
    price: number;
    currency?: 'TRY' | 'USD' | 'EUR';
};

export async function initPayment(_opts: PaymentInit): Promise<{ checkoutUrl: string }> {
    // TODO: Call backend to create a payment and return a URL to open in WebView
    return { checkoutUrl: 'https://example.com/checkout' };
}
