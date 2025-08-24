import "@walletconnect/react-native-compat";
import {
  AppKit,
  createAppKit,
  defaultWagmiConfig
} from "@reown/appkit-wagmi-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet } from "@wagmi/core/chains";
import { monadTestnet } from "@/config/chains";
import { WagmiProvider } from "wagmi";

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { View } from "react-native";
import AuthGuard from '@/components/AuthGuard';

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId at https://dashboard.reown.com
const projectId = process.env.EXPO_PUBLIC_REOWN_PROJECT_ID || "b8e39dfb697ba26ac5a77a4b29b35604";

// 2. Create config
const metadata = {
  name: "La Kiniela",
  description: "Mercados de predicción descentralizados con impacto social",
  url: "https://lakiniela.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "lakiniela://",
    universal: "lakiniela.com",
  },
};

const chains = [mainnet, monadTestnet] as const;

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createAppKit({
  projectId,
  metadata,
  chainImages: {
    10143: "https://files.svgcdn.io/token-branded/monad.png", // Monad Testnet
  },
  wagmiConfig,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AuthGuard>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthGuard>
          {/* This is a workaround for the Android modal issue. https://github.com/expo/expo/issues/32991#issuecomment-2489620459 */}
          <View style={{ position: "absolute", height: "100%", width: "100%" }}>
            <AppKit />
          </View>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
