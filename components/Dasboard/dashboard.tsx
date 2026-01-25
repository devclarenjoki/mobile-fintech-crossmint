import { useCrossmintAuth, useWallet } from "@crossmint/client-sdk-react-native-ui";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "@react-navigation/native";
import * as Clipboard from 'expo-clipboard';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BRAND_GREEN = "#05b959";

export default function DashboardScreen() {
    const { user, logout, status: authStatus } = useCrossmintAuth();
    
    // FIX 1: Safe Destructuring (Prevents "Cannot convert null value to object")
    const walletHook = useWallet();
    const wallet = walletHook?.wallet;
    const walletStatus = walletHook?.status || "not-loaded";

    const { colors, dark } = useTheme();
    const router = useRouter();

    // State
    const [usdcBalance, setUsdcBalance] = useState<string>("0.00");
    const [isLoadingBalance, setIsLoadingBalance] = useState(true);
    const [isFunding, setIsFunding] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // FIX 2: Ref to prevent race condition (stack race)
    const isFetchingBalance = useRef(false);

    const walletActions = [
        { id: 'send', label: 'Send', icon: 'send-outline' as const, route: '/send' },
        { id: 'receive', label: 'Receive', icon: 'qr-code-outline' as const, route: '/receive' },
        { id: 'history', label: 'History', icon: 'list-outline' as const, route: '/history' },
        { id: 'buy', label: 'Buy Crypto', icon: 'card-outline' as const, route: '/buy' },
    ];

    // --- Helper to extract balance safely ---
    const getBalanceFromResponse = (balances: any) => {
        const usdc = balances?.usdc;
        if (usdc) {
            return typeof usdc === 'string' ? usdc : (usdc.totalBalance || usdc.amount || "0.00");
        }
        return "0.00";
    };

    // --- Reusable function to fetch and update balance ---
    const refreshBalance = useCallback(async () => {
        if (!wallet) return;
        
        // Guard: Stop stack race
        if (isFetchingBalance.current) return;

        isFetchingBalance.current = true;
        try {
            const balances = await wallet.balances(["usdc"]) as any;
            console.log("Fetched balances:", balances);
            setUsdcBalance(getBalanceFromResponse(balances));
        } catch (err) {
            console.error("Error fetching USDC balance:", err);
        } finally {
            isFetchingBalance.current = false;
            setIsLoadingBalance(false);
        }
    }, [wallet]);

    // 2. Fetch Balance on component mount or wallet change
    useEffect(() => {
        if (wallet) {
            refreshBalance();
        }
    }, [wallet, refreshBalance]);

    // --- Handler to Copy Address ---
    const handleCopyAddress = async () => {
        if (!wallet?.address) return;
        await Clipboard.setStringAsync(wallet.address);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // --- Handler for Staging Fund ---
    const handleStagingFund = async () => {
        if (!wallet) return;
        setIsFunding(true);
        try {
            const newBalances = await (wallet as any).stagingFund(10);
            console.log("Wallet funded! New balances:", newBalances);

            if (newBalances) {
                const value = getBalanceFromResponse(newBalances);
                setUsdcBalance(value);
            } else {
                await refreshBalance();
            }
        } catch (error) {
            console.error("Failed to fund staging wallet:", error);
        } finally {
            setIsFunding(false);
        }
    };

    // --- Handler for Withdraw Button ---
    const handleWithdraw = () => {
        router.push('/send');
    };

    // Loading State
    if (authStatus === "initializing" || walletStatus === "in-progress" || walletStatus === "not-loaded") {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={BRAND_GREEN} />
                <Text style={{ color: colors.text, marginTop: 15, fontWeight: '500' }}>
                    Securing your wallet...
                </Text>
            </View>
        );
    }

    // Logged Out State
    if (authStatus === "logged-out" || !user || !wallet) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Session expired. Please login again.</Text>
                <Pressable onPress={logout} style={[styles.logoutPill, { marginTop: 20 }]}>
                    <Text style={{ color: '#ff4444' }}>Return to Login</Text>
                </Pressable>
            </View>
        );
    }

    const handleNavigation = (action: typeof walletActions[0]) => {
        if (action.id === 'send') {
            router.navigate({
                pathname: '/send',
                params: { usdcBalance: usdcBalance }
            });
        } else if (action.id === 'receive') {
            router.navigate({
                pathname: '/receive',
                params: { address: wallet.address }
            });
        } else {
            router.navigate(action.route as any);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1}}>
            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                {/* TOP BAR */}
                <View style={styles.topBar}>
                    <Text style={[styles.welcomeText, { color: colors.text }]}>Dashboard</Text>
                    <Pressable onPress={logout} style={styles.logoutPill}>
                        <Text style={{ color: '#ff4444', fontWeight: '600' }}>Logout</Text>
                    </Pressable>
                </View>

                {/* WALLET CARD */}
                <View style={[styles.balanceCard, { backgroundColor: BRAND_GREEN }]}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.balanceLabel}>Main Wallet</Text>
                        <Ionicons name="shield-checkmark" size={20} color="rgba(255,255,255,0.7)" />
                    </View>
                    
                    {/* BALANCE DISPLAY SECTION */}
                    <View style={styles.balanceContainer}>
                        {(isLoadingBalance || isFunding) ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                <Text style={styles.balanceAmount}>{usdcBalance} </Text>
                                <Text style={styles.balanceTicker}>USDC</Text>
                            </View>
                        )}
                    </View>

                    {/* ADDRESS ROW WITH COPY BUTTON */}
                    <Pressable onPress={handleCopyAddress} style={styles.addressRow}>
                        <Text style={styles.addressDisplay} numberOfLines={1} ellipsizeMode="middle">
                            {wallet.address}
                        </Text>
                        {isCopied ? (
                            <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginLeft: 8 }} />
                        ) : (
                            <Ionicons name="copy-outline" size={20} color="rgba(255,255,255,0.7)" style={{ marginLeft: 8 }} />
                        )}
                    </Pressable>

                    <View style={styles.statusBadge}>
                        <View style={styles.activeDot} />
                        <Text style={styles.statusText}>Active</Text>
                    </View>
                </View>

                {/* QUICK ACTIONS GRID */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                </View>
                <View style={styles.actionsGrid}>
                    {walletActions.map((action) => (
                        <Pressable
                            key={action.id}
                            style={[styles.actionItem, { 
                                backgroundColor: dark ? '#1c1c1e' : '#fff', 
                                borderColor: colors.border 
                            }]}
                            onPress={() => handleNavigation(action)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: BRAND_GREEN + '15' }]}>
                                <Ionicons name={action.icon} size={24} color={BRAND_GREEN} />
                            </View>
                            <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* STAGING FUNDS BUTTON */}
                <Pressable 
                    style={[styles.stagingButton, { opacity: isFunding ? 0.7 : 1 }]} 
                    onPress={handleStagingFund} 
                    disabled={isFunding}
                >
                    {isFunding ? (
                        <ActivityIndicator color="white" style={{ marginRight: 8 }} />
                    ) : (
                        <Ionicons name="flask" size={20} color="white" style={{ marginRight: 8 }} />
                    )}
                    <Text style={styles.stagingButtonText}>
                        {isFunding ? "Updating..." : "Add 10 Staging Tokens"}
                    </Text>
                </Pressable>

                {/* USER IDENTITY CARD */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Details</Text>
                </View>
                <View style={[styles.infoCard, { 
                    backgroundColor: dark ? '#1c1c1e' : '#fff', 
                    borderColor: colors.border 
                }]}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                        <Text style={[styles.value, { color: colors.text }]}>{user.email}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: colors.text }]}>User ID</Text>
                        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>{user.id}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    welcomeText: { fontSize: 26, fontWeight: 'bold' },
    logoutPill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#ff444415' },
    balanceCard: { padding: 24, borderRadius: 24, marginBottom: 30, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
    balanceContainer: { marginBottom: 20, alignItems: 'flex-start' },
    balanceAmount: { color: '#fff', fontSize: 42, fontWeight: '800', lineHeight: 42 },
    balanceTicker: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600', marginBottom: 4 },
    addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    addressDisplay: { color: '#fff', fontSize: 14, fontWeight: '500', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', opacity: 0.9, flex: 1 },
    statusBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginRight: 6 },
    statusText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    sectionHeader: { marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: '700', opacity: 0.8 },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
    actionItem: { width: '48%', padding: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center', marginBottom: 15 },
    iconContainer: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    actionLabel: { fontSize: 14, fontWeight: '600' },
    
    // New Styles for Deposit/Withdraw Section
    fundManagementRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
        gap: 12,
    },
    fundCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    fundIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    fundTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    fundSubtitle: {
        fontSize: 12,
        opacity: 0.6,
    },

    // Style for Staging Button
    stagingButton: {
        backgroundColor: BRAND_GREEN,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        borderRadius: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    stagingButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 40 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    label: { fontSize: 14, opacity: 0.5, fontWeight: '500' },
    value: { fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right', marginLeft: 15 },
    divider: { height: 1, width: '100%', marginVertical: 12, opacity: 0.5 },
});