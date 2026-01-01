import { ReceiveComponent } from "@/components/Dasboard/ReceiveComponent";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router"; // Import this
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReceiveLayout() {
    const { colors } = useTheme();
    const router = useRouter();
    
    // Use this hook to get the address passed from the Dashboard
    const { address } = useLocalSearchParams<{ address: string }>();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Added a Header so users can actually go back */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </Pressable>
                <Text style={[styles.title, { color: colors.text }]}>Receive</Text>
                <View style={{ width: 40 }} /> 
            </View>

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