import { SendComponent } from '@/components/Dasboard/send/send';
import Header from '@/components/ui/header';
import { useWallet } from "@crossmint/client-sdk-react-native-ui";
import { useTheme } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SendScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { usdcBalance } = useLocalSearchParams<{ usdcBalance: string }>();

    // It's often safer to call the hook again to get the wallet object 
    // rather than passing the whole complex object through route params.
    const { wallet } = useWallet();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header
                title="Send USDC"
                colors={colors}
            />
            <View style={{ flex: 1 }}>
                {wallet ? (
                    <SendComponent wallet={wallet} usdcBalance={usdcBalance ?? "0"} />
                ) : (
                    <View style={styles.centered}><Text>Loading Wallet...</Text></View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    backButton: { padding: 4 },
    title: { fontSize: 20, fontWeight: 'bold' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});