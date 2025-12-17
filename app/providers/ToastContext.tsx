import { useTheme } from "@react-navigation/native";
import React, { createContext, useContext, useRef, useState } from "react";
// 1. Added useWindowDimensions and Platform for better positioning
import { Animated, Platform, SafeAreaView, StyleSheet, Text } from "react-native";

type ToastType = "success" | "error" | "info";

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  
  // 2. Added translateY for a "slide down" effect
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  const showToast = (msg: string, toastType: ToastType = "info") => {
    setMessage(msg);
    setType(toastType);

    // Slide down and fade in, then slide up and fade out
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
  };

  const getBackgroundColor = () => {
    if (type === "success") return "#05b959";
    if (type === "error") return "#ff4444";
    return colors.card;
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* 3. Wrap in a View that starts from the top */}
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
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

const styles = StyleSheet.create({
  // Container that holds the toast at the top
  topWrapper: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 40, // Adjust for Android status bar
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  toastContainer: {
    width: '90%', // Make it look like a floating pill
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