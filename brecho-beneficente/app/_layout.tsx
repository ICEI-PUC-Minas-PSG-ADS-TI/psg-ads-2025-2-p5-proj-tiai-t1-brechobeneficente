import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Página inicial - redireciona baseado na autenticação */}
        <Stack.Screen name="index" />

        {/* Rotas de autenticação */}
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro/form" />
        <Stack.Screen name="cadastro/recuperar-senha" />

        {/* Rotas protegidas */}
        <Stack.Screen name="home" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
