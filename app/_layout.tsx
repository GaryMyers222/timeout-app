import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { TimeoutStoreProvider } from '@/components/timeout-store';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TimeoutStoreProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="create-sit-request"
            options={{ presentation: 'card', title: 'Create Sit Request' }}
          />
          <Stack.Screen
            name="invite-friends"
            options={{ presentation: 'card', title: 'Build Your Circle' }}
          />
          <Stack.Screen
            name="invitee-preview"
            options={{ presentation: 'card', title: 'Private Invite' }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </TimeoutStoreProvider>
  );
}
