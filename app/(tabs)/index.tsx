import { StyleSheet } from 'react-native';

import DashboardScreen from '@/components/Dasboard/dashboard';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { useCrossmintAuth } from '@crossmint/client-sdk-react-native-ui';
import { Redirect } from 'expo-router';

export default function HomeScreen() {
      const { status } = useCrossmintAuth();

    if (status === "logged-out") {
    return <Redirect href="/login" />;
  }
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      >
      <DashboardScreen/>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
