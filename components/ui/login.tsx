import { useToast } from "@/app/providers/ToastContext";
import {
    useCrossmintAuth,
    useWallet,
} from "@crossmint/client-sdk-react-native-ui";
import { useTheme } from "@react-navigation/native";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define the brand green constant
const BRAND_GREEN = "#05b959";

export default function LoginScreen() {
    const {
        loginWithOAuth,
        createAuthSession,
        user,
        crossmintAuth,
        logout,
        status,
    } = useCrossmintAuth();
    const { wallet } = useWallet();
    const { showToast } = useToast();
    const { colors, dark } = useTheme();

    const [email, setEmail] = useState("");
    const [emailId, setEmailId] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [isPending, setIsPending] = useState(false);

    const url = Linking.useLinkingURL();
    useEffect(() => {
        if (url != null) {
            createAuthSession(url);
        }
    }, [createAuthSession, url]);

    const sendOtp = async () => {
        if (!email.trim()) {
            showToast("Please enter a valid email address", "error");
            return;
        }
        setIsPending(true);
        try {
            const res = await crossmintAuth?.sendEmailOtp(email);
            setEmailId(res.emailId);
            setOtpSent(true);
            showToast("OTP sent to your email!", "success");
        } catch (error) {
            showToast("Failed to send code", "error");
        } finally {
            setIsPending(false);
        }
    };

    const verifyOtp = async () => {
        if (!otp.trim()) {
            showToast("Please enter the OTP code", "error");
            return;
        }
        setIsPending(true);
        try {
            const oneTimeSecret = await crossmintAuth?.confirmEmailOtp(email, emailId, otp);
            await createAuthSession(oneTimeSecret);
            showToast("Logged in successfully", "success");
        } catch (error) {
            showToast("Invalid OTP code", "error");
        } finally {
            setIsPending(false);
        }
    };

    const handleLogout = async () => {
        try {
            logout();
            setEmail("");
            setEmailId("");
            setOtpSent(false);
            setOtp("");
        } catch (error) {
            showToast("Failed to logout. Please try again.", "error");
        }
    };

    if (status === "initializing") {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={BRAND_GREEN} />
                <Text style={{ color: colors.text, marginTop: 15, fontWeight: '500' }}>Initializing...</Text>
            </View>
        );
    }

    if (status === "logged-out") {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={styles.container}>
                    {/* LOGO SECTION */}
                    <View style={styles.headerSection}>
                        <Image 
                            source={require("@/assets/images/crossmint-icon.png")} 
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
                        <Text style={[styles.subtitle, { color: colors.text, opacity: 0.6 }]}>
                            Sign in to access your digital wallet
                        </Text>
                    </View>

                    <View style={styles.formCard}>
                        <TextInput
                            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: dark ? '#1a1a1a' : '#f9f9f9' }]}
                            placeholder="Email address"
                            placeholderTextColor={dark ? "#777" : "#aaa"}
                            value={email}
                            onChangeText={setEmail}
                            editable={!otpSent}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        {!otpSent ? (
                            <TouchableOpacity
                                style={[styles.primaryButton, { backgroundColor: BRAND_GREEN }]}
                                onPress={sendOtp}
                                disabled={isPending}
                            >
                                {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue with Email</Text>}
                            </TouchableOpacity>
                        ) : (
                            <View>
                                <TextInput
                                    style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: dark ? '#1a1a1a' : '#f9f9f9' }]}
                                    placeholder="Enter 6-digit OTP"
                                    placeholderTextColor={dark ? "#777" : "#aaa"}
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                                <TouchableOpacity
                                    style={[styles.primaryButton, { backgroundColor: BRAND_GREEN }]}
                                    onPress={verifyOtp}
                                    disabled={isPending}
                                >
                                    {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.backButton}>
                                    <Text style={{ color: BRAND_GREEN, textAlign: 'center', fontWeight: '600' }}>Use a different email</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.dividerContainer}>
                            <View style={[styles.line, { backgroundColor: colors.border }]} />
                            <Text style={{ marginHorizontal: 15, color: colors.text, opacity: 0.4, fontSize: 12, fontWeight: '700' }}>OR</Text>
                            <View style={[styles.line, { backgroundColor: colors.border }]} />
                        </View>

                        <TouchableOpacity
                            style={[styles.socialButton, { borderColor: colors.border }]}
                            onPress={() => loginWithOAuth("google")}
                        >
                            <Text style={[styles.socialButtonText, { color: colors.text }]}>Continue with Google</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={styles.innerContainer}>
                <View style={styles.topBar}>
                    <Text style={[styles.welcomeText, { color: colors.text }]}>Dashboard</Text>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutPill}>
                        <Text style={{ color: '#ff4444', fontWeight: '600' }}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.infoCard, { backgroundColor: dark ? '#1c1c1e' : '#fff', borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>User Identity</Text>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                        <Text style={[styles.value, { color: colors.text }]}>{user?.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.label, { color: colors.text }]}>ID</Text>
                        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>{user?.id}</Text>
                    </View>
                </View>

                {wallet && (
                    <View style={[styles.infoCard, { backgroundColor: BRAND_GREEN + '15', borderColor: BRAND_GREEN + '30' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                             <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND_GREEN, marginRight: 8 }} />
                             <Text style={[styles.cardTitle, { color: BRAND_GREEN, marginBottom: 0 }]}>Active Wallet</Text>
                        </View>
                        <Text style={[styles.addressText, { color: colors.text }]}>{wallet.address}</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    container: { flex: 1, paddingHorizontal: 30, justifyContent: "center" },
    innerContainer: { flex: 1, padding: 20 },
    headerSection: { alignItems: 'center', marginBottom: 40 },
    logo: { width: 80, height: 80, marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, letterSpacing: -0.5 },
    subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
    formCard: { width: '100%' },
    input: { height: 58, borderWidth: 1, paddingHorizontal: 18, marginBottom: 16, borderRadius: 16, fontSize: 16 },
    primaryButton: { height: 58, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: BRAND_GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    backButton: { marginTop: 20 },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 35 },
    line: { flex: 1, height: 1 },
    socialButton: { height: 58, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    socialButtonText: { fontSize: 16, fontWeight: '600' },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 10 },
    welcomeText: { fontSize: 26, fontWeight: 'bold' },
    logoutPill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#ff444415' },
    infoCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    cardTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 18, letterSpacing: 1 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    label: { fontSize: 14, opacity: 0.5, fontWeight: '500' },
    value: { fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right', marginLeft: 15 },
    addressText: { fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', opacity: 0.8, lineHeight: 20 }
});