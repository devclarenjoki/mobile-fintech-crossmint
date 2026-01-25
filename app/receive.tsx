import { ReceiveComponent } from "@/components/Dasboard/receive";
import Header from "@/components/ui/header";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router"; // Import this
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReceiveLayout() {
    const { colors } = useTheme();
    const router = useRouter();
    
    // Use this hook to get the address passed from the Dashboard
    const { address } = useLocalSearchParams<{ address: string }>();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
           <Header
                title="Receive USDC"
                colors={colors}
            />

            <ReceiveComponent address={address} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 16, 
        paddingVertical: 12 
    },
    backButton: { padding: 4 },
    title: { fontSize: 20, fontWeight: 'bold' }
});