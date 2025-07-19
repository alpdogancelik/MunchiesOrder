export interface IyzicoPaymentRequest {
  orderId: number;
  orderData: {
    total: string;
    address: string;
    items: Array<{
      name: string;
      price: string;
      quantity: number;
    }>;
  };
}

export interface IyzicoPaymentResponse {
  success: boolean;
  paymentPageUrl?: string;
  token?: string;
  message?: string;
}

export interface IyzicoCallbackData {
  token: string;
  orderId?: number;
  success: boolean;
}

export const initiateIyzicoPayment = async (
  request: IyzicoPaymentRequest
): Promise<IyzicoPaymentResponse> => {
  try {
    const response = await fetch('/api/payment/iyzico/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error initiating iyzico payment:', error);
    throw error;
  }
};

export const verifyIyzicoPayment = async (
  token: string
): Promise<{ success: boolean; orderId?: number }> => {
  try {
    const response = await fetch('/api/payment/iyzico/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying iyzico payment:', error);
    throw error;
  }
};

export const formatCurrencyTRY = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₺${numAmount.toFixed(2)}`;
};

export const calculateOrderTotal = (
  subtotal: number,
  deliveryFee: number,
  serviceFee: number = 2
): number => {
  return subtotal + deliveryFee + serviceFee;
};
