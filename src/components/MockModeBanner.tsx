import React from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { isMockMode } from '../services/supabase';
import { Colors, Spacing } from '../theme/constants';

export const MockModeBanner = () => {
    if (!isMockMode) return null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.text}>⚠️ MODALITÀ DEMO (Dati locali non salvati su Supabase)</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: Colors.warning,
    },
    container: {
        backgroundColor: Colors.warning,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                // Adjust if needed for dynamic safe area
            },
            android: {
                paddingTop: Spacing.xs,
            }
        })
    },
    text: {
        color: Colors.text,
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
