import { createOrder } from "@/api/create-order";
import { CrossmintEmbeddedCheckout, useAuth, useWallet } from "@crossmint/client-sdk-react-native-ui";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from "../themed-text";
import Header from "../ui/header";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BuyCrypto() {
    const { wallet } = useWallet();
    const { user } = useAuth();
    const { colors, dark } = useTheme();
    const router = useRouter();

    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [orderData, setOrderData] = useState<{ orderId: string; clientSecret: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCreateOrder = async () => {
        if (!wallet?.address || !user?.email) {
            return Alert.alert("Error", "Wallet or User data is missing.");
        }

        const numericAmount = parseFloat(amount);
        if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid USD amount.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // NOTE: Passing the user-entered amount to the API
            const data = await createOrder(
                wallet.address, 
                user.email, 
                wallet.chain ?? "base-sepolia", 
                amount // Pass as a number to be safe
            );

            // --- DEBUGGING START ---
            console.log("API Response Received:", data); 
            // --- DEBUGGING END ---

            // Check for different possible response structures
            const orderId = data?.order?.orderId || data?.orderId; 
            const clientSecret = data?.clientSecret;

            if (orderId && clientSecret) {
                setOrderData({
                    orderId,
                    clientSecret,
                });
            } else {
                // If we get here, the data is likely an error message, not an Order object
                console.error("Invalid Data Structure:", data);
                Alert.alert("API Error", "The server did not return a valid Order ID. Check the console logs.");
                setError("Failed to initialize checkout.");
            }
        } catch (err) {
            console.error("Order creation failed", err);
            setError("Failed to create order. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (orderData) {
            setOrderData(null);
            setError(null);
        } else {
            router.back();
        }
    };

    if (!orderData) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Header
                    title="Buy Crypto"
                    colors={colors}
                    onBack={handleBack} 
                />
                <View style={styles.contentBody}>
                    <View style={styles.formContainer}>
                        <ThemedText style={[styles.instruction, { color: colors.text }]}>
                            Enter the amount you wish to purchase.
                        </ThemedText>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
                            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
                                <TextInput
                                    style={[styles.amountInput, { color: colors.text }]}
                                    placeholder="0.00"
                                    placeholderTextColor="#555"
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="decimal-pad"
                                    selectTextOnFocus
                                />
                            </View>
                        </View>

                        <ThemedText style={[styles.disclaimer, { color: colors.text }]}>
                            By proceeding, you will be redirected to secure payment options.
                        </ThemedText>

                        <Pressable 
                            style={[styles.buyButton, (isLoading || !amount) && styles.buttonDisabled]} 
                            onPress={handleCreateOrder}
                            disabled={isLoading || !amount}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Proceed to Payment</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header
                title="Checkout"
                colors={colors}
                onBack={handleBack}
            />
            
            <View style={styles.contentBody}>
                {error ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
                        <ThemedText style={{ marginTop: 10 }}>{error}</ThemedText>
                        <Pressable style={styles.retryButton} onPress={() => router.replace('/buy')}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Start Over</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.checkoutWrapper}>
                        <CrossmintEmbeddedCheckout
                            orderId={orderData.orderId}
                            clientSecret={orderData.clientSecret}
                            payment={{
                                crypto: { enabled: false },
                                fiat: { enabled: true },
                            }}
                        />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentBody: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    instruction: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        opacity: 0.8,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
        opacity: 0.6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderWidth: 1,
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: 'bold',
        marginRight: 10,
        opacity: 0.7,
    },
    amountInput: {
        flex: 1,
        fontSize: 32,
        fontWeight: 'bold',
        padding: 0,
        color: '#fff',
    },
    disclaimer: {
        fontSize: 12,
        textAlign: 'center',
        opacity: 0.5,
        marginBottom: 40,
    },
    buyButton: {
        width: '100%',
        backgroundColor: '#05b959',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#05b959',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    checkoutWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#1c1c1e',
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#05b959',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    }
});