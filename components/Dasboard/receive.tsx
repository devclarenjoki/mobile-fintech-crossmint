import React from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import QRCodeStyled from 'react-native-qrcode-styled';

export const ReceiveComponent = ({ address }: { address: string | string[] | undefined }) => {
    // Ensure we have a string for the Share API
    const displayAddress = Array.isArray(address) ? address[0] : address || "No address found";

    const onShare = async () => {
        if (!displayAddress) return;
        await Share.share({ message: displayAddress });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Wallet Address</Text>
            <View style={styles.qrPlaceholder}>
              <QRCodeStyled
              data={address}
              style={{ backgroundColor: 'white', borderRadius:20 }}
              padding={20}
            />
            </View>
            {/* <View style={styles.qrPlaceholder}>
                <Text style={{color: '#666'}}>QR Code Ready</Text>
            </View> */}
            <View style={styles.addressBox}>
                <Text style={styles.addressText}>{address}</Text>
            </View>
            <Pressable style={styles.copyButton} onPress={onShare}>
                <Text style={styles.copyButtonText}>Share Address</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
    qrPlaceholder: { width: 200, height: 200, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderRadius: 20 },
    addressBox: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, width: '100%' },
    addressText: { textAlign: 'center', fontSize: 12, fontFamily: 'monospace' },
    copyButton: { marginTop: 20, padding: 10 },
    copyButtonText: { color: '#05b959', fontWeight: '600' }
});