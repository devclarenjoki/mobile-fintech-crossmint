import { useWalletEmailSigner } from "@crossmint/client-sdk-react-native-ui";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export const SendComponent = ({ wallet, usdcBalance }: { wallet: any, usdcBalance: string }) => {
    const [recipientAddress, setRecipientAddress] = useState("");
    const [sendAmount, setSendAmount] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [otpError, setOtpError] = useState<string | null>(null);

    const [ready, setReady] = useState(false);

    const { needsAuth, sendEmailWithOtp, verifyOtp } = useWalletEmailSigner();

    useEffect(() => {
        if (wallet && typeof wallet.send === 'function') {
            setReady(true);
        } else {
            setReady(false);
        }
    }, [wallet]);

    useFocusEffect(
        useCallback(() => {
            setIsSending(false);
            setIsVerifying(false);
            setIsModalVisible(false);
            setOtpError(null);
            setOtpCode("");
            setSendAmount("");
            setRecipientAddress("");
        }, [])
    );

    const executeTransaction = async () => {
        try {
            console.log("Executing transaction...");
            const result = await wallet.send(recipientAddress, 'usdc', sendAmount);
            Alert.alert("Success", `Sent ${sendAmount} USDC`);
            setRecipientAddress("");
            setSendAmount("");
            setIsModalVisible(false);
        } catch (e: any) {
            console.error("TX Error:", e);
            Alert.alert("Transfer Failed", e.message || "Something went wrong");
        }
    };

    const handleSend = async () => {
        if (!recipientAddress || !sendAmount) {
            return Alert.alert("Error", "Please fill all fields");
        }

        const numericAmount = parseFloat(sendAmount);
        const numericBalance = parseFloat(usdcBalance);

        if (numericAmount > numericBalance) {
            return Alert.alert("Error", "Insufficient balance");
        }

        setIsSending(true);
        try {
            if (needsAuth === true) {
                await sendEmailWithOtp();
                setIsModalVisible(true);
            } else {
                await executeTransaction();
            }
        } catch (error: any) {
            console.error("Send Logic Error:", error);
            Alert.alert("Error", error.message || "Failed to initiate transfer");
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otpCode.length < 6) return;
        setIsVerifying(true);
        setOtpError(null);
        try {
            await verifyOtp(otpCode);
            await executeTransaction();
        } catch (error: any) {
            setOtpError(error.message || "Invalid OTP");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleMaxPress = () => {
        setSendAmount(usdcBalance);
    };

    if (!ready) {
        return (
            <View style={styles.loaderContainer}>
                 <ActivityIndicator size="large" color="#05b959" />
                 <Text style={{ marginTop: 10, color: '#aaa' }}>Initializing Wallet...</Text>
            </View>
        );
    }

    // Calculate validation states
    const numericAmount = parseFloat(sendAmount);
    const numericBalance = parseFloat(usdcBalance);
    const isOverBalance = sendAmount.length > 0 && !isNaN(numericAmount) && numericAmount > numericBalance;

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                <Text style={styles.title}>Send USDC</Text>
                
                {/* RECIPIENT SECTION */}
                <Text style={styles.sectionLabel}>To</Text>
                <TextInput
                    placeholder="Wallet Address"
                    placeholderTextColor="#555"
                    style={styles.recipientInput}
                    value={recipientAddress}
                    onChangeText={setRecipientAddress}
                    autoCapitalize="none"
                    editable={!isSending}
                />

                {/* AMOUNT SECTION (Bank App Style) */}
                <View style={styles.amountSection}>
                    <Text style={styles.sectionLabel}>Amount</Text>
                    
                    <View style={[
                        styles.bankInputContainer,
                        isOverBalance && styles.inputErrorBorder // Red border if error
                    ]}>
                        <Text style={[styles.currencyLabel, isOverBalance && styles.errorText]}>USDC</Text>
                        <TextInput
                            placeholder="0.00"
                            placeholderTextColor="#444"
                            style={[
                                styles.bankAmountInput, 
                                isOverBalance && styles.errorText // Red text if error
                            ]}
                            value={sendAmount}
                            onChangeText={setSendAmount}
                            keyboardType="decimal-pad"
                            editable={!isSending}
                            selectTextOnFocus
                        />
                        <Pressable onPress={handleMaxPress} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                            <Text style={styles.maxButton}>MAX</Text>
                        </Pressable>
                    </View>

                    <View style={styles.balanceRow}>
                        <Text style={styles.balanceText}>Available: <Text style={styles.balanceValue}>{usdcBalance}</Text></Text>
                    </View>

                    {/* ERROR MESSAGE */}
                    {isOverBalance && (
                        <Text style={styles.errorMessage}>Insufficient balance</Text>
                    )}
                </View>
                
                {/* SEND BUTTON */}
                <Pressable 
                    style={[styles.button, isSending && styles.buttonDisabled, isOverBalance && styles.buttonDisabled]} 
                    onPress={handleSend}
                    disabled={isSending || isOverBalance}
                >
                    {isSending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Review Transaction</Text>}
                </Pressable>
            </View>

            {/* MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => !isVerifying && setIsModalVisible(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <Pressable 
                        style={styles.backdrop} 
                        onPress={() => !isVerifying && setIsModalVisible(false)} 
                    />
                    <View style={styles.modalContent}>
                        <View style={styles.dragIndicator} />
                        <Text style={styles.modalTitle}>Verify Email</Text>
                        <Text style={styles.modalSubtitle}>Enter the code sent to your email to confirm the transfer of {sendAmount} USDC.</Text>
                        
                        <TextInput
                            style={[styles.otpInput, otpError && styles.otpInputError]}
                            placeholder="000 000"
                            keyboardType="number-pad"
                            maxLength={9}
                            value={otpCode}
                            onChangeText={setOtpCode}
                            autoFocus={true}
                        />
                        {otpError && <Text style={styles.errorText}>{otpError}</Text>}
                        
                        <View style={styles.modalButtons}>
                            <Pressable 
                                style={styles.modalButton} 
                                onPress={() => setIsModalVisible(false)}
                                disabled={isVerifying}
                            >
                                <Text style={{color: '#333', fontWeight: '600'}}>Cancel</Text>
                            </Pressable>
                            <Pressable 
                                style={[styles.modalButton, styles.verifyButton]} 
                                onPress={handleVerifyOtp}
                                disabled={isVerifying || otpCode.length < 1}
                            >
                                {isVerifying ? <ActivityIndicator color="#fff" /> : <Text style={{color: '#fff', fontWeight: 'bold'}}>Verify</Text>}
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { width: '100%', flex: 1 },
    container: { 
        padding: 24, 
        backgroundColor: '#000000', 
        borderRadius: 24, 
        flex: 1 
    },
    loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: '800', marginBottom: 30, color: '#ffffff' },
    
    // --- Section Label ---
    sectionLabel: {
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },

    // --- Recipient Input ---
    recipientInput: {
        backgroundColor: '#1c1c1e',
        color: '#ffffff',
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#333333',
    },

    // --- Bank App Amount Section ---
    amountSection: {
        marginBottom: 40,
    },
    bankInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 8,
        marginBottom: 10,
    },
    inputErrorBorder: {
        borderBottomColor: '#ff4444', // Red border on error
    },
    currencyLabel: {
        fontSize: 24,
        color: '#fff',
        fontWeight: '600',
        marginRight: 10,
        opacity: 0.8,
    },
    bankAmountInput: {
        flex: 1,
        fontSize: 42,
        fontWeight: 'bold',
        color: '#fff',
        padding: 0,
        margin: 0,
        height: 50,
        letterSpacing: -1,
    },
    maxButton: {
        color: '#05b959',
        fontWeight: 'bold',
        fontSize: 14,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#05b95915',
        borderRadius: 6,
        overflow: 'hidden',
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    balanceText: {
        fontSize: 14,
        color: '#888',
    },
    balanceValue: {
        color: '#fff',
        fontWeight: '600',
    },
    
    // --- Validation Styles ---
    errorMessage: {
        color: '#ff4444',
        fontSize: 13,
        marginTop: 5,
        fontWeight: '600',
        textAlign: 'right',
    },
    errorText: {
        color: '#ff4444',
    },

    // --- Submit Button ---
    button: { 
        backgroundColor: '#05b959', 
        padding: 18, 
        borderRadius: 16, 
        alignItems: 'center',
        shadowColor: '#05b959',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: { 
        opacity: 0.5, 
        shadowOpacity: 0,
        backgroundColor: '#1c1c1e', // Darken button when disabled
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },

    // --- Modal Styles ---
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: { 
        backgroundColor: '#1c1c1e', 
        borderTopLeftRadius: 32, 
        borderTopRightRadius: 32, 
        padding: 30, 
        alignItems: 'center', 
        width: '100%' 
    },
    dragIndicator: { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 25, lineHeight: 20 },
    otpInput: { 
        width: '100%', 
        padding: 16, 
        borderRadius: 16, 
        borderWidth: 1, 
        borderColor: '#333', 
        fontSize: 24, 
        textAlign: 'center', 
        letterSpacing: 4,
        color: '#fff',
        backgroundColor: '#000',
    },
    otpInputError: { borderColor: '#ff4444' },
    // errorText: { color: '#ff4444', marginTop: 10, fontSize: 13 },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 25, width: '100%' },
    modalButton: { 
        flex: 1, 
        padding: 16, 
        borderRadius: 16, 
        alignItems: 'center', 
        backgroundColor: '#2c2c2e',
    },
    verifyButton: { backgroundColor: '#05b959' },
});