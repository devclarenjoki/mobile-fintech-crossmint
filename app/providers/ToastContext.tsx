import { useTheme } from "@react-navigation/native";
import React, { createContext, useContext, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ToastType = "success" | "error" | "info";

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  function showToast(msg: string, toastType: ToastType = "info") {
    setMessage(msg);
    setType(toastType);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
      Animated.delay(2500),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }

  function getBackgroundColor() {
    if (type === "success") return "#05b959";
    if (type === "error") return "#ff4444";
    return colors.card;
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <SafeAreaView pointerEvents="none" style={styles.topWrapper}>
        <Animated.View 
            style={[
                styles.toastContainer, 
                { 
                    opacity, 
                    backgroundColor: getBackgroundColor(),
                    transform: [{ translateY }] 
                }
            ]}
        >
          <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
      </SafeAreaView>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  topWrapper: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  toastContainer: {
    width: '90%',
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    alignItems: "center",
  },
  toastText: { 
    color: "#fff", 
    fontWeight: "700", 
    textAlign: "center",
    fontSize: 14 
  },
});