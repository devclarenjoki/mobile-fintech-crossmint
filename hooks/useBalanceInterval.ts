import { Balances, useWallet } from "@crossmint/client-sdk-react-native-ui";
import { useState } from "react";

export default async function useBalanceInterval({
  onAuthError,
}: { onAuthError?: () => void } = {}) {
  const { wallet } = useWallet();
  const [balances, setBalances] = useState<Balances | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);

  const b2 = await wallet?.balances(['USDC'])
  // setBalances(b2)
  console.log(b2)

  // const fetchAndSetBalances = useCallback(
  //   async (manual = false) => {
  //     try {
  //       if (manual) {
  //         setIsManualRefreshing(true);
  //       } else {
  //         setIsLoading(true);
  //       }
        
  //       if (!wallet) {
  //         console.log("Wallet not available, skipping balance fetch.");
  //         return;
  //       }

  //       console.log("wallet", wallet)
        
  //       // Add a try-catch specifically for the wallet.balances call
  //       try {
  //         const updatedBalances = await wallet.balances(["usdxm"]);
          
  //         // Validate the response before setting it
  //         if (updatedBalances === null || updatedBalances === undefined) {
  //           console.log("Received null or undefined balances");
  //           setBalances(undefined);
  //           setIsError(true);
  //           Alert.alert(
  //             "Data Error",
  //             "Unable to retrieve balance data. Please try again."
  //           );
  //           return;
  //         }
          
  //         // Check if the response is a valid object
  //         if (typeof updatedBalances !== 'object') {
  //           console.log("Received invalid balances data:", updatedBalances);
  //           setBalances(undefined);
  //           setIsError(true);
  //           Alert.alert(
  //             "Data Error",
  //             "Received invalid balance data. Please try again."
  //           );
  //           return;
  //         }
          
  //         setBalances(updatedBalances);
  //         setIsError(false);
  //       } catch (balanceError: any) {
  //         console.error("Error in wallet.balances call:", balanceError);
  //         setBalances(undefined);
  //         setIsError(true);
          
  //         // Handle specific error types
  //         if (balanceError instanceof SyntaxError || 
  //             balanceError.message?.includes('JSON') || 
  //             balanceError.message?.includes('Unexpected character')) {
  //           Alert.alert(
  //             "Connection Error",
  //             "Invalid data received from server. Please pull down to refresh."
  //           );
  //         } else if (balanceError.response?.status === 401) {
  //           console.log("Authentication error detected. Triggering logout flow.");
  //           Alert.alert(
  //             "Session Expired",
  //             "Your session has expired. Please log in again."
  //           );
  //           if (onAuthError) {
  //             onAuthError();
  //           }
  //         } else {
  //           // Alert.alert(
  //           //   "Error",
  //           //   "Failed to fetch balances. Please try again."
  //           // );
  //         }
  //       }
        
  //     } catch (error: any) {
  //       console.error("Error in fetchAndSetBalances:", error);
  //       setIsError(true);
  //       setBalances(undefined);
        
  //       // Handle authentication errors
  //       if (error.response?.status === 401) {
  //         console.log("Authentication error detected. Triggering logout flow.");
  //         Alert.alert(
  //           "Session Expired",
  //           "Your session has expired. Please log in again."
  //         );
  //         if (onAuthError) {
  //           onAuthError();
  //         }
  //       } else {
  //         // For other errors, show a generic message
  //         Alert.alert(
  //           "Error",
  //           "An unexpected error occurred. Please try again."
  //         );
  //       }
  //     } finally {
  //       if (manual) {
  //         setIsManualRefreshing(false);
  //       } else {
  //         setIsLoading(false);
  //       }
  //     }
  //   },
  //   [ onAuthError]
  // );

  // // Initial fetch when wallet becomes available
  // useEffect(() => {
  //   if (wallet) {
  //     fetchAndSetBalances();
  //   }
  // }, [fetchAndSetBalances]);

  return {
    balances,
    isLoading,
    isError,
    // triggerManualRefresh: () => {
    //   fetchAndSetBalances(true);
    // },
    isManualRefreshing,
  };
}