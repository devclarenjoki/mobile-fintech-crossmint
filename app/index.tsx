import LoadingModal from "@/components/ui/LoadingModal";
import { router } from 'expo-router'; // Import router
import { useEffect, useState } from 'react';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Simulate the completion of the loading process
    const loadData = async () => {
      // Replace with your actual data fetching/initialization logic
      await new Promise(resolve => setTimeout(resolve, 3000)); 
      setIsLoaded(true);
    };

    loadData();
  }, []);

  useEffect(() => {
    // 2. Redirect once loading is complete
    if (isLoaded) {
      // Use replace to ensure the user cannot navigate back to the loading page
      router.replace('/(tabs)'); 
    }
  }, [isLoaded]);

  // 3. Show the LoadingModal while isLoaded is false
  return <LoadingModal visible={!isLoaded} />;
  // Note: LoadingModal will disappear right before the redirect happens.
}


