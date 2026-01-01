const NEXT_SERVER_CROSSMINT_API_KEY = process.env.EXPO_PUBLIC_API_CLIENT_URL || '';
export interface CreateOrderRequest {
  payment: {
    method: string;
    currency: string;
    receiptEmail: string;
    payerAddress: string;
  };
  lineItems: {
    collectionLocator: string;
    callData: {
      totalPrice: string;
    };
  };
  recipient: {
    email: string;
    physicalAddress?: {
      name: string;
      line1: string;
      city: string;
      postalCode: string;
      country: string;
      line2?: string;
      state?: string;
    };
  };
  locale: string;
}

export interface UpdateOrderRequest {
  recipient: {
    email: string;
    physicalAddress: {
      name: string;
      line1: string;
      city: string;
      postalCode: string;
      country: string;
      line2: string;
      state: string;
    };
  };
  locale: string;
  payment: {
    method: string;
    currency: string;
    receiptEmail: string;
    payerAddress: string;
  };
}

export interface OrderResponse {
  order: {
    orderId: string;
    status: string;
  };
}

// Debug function to log the actual request being sent
const debugRequest = async (url: string, options: any) => {
  console.log('=== REQUEST DEBUG ===');
  console.log('URL:', url);
  console.log('Method:', options.method);
  console.log('Headers:', JSON.stringify(options.headers, null, 2));
  console.log('Body:', options.body);
  console.log('Body length:', options.body?.length || 0);
  
  try {
    const parsedBody = JSON.parse(options.body);
    console.log('Parsed body:', JSON.stringify(parsedBody, null, 2));
  } catch (e) {
    console.log('Body is not valid JSON');
  }
  console.log('=== END DEBUG ===');
};

export const createOrder = async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
  try {
    const url = 'https://staging.crossmint.com/api/2022-06-09/orders';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': NEXT_SERVER_CROSSMINT_API_KEY,
        'Accept': 'application/json',
      },
      body: JSON.stringify(orderData),
    };

    await debugRequest(url, options);
    
    const response = await fetch(url, options);

    console.log('=== RESPONSE DEBUG ===');
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response ok:', response.ok);
    console.log('Response type:', response.type);
    console.log('Response url:', response.url);
    console.log('=== END RESPONSE DEBUG ===');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create order error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Create order response:', data);
    return data;
  } catch (error: any) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrder = async (orderId: string, orderData: UpdateOrderRequest): Promise<OrderResponse> => {
  try {
    const url = `https://staging.crossmint.com/api/2022-06-09/orders/${orderId}`;
    const options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': NEXT_SERVER_CROSSMINT_API_KEY,
        'Accept': 'application/json',
      },
      body: JSON.stringify(orderData),
    };

    await debugRequest(url, options);
    
    const response = await fetch(url, options);

    console.log('=== RESPONSE DEBUG ===');
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response ok:', response.ok);
    console.log('Response type:', response.type);
    console.log('Response url:', response.url);
    console.log('=== END RESPONSE DEBUG ===');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update order error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Update order response:', data);
    return data;
  } catch (error: any) {
    console.error('Error updating order:', error);
    throw error;
  }
};