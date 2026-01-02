// api/create-order.ts
const USDC_ADDRESSES: Record<string, string> = {
    "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "polygon-amoy": "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582",
    "solana": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
};

export const createOrder = async (walletAddress: string, email: string, chain: string) => {
    const usdcAddress = USDC_ADDRESSES[chain];
    const tokenLocator = `${chain}:${usdcAddress}`;

    const response = await fetch("https://staging.crossmint.com/api/2022-06-09/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": process.env.EXPO_PUBLIC_API_SERVER_URL!, // Server-side key
        },
        body: JSON.stringify({
            lineItems: [{
                tokenLocator,
                executionParameters: {
                    mode: "exact-in",
                    amount: "10",
                    maxSlippageBps: "500",
                },
            }],
            payment: {
                method: "stripe-payment-element",
                currency: "usd",
                receiptEmail: email,
            },
            recipient: { walletAddress },
        }),
    });

    return response.json(); // Returns { orderId, clientSecret, order }
};