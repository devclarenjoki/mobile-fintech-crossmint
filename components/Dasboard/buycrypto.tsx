import { createOrder } from "@/api/create-order";
import { CrossmintEmbeddedCheckout, useAuth, useWallet } from "@crossmint/client-sdk-react-native-ui";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../themed-text";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BuyCrypto() {
    const { wallet } = useWallet();
    const { user } = useAuth();
    const { colors, dark } = useTheme();
    const router = useRouter();
    const [orderData, setOrderData] = useState<{ orderId: string; clientSecret: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (wallet?.address && user?.email) {
            createOrder(wallet.address, user.email, wallet.chain ?? "base-sepolia")
                .then((data) => {
                    if (data?.order?.orderId && data?.clientSecret) {
                        setOrderData({
                            orderId: data.order.orderId,
                            clientSecret: data.clientSecret,
                        });
                    } else {
                        setError("Invalid order data received");
                    }
                })
                .catch(err => {
                    console.error("Order creation failed", err);
                    setError("Failed to initialize checkout");
                });
        }
    }, [wallet, user]);

    // Consistent Header for all states
    const Header = (
        <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={28} color={colors.text} />
            </Pressable>
            <ThemedText style={styles.headerTitle}>Buy Crypto</ThemedText>
            <View style={{ width: 40 }} /> 
        </View>
    );

    // Error State
    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                {Header}
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
                    <ThemedText style={{ marginTop: 10 }}>{error}</ThemedText>
                    <Pressable style={styles.retryButton} onPress={() => router.replace('/buy')}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    // Loading State
    if (!orderData) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                {Header}
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#05b959" />
                    <ThemedText style={{ marginTop: 10 }}>Preparing your order...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {Header}
            
            <View style={styles.contentBody}>
                <View style={styles.checkoutWrapper}>
                    <CrossmintEmbeddedCheckout
                        orderId={orderData.orderId}
                        clientSecret={orderData.clientSecret}
                        payment={{
                            crypto: { enabled: false },
                            fiat: { enabled: true },
                        }}
                        // Injected style to ensure the internal component fills the container
                        // style={{ flex: 1 }} 
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    contentBody: {
        flex: 1, // Crucial: Takes up all remaining screen space
        // paddingHorizontal: 10,
        paddingBottom: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    checkoutWrapper: {
        flex: 1, // Crucial: Allows the WebView inside to expand
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
        borderRadius: 12,
        overflow: 'hidden', // Keeps the checkout edges clean
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#05b959',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    }
});