import { useThemeColor } from '@/hooks/use-theme-color';
import { Pressable, type PressableProps } from 'react-native';

export type ThemedPressableProps = PressableProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedPressable({ style, lightColor, darkColor, ...otherProps }: ThemedPressableProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <Pressable style={[{ backgroundColor }]} {...otherProps} />;
}