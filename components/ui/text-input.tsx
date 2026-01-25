import { useTheme } from "@react-navigation/native";
import React from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  style?: object;
}

export const Input = ({ style, ...props }: InputProps) => {
  const { colors, dark } = useTheme();

  return (
    <TextInput
      style={[
        styles.input,
        {
          borderColor: colors.border,
          color: colors.text,
          backgroundColor: dark ? "#1a1a1a" : "#f9f9f9",
        },
        style,
      ]}
      placeholderTextColor={dark ? "#777" : "#aaa"}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 58,
    borderWidth: 1,
    paddingHorizontal: 18,
    marginBottom: 16,
    borderRadius: 16,
    fontSize: 16,
  },
});