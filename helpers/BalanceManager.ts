export class WalletService {
    static async getBalance(address: string, signal?: AbortSignal): Promise<string> {
        // Mocking a blockchain fetch. Replace with your provider call (e.g., ethers, web3, or Crossmint API)
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                if (signal?.aborted) {
                    return reject(new Error("Aborted"));
                }
                // Simulate random balance for demo
                const mockBalance = (Math.random() * 10).toFixed(4);
                resolve(mockBalance);
            }, 1000);

            signal?.addEventListener("abort", () => {
                clearTimeout(timeout);
                reject(new Error("Aborted"));
            });
        });
    }
}