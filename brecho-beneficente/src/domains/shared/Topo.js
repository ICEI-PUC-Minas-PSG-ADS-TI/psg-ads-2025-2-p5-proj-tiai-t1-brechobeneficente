import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useContext, useState } from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal
} from 'react-native'
import { AuthContext } from '../../context/AuthContext'
import cores from '../../constants/colors'

const { width } = Dimensions.get('window')

const Topo = () => {
  const { usuario, isAutenticado, logout } = useContext(AuthContext)
  const [menuVisivel, setMenuVisivel] = useState(false)
  const router = useRouter()

  const abrirMenu = () => setMenuVisivel(true)
  const fecharMenu = () => setMenuVisivel(false)

  const sair = () => {
    fecharMenu()
    logout()
    router.replace('/login')
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
          <Feather name="sun" size={28} color={cores.white} />
          <Text style={styles.logoText}>Brechó</Text>
          <Text style={styles.logoSubtext}>Beneficente</Text>
        </View>

        <Text style={styles.tagline}>Sustentabilidade & Solidariedade</Text>
      </View>

      {isAutenticado && (
        <>
          <TouchableOpacity onPress={abrirMenu} style={styles.userButton}>
            <Feather name="user" size={24} color={cores.white} />
          </TouchableOpacity>

          <Modal visible={menuVisivel} transparent animationType="fade">
            <TouchableOpacity style={styles.modalFundo} onPress={fecharMenu}>
              <View style={styles.modalMenu}>
                <View style={styles.modalHeader}>
                  <Feather name="user" size={20} color={cores.primary} />
                  <Text style={styles.usuarioTexto}>
                    {usuario?.displayName || usuario?.email || 'Usuário'}
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={sair} style={styles.botaoSair}>
                    <Feather name="log-out" size={16} color={cores.white} />
                    <Text style={styles.textoSair}>Sair</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 110,
    position: 'relative',
    backgroundColor: cores.primary,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.white,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  logoSubtext: {
    fontSize: 16,
    color: cores.white,
    marginLeft: 4,
    fontWeight: '300',
    opacity: 0.9,
  },
  tagline: {
    fontSize: 12,
    color: cores.white,
    opacity: 0.8,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  userButton: {
    position: 'absolute',
    bottom: 12,
    right: 20,
    backgroundColor: cores.secondary,
    borderRadius: 20,
    padding: 8,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  modalFundo: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor: cores.overlay,
    paddingTop: 110,
    paddingRight: 20,
  },
  modalMenu: {
    backgroundColor: cores.white,
    borderRadius: 12,
    width: 240,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: cores.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: cores.divider,
  },
  usuarioTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.text,
    marginLeft: 8,
    flex: 1,
  },
  modalActions: {
    padding: 12,
  },
  botaoSair: {
    backgroundColor: cores.error,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoSair: {
    color: cores.white,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  }
})

export default Topo