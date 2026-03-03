import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuthStore } from '../src/store/useAuthStore';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="login" options={{ animation: 'fade' }} />
        ) : (
          <>
            <Stack.Screen name="(tabs)" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="modals/add-ingredient" options={{ presentation: 'modal', headerShown: true, title: 'Nuovo Ingrediente' }} />
            <Stack.Screen name="modals/add-material" options={{ presentation: 'modal', headerShown: true, title: 'Nuovo Materiale' }} />
            <Stack.Screen name="modals/add-recipe" options={{ presentation: 'modal', headerShown: true, title: 'Nuova Ricetta' }} />
            <Stack.Screen name="modals/shopping-list" options={{ presentation: 'modal', headerShown: true, title: 'Spesa' }} />
            <Stack.Screen name="modals/manage-kits" options={{ presentation: 'modal', headerShown: true, title: 'Gestione Kit' }} />
          </>
        )}
      </Stack>
    </QueryClientProvider>
  );
}
