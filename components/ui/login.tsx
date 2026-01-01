import { useToast } from "@/app/providers/ToastContext";
import { useCrossmintAuth } from "@crossmint/client-sdk-react-native-ui";
import { useTheme } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../themed-text";

const BRAND_GREEN = "#05b959";

export default function LoginScreen() {
    const { loginWithOAuth, createAuthSession, crossmintAuth, status, user, jwt } = useCrossmintAuth();
    const { showToast } = useToast();
    const { colors, dark } = useTheme();

    const [email, setEmail] = useState("");
    const [emailId, setEmailId] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [isPending, setIsPending] = useState(false);

      const loginProcessed = useRef(false);


    const url = Linking.useLinkingURL();
    useEffect(() => {
        if (url != null) createAuthSession(url);
    }, [createAuthSession, url]);

     useEffect(() => {
    switch (status) {
      case "logged-out":
        // Reset the safety gate so they can log in again later
        loginProcessed.current = false;
        break;

      case "logged-in":
        if (user && jwt && !loginProcessed.current) {
          loginProcessed.current = true;
          
          const finalize = async () => {
            try {
              router.replace("/(tabs)"); // Navigate to dashboard
            } catch (err) {
              console.error("Storage error:", err);
            }
          };
          finalize();
        }
        break;

      case "initializing":
        // Show loading state (handled in render)
        break;
    }
  }, [status, user, jwt]);

    const sendOtp = async () => {
        if (!email.trim()) return showToast("Please enter email", "error");
        setIsPending(true);
        try {
            const res = await crossmintAuth?.sendEmailOtp(email);
            setEmailId(res.emailId);
            setOtpSent(true);
            showToast("OTP sent!", "success");
        } catch (error) {
            showToast("Failed to send code", "error");
        } finally {
            setIsPending(false);
        }
    };

    const verifyOtp = async () => {
        if (!otp.trim()) return showToast("Enter OTP", "error");
        setIsPending(true);
        try {
            const oneTimeSecret = await crossmintAuth?.confirmEmailOtp(email, emailId, otp);
            await createAuthSession(oneTimeSecret);
        } catch (error) {
            showToast("Invalid OTP", "error");
        } finally {
            setIsPending(false);
        }
    };

    if (status === "initializing" || status === "logged-in") {
    return (
        <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
            <ThemedText>Loading...</ThemedText>
            <ActivityIndicator size="large" color={BRAND_GREEN} />
        </View>
    );
}

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={styles.container}>
                <View style={styles.headerSection}>
                    <Image source={require("@/assets/images/crossmint-icon.png")} style={styles.logo} resizeMode="contain" />
                    <ThemedText>Welcome Back</ThemedText>
                    <Text style={[styles.subtitle, { color: colors.text, opacity: 0.6 }]}>Sign in to access your wallet</Text>
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
                        <Pressable style={[styles.primaryButton, { backgroundColor: BRAND_GREEN }]} onPress={sendOtp} disabled={isPending}>
                            {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue with Email</Text>}
                        </Pressable>
                    ) : (
                        <View>
                            <TextInput
                                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: dark ? '#1a1a1a' : '#f9f9f9' }]}
                                placeholder="6-digit OTP"
                                placeholderTextColor={dark ? "#777" : "#aaa"}
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                            <Pressable style={[styles.primaryButton, { backgroundColor: BRAND_GREEN }]} onPress={verifyOtp} disabled={isPending}>
                                {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
                            </Pressable>
                            <Pressable onPress={() => setOtpSent(false)} style={styles.backButton}>
                                <Text style={{ color: BRAND_GREEN, textAlign: 'center', fontWeight: '600' }}>Use different email</Text>
                            </Pressable>
                        </View>
                    )}

                    <View style={styles.dividerContainer}>
                        <View style={[styles.line, { backgroundColor: colors.border }]} />
                        <Text style={{ marginHorizontal: 15, color: colors.text, opacity: 0.4, fontSize: 12, fontWeight: '700' }}>OR</Text>
                        <View style={[styles.line, { backgroundColor: colors.border }]} />
                    </View>

                    <Pressable style={[styles.socialButton, { borderColor: colors.border }]} onPress={() => loginWithOAuth("google")}>
                        <Text style={[styles.socialButtonText, { color: colors.text }]}>Continue with Google</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: "center"
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 40
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 20
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center'
    },
    formCard: {
        width: '100%'
    },
    input: {
        height: 58,
        borderWidth: 1,
        paddingHorizontal: 18,
        marginBottom: 16,
        borderRadius: 16,
        fontSize: 16
    },
    primaryButton: {
        height: 58,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700"
    },
    backButton: {
        marginTop: 20
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 35
    },
    line: {
        flex: 1,
        height: 1
    },
    socialButton: {
        height: 58,
        borderRadius: 16,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: '600'
    },
});