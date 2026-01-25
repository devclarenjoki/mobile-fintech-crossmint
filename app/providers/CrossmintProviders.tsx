import {
    CrossmintAuthProvider,
    CrossmintProvider,
    CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-native-ui";

type ProvidersProps = {
    children: React.ReactNode;
};

// 1. Type it as a string
const apiKey = process.env.EXPO_PUBLIC_API_CLIENT_KEY as string;

export default function CrossmintProviders({ children }: ProvidersProps) {
    // 2. Add a simple guard clause for development sanity
    if (!apiKey) {
        console.error("Crossmint Error: EXPO_PUBLIC_API_KEY is not defined in your environment variables.");
    }

    return (
        <CrossmintProvider apiKey={apiKey}>
            <CrossmintAuthProvider>
                <CrossmintWalletProvider
                    createOnLogin={{
                        chain: "base-sepolia",
                        signer: {
                            type: "email",
                        }
                    }}
                >
                    {children}
                </CrossmintWalletProvider>
            </CrossmintAuthProvider>
        </CrossmintProvider>
    );
}
