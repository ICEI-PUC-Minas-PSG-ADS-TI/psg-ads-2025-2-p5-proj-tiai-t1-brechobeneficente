import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '../src/context/AuthContext';
import { ProdutosProvider } from '../src/context/ProdutosContext';
import { ClientesProvider } from '../src/context/ClientesContext';
import { PedidosProvider } from '../src/context/PedidosContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProdutosProvider>
        <ClientesProvider>
          <PedidosProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            {/* Rotas de autenticação */}
            <Stack.Screen name="login" />
            <Stack.Screen name="cadastro/form" />
            <Stack.Screen name="cadastro/recuperar-senha" />
            {/* Rotas protegidas */}
            <Stack.Screen name="home" />
            <Stack.Screen name="produtos/index" />
            <Stack.Screen name="produtos/form" />
            <Stack.Screen name="pedidos/index" />
            <Stack.Screen name="pedidos/form" />
            <Stack.Screen name="clientes/index" />
            <Stack.Screen name="clientes/form" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
          </PedidosProvider>
        </ClientesProvider>
      </ProdutosProvider>
    </AuthProvider>
  );
}
