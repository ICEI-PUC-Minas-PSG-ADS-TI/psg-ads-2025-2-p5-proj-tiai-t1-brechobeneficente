import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';
import cores from '../src/constants/colors';

export default function Index() {
    const { isAutenticado, carregando } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (carregando) return;

        if (isAutenticado) {
            router.replace('/(tabs)');
        } else {
            router.replace('/login' as any);
        }
    }, [isAutenticado, carregando]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: cores.background }}>
            <ActivityIndicator size="large" color={cores.primary} />
        </View>
    );
}