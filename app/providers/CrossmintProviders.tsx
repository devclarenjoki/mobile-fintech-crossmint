import {
    CrossmintAuthProvider,
    CrossmintProvider,
    CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-native-ui";

  const apiUrl: any = process.env.EXPO_PUBLIC_API_URL;


type ProvidersProps = {
    children: React.ReactNode;
};

export default function CrossmintProviders({ children }: ProvidersProps) {

    return (
        <CrossmintProvider apiKey={apiUrl && apiUrl}>
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
