import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BaseLayout from '../shared/BaseLayout';
import cores from '../../constants/colors';

export default function Home() {
  return (
    <BaseLayout titulo="Início" scrollable>
      <View style={styles.container}>
        <Text style={styles.titulo}>Bem-vindo ao Brechó Beneficente!</Text>
        <Text style={styles.subtitulo}>
          Sistema de gestão para brechós beneficentes
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Dashboard</Text>
          <Text style={styles.cardTexto}>
            Aqui você terá acesso a todas as funcionalidades do sistema.
          </Text>
        </View>
      </View>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: cores.gray600,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: cores.white,
    padding: 20,
    borderRadius: 12,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: cores.border,
  },
  cardTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.text,
    marginBottom: 8,
  },
  cardTexto: {
    fontSize: 14,
    color: cores.gray700,
    lineHeight: 20,
  },
});