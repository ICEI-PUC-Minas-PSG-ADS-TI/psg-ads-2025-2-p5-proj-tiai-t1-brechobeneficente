import { useRouter } from 'expo-router'
import { useContext, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { AuthContext } from '../../context/AuthContext'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'

export default function RecuperarSenha() {
  const router = useRouter()
  const { recuperarSenha } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const validarEmail = (email) => {
    const regex = /\S+@\S+\.\S+/
    return regex.test(email)
  }

  const enviarRecuperacao = async () => {
    if (!email.trim()) {
      setErro('E-mail é obrigatório')
      return
    }

    if (!validarEmail(email)) {
      setErro('E-mail inválido')
      return
    }

    setErro('')
    setCarregando(true)
    try {
      await recuperarSenha(email.trim())
      Alert.alert(
        'E-mail Enviado!',
        'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      )
    } catch (error) {
      console.error('Erro ao enviar recuperação:', error)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <BaseLayout titulo="Recuperar Senha">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Feather name="key" size={64} color={cores.primary} />
                <Text style={styles.titulo}>Recuperar Senha</Text>
                <Text style={styles.subtitulo}>
                  Digite seu e-mail e enviaremos as instruções para redefinir sua senha
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.campoContainer}>
                <Text style={styles.label}>E-mail</Text>
                <View style={[
                  styles.inputContainer,
                  erro && styles.inputContainerErro
                ]}>
                  <Feather name="mail" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text)
                      if (erro) setErro('')
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Digite seu e-mail"
                    placeholderTextColor={cores.gray500}
                  />
                </View>
                {erro && (
                  <View style={styles.erroContainer}>
                    <Feather name="alert-circle" size={14} color={cores.error} />
                    <Text style={styles.erroTexto}>{erro}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.botaoEnviar}
                onPress={enviarRecuperacao}
                disabled={carregando}
                activeOpacity={0.8}
              >
                {carregando ? (
                  <ActivityIndicator color={cores.white} size="small" />
                ) : (
                  <>
                    <Feather name="send" size={20} color={cores.white} />
                    <Text style={styles.textoBotaoEnviar}>Enviar Instruções</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.infoContainer}>
                <Feather name="info" size={16} color={cores.secondary} />
                <Text style={styles.infoTexto}>
                  Você receberá um e-mail com as instruções para criar uma nova senha
                </Text>
              </View>

              <TouchableOpacity
                style={styles.botaoVoltar}
                onPress={() => router.replace('/login')}
                activeOpacity={0.8}
              >
                <Feather name="arrow-left" size={20} color={cores.primary} />
                <Text style={styles.textoBotaoVoltar}>Voltar ao Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </BaseLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: cores.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: cores.gray600,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: cores.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: cores.border,
  },
  campoContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: cores.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: cores.border,
    borderRadius: 12,
    backgroundColor: cores.white,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 52,
  },
  inputContainerErro: {
    borderColor: cores.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: cores.text,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  erroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  erroTexto: {
    color: cores.error,
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  botaoEnviar: {
    backgroundColor: cores.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textoBotaoEnviar: {
    color: cores.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: cores.gray100,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTexto: {
    flex: 1,
    color: cores.gray700,
    fontSize: 14,
    marginLeft: 10,
    lineHeight: 20,
  },
  botaoVoltar: {
    backgroundColor: cores.white,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: cores.primary,
  },
  textoBotaoVoltar: {
    color: cores.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
})