import { useCrossmintAuth, useWallet } from "@crossmint/client-sdk-react-native-ui";
import { Ionicons } from '@expo/vector-icons'; // Ensure expo icons are available
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BRAND_GREEN = "#05b959";

export default function DashboardScreen() {
    const { user, logout } = useCrossmintAuth();
    const { wallet } = useWallet();
    const { colors, dark } = useTheme();

    const walletActions = [
        { id: 'send', label: 'Send', icon: 'send-outline' },
        { id: 'receive', label: 'Receive', icon: 'qr-code-outline' },
        { id: 'buy', label: 'Buy Crypto', icon: 'card-outline' },
        { id: 'history', label: 'History', icon: 'list-outline' },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={styles.innerContainer}>
                {/* TOP BAR */}
                <View style={styles.topBar}>
                    <Text style={[styles.welcomeText, { color: colors.text }]}>Dashboard</Text>
                    <TouchableOpacity onPress={logout} style={styles.logoutPill}>
                        <Text style={{ color: '#ff4444', fontWeight: '600' }}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* WALLET CARD */}
                {wallet && (
                    <View style={[styles.balanceCard, { backgroundColor: BRAND_GREEN }]}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.balanceLabel}>Main Wallet</Text>
                            <Ionicons name="shield-checkmark" size={20} color="rgba(255,255,255,0.7)" />
                        </View>
                        <Text style={styles.addressDisplay} numberOfLines={1} ellipsizeMode="middle">
                            {wallet.address}
                        </Text>
                        <View style={styles.statusBadge}>
                            <View style={styles.activeDot} />
                            <Text style={styles.statusText}>Active</Text>
                        </View>
                    </View>
                )}

                {/* QUICK ACTIONS GRID */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                </View>
                <View style={styles.actionsGrid}>
                    {walletActions.map((action) => (
                        <TouchableOpacity 
                            key={action.id} 
                            style={[styles.actionItem, { backgroundColor: dark ? '#1c1c1e' : '#fff', borderColor: colors.border }]}
                            onPress={() => console.log(`${action.id} pressed`)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: BRAND_GREEN + '15' }]}>
                                <Ionicons name={action.icon as any} size={24} color={BRAND_GREEN} />
                            </View>
                            <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* USER IDENTITY CARD */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Details</Text>
                </View>
                <View style={[styles.infoCard, { backgroundColor: dark ? '#1c1c1e' : '#fff', borderColor: colors.border }]}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                        <Text style={[styles.value, { color: colors.text }]}>{user?.email}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: colors.text }]}>User ID</Text>
                        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>{user?.id}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    innerContainer: { padding: 20 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    welcomeText: { fontSize: 26, fontWeight: 'bold', letterSpacing: -0.5 },
    logoutPill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#ff444415' },
    
    // Wallet Card Styles
    balanceCard: { padding: 24, borderRadius: 24, marginBottom: 30, shadowColor: BRAND_GREEN, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
    addressDisplay: { color: '#fff', fontSize: 18, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginBottom: 20 },
    statusBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginRight: 6 },
    statusText: { color: '#fff', fontSize: 12, fontWeight: '700' },

    // Section Styles
    sectionHeader: { marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: '700', opacity: 0.8 },
    
    // Grid Styles
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
    actionItem: { width: '48%', padding: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center', marginBottom: 15 },
    iconContainer: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    actionLabel: { fontSize: 14, fontWeight: '600' },

    // Info Card Styles
    infoCard: { padding: 20, borderRadius: 20, borderWidth: 1 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    label: { fontSize: 14, opacity: 0.5, fontWeight: '500' },
    value: { fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right', marginLeft: 15 },
    divider: { height: 1, width: '100%', marginVertical: 12, opacity: 0.5 }
});