const USDC_ADDRESSES: Record<string, string> = {
    "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "polygon-amoy": "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582",
    "solana": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
};

// FIX 1: Add 'amount: string' to the function arguments
export const createOrder = async (
    walletAddress: string, 
    email: string, 
    chain: string, 
    amount: string // Accept the amount from the user
) => {
    const usdcAddress = USDC_ADDRESSES[chain];
    const tokenLocator = `${chain}:${usdcAddress}`;

    // Ensure amount is valid (basic check)
    const cleanAmount = parseFloat(amount).toFixed(2);

    const response = await fetch("https://staging.crossmint.com/api/2022-06-09/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": process.env.EXPO_PUBLIC_API_SERVER_KEY!,
        },
        body: JSON.stringify({
            lineItems: [{
                tokenLocator,
                executionParameters: {
                    mode: "exact-in",
                    // FIX 2: Use the dynamic 'cleanAmount' instead of hardcoded "10"
                    amount: cleanAmount, 
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

    // Optional: Check if the HTTP response was successful before returning JSON
    if (!response.ok) {
        const errorData = await response.json();
        console.error("Crossmint API Error:", errorData);
        throw new Error(errorData.message || `Order creation failed with status ${response.status}`);
    }

    return response.json(); 
};