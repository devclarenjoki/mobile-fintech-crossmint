import { useToast } from "@/app/providers/ToastContext";
import { useCrossmintAuth } from "@crossmint/client-sdk-react-native-ui";
import { useTheme } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";
import { Button } from "./button";
import { Input } from "./text-input";
import { ThemedPressable } from "./themed-pressable";


const BRAND_GREEN = "#05b959";

export default function LoginScreen() {
    const { loginWithOAuth, createAuthSession, crossmintAuth, status, user, jwt } = useCrossmintAuth();
    const { showToast } = useToast();
    const { colors } = useTheme();

    const [email, setEmail] = useState("");
    const [emailId, setEmailId] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [isPending, setIsPending] = useState(false);
    const loginProcessed = useRef(false);

    useEffect(() => {
    const handleOAuthCallback = async (url: string) => {
      if (url) {
        console.log("OAuth callback URL:", url);
        await createAuthSession(url);
      }
    };
    Linking.getInitialURL().then((url: any) => { handleOAuthCallback(url); });
    const subscription = Linking.addEventListener('url', (event) => { handleOAuthCallback(event.url); });
    return () => { subscription?.remove(); };
  }, [createAuthSession]);

    useEffect(() => {
        switch (status) {
            case "logged-out":
                loginProcessed.current = false;
                break;
            case "logged-in":
                if (user && jwt && !loginProcessed.current) {
                    loginProcessed.current = true;
                    const finalize = async () => {
                        try {
                            router.replace("/(tabs)");
                        } catch (err) {
                            console.error("Storage error:", err);
                        }
                    };
                    finalize();
                }
                break;
            case "initializing":
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
            <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ThemedText>Loading...</ThemedText>
                <ActivityIndicator size="large" color={BRAND_GREEN} />
            </ThemedView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ThemedView style={styles.container}>
                <ThemedView style={styles.headerSection}>
                    <Image source={require("@/assets/images/crossmint-icon.png")} style={styles.logo} resizeMode="contain" />
                    <ThemedText>Welcome Back</ThemedText>
                    <ThemedText style={[styles.subtitle, { opacity: 0.6 }]}>Sign in to access your wallet</ThemedText>
                </ThemedView>

                <ThemedView style={styles.formCard}>
                    <Input
                        placeholder="Email address"
                        value={email}
                        onChangeText={setEmail}
                        editable={!otpSent}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    {!otpSent ? (
                        <Button  
                            title="Continue with Email" 
                            onPress={sendOtp} 
                            loading={isPending} 
                        />
                    ) : (
                        <ThemedView>
                            <Input
                                placeholder="6-digit OTP"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                            <Button 
                                title="Verify & Login" 
                                onPress={verifyOtp} 
                                loading={isPending} 
                            />
                            <ThemedPressable onPress={() => setOtpSent(false)} style={styles.backButton}>
                                <ThemedText style={{ color: BRAND_GREEN, textAlign: 'center', fontWeight: '600' }}>Use different email</ThemedText>
                            </ThemedPressable>
                        </ThemedView>
                    )}

                    <ThemedView style={styles.dividerContainer}>
                        {/* We pass colors.border as the background prop for the line color */}
                        <ThemedView style={styles.line} lightColor={colors.border} darkColor={colors.border} />
                        <ThemedText style={{ marginHorizontal: 15, opacity: 0.4, fontSize: 12, fontWeight: '700' }}>OR</ThemedText>
                        <ThemedView style={styles.line} lightColor={colors.border} darkColor={colors.border} />
                    </ThemedView>

                    <Button 
                        title="Continue with Google" 
                        onPress={() => loginWithOAuth("google")} 
                        variant="outline" 
                    />
                </ThemedView>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
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
    subtitle: {
        fontSize: 15,
        textAlign: 'center'
    },
    formCard: {
        width: '100%'
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
    }
});