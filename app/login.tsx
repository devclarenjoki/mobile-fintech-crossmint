import { useCrossmintAuth } from "@crossmint/client-sdk-react-native-ui";
import { useTheme } from "@react-navigation/native";
import { ActivityIndicator } from "react-native";
// import DashboardScreen from "./DashboardScreen"; // Your new screen
import DashboardScreen from "@/components/dashboard";
import LoginScreen from "@/components/ui/login";

export default function LoginLayout() {
    const { status } = useCrossmintAuth();
    const theme = useTheme()

    // While checking session
    if (status === "initializing") {
        return <ActivityIndicator color="#05b959" />; 
    }

    // Auto-switch based on auth status
    return status === "logged-in" ? <DashboardScreen /> : <LoginScreen />;
}