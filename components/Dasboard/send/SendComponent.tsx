import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export const SendComponent = ({ wallet, usdcBalance }: { wallet: any, usdcBalance: string }) => {
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [recipientAddress, setRecipientAddress] = useState("");
    const [sendAmount, setSendAmount] = useState("");

    useFocusEffect(
        useCallback(() => {
            setRecipientAddress("");
            setSendAmount("");
        }, [])
    );



    const handleSend = async () => {
        if (!address || !amount) return Alert.alert("Error", "Please fill all fields");
        try {
            // Logic for Crossmint wallet transfer
            // const tx = await wallet.transfer(...)
            Alert.alert("Success", `Sent ${amount} USDC to ${address.slice(0, 6)}...`);
        } catch (e: any) {
            Alert.alert("Transfer Failed", e.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Send USDC</Text>
            <Text style={styles.balance}>Available: {usdcBalance} USDC</Text>
            <TextInput
                placeholder="Recipient Address"
                style={styles.input}
                onChangeText={setAddress}
                placeholderTextColor="#999"
            />
            <TextInput
                placeholder="Amount"
                keyboardType="numeric"
                style={styles.input}
                onChangeText={setAmount}
                placeholderTextColor="#999"
            />
            <Pressable style={styles.button} onPress={handleSend}>
                <Text style={styles.buttonText}>Confirm Send</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, borderRadius: 15},
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    balance: { marginBottom: 20, color: '#666' },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
    button: { backgroundColor: '#05b959', padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold' }
});