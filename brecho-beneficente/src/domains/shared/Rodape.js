import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import cores from '../../constants/colors'

const Rodape = () => {
  return (
    <View style={styles.rodape}>
      <View style={styles.content}>
        <Text style={styles.text}>Brechó Beneficente - Todos os direitos reservados</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  rodape: {
    height: 50,
    backgroundColor: cores.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: cores.white,
    fontSize: 10,
    opacity: 0.7,
    fontWeight: '400',
    textAlign: 'center',
  }
})

export default Rodape
