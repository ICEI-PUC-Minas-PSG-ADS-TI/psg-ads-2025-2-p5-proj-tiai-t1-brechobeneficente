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

export default function FormularioLogin() {
  const router = useRouter()
  const { login } = useContext(AuthContext)

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erros, setErros] = useState({})

  const validarCampos = () => {
    const novosErros = {}

    if (!email.trim()) {
      novosErros.email = 'E-mail é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      novosErros.email = 'E-mail inválido'
    }

    if (!senha.trim()) {
      novosErros.senha = 'Senha é obrigatória'
    } else if (senha.length < 6) {
      novosErros.senha = 'Senha deve ter pelo menos 6 caracteres'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const realizarLogin = async () => {
    if (!validarCampos()) return

    setCarregando(true)
    try {
      const sucesso = await login(email.trim(), senha)
      if (sucesso) {
        router.replace('/home')
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <BaseLayout titulo="Login">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Feather name="sun" size={48} color={cores.primary} />
                <Text style={styles.titulo}>Brechó Beneficente</Text>
                <Text style={styles.subtitulo}>Faça seu login</Text>
              </View>
            </View>

            <View style={styles.formulario}>
              <View style={styles.campoContainer}>
                <Text style={styles.label}>E-mail</Text>
                <View style={[
                  styles.inputContainer,
                  erros.email && styles.inputContainerErro
                ]}>
                  <Feather name="mail" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text)
                      if (erros.email) {
                        setErros(prev => ({ ...prev, email: null }))
                      }
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Digite seu e-mail"
                    placeholderTextColor={cores.gray500}
                  />
                </View>
                {erros.email && (
                  <View style={styles.erroContainer}>
                    <Feather name="alert-circle" size={14} color={cores.error} />
                    <Text style={styles.erroTexto}>{erros.email}</Text>
                  </View>
                )}
              </View>

              <View style={styles.campoContainer}>
                <Text style={styles.label}>Senha</Text>
                <View style={[
                  styles.inputContainer,
                  erros.senha && styles.inputContainerErro
                ]}>
                  <Feather name="lock" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    value={senha}
                    onChangeText={(text) => {
                      setSenha(text)
                      if (erros.senha) {
                        setErros(prev => ({ ...prev, senha: null }))
                      }
                    }}
                    secureTextEntry={!mostrarSenha}
                    placeholder="Digite sua senha"
                    placeholderTextColor={cores.gray500}
                  />
                  <TouchableOpacity
                    onPress={() => setMostrarSenha(!mostrarSenha)}
                    style={styles.botaoMostrarSenha}
                  >
                    <Feather
                      name={mostrarSenha ? "eye-off" : "eye"}
                      size={20}
                      color={cores.gray500}
                    />
                  </TouchableOpacity>
                </View>
                {erros.senha && (
                  <View style={styles.erroContainer}>
                    <Feather name="alert-circle" size={14} color={cores.error} />
                    <Text style={styles.erroTexto}>{erros.senha}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.botaoEntrar}
                onPress={realizarLogin}
                disabled={carregando}
                activeOpacity={0.8}
              >
                {carregando ? (
                  <ActivityIndicator color={cores.white} size="small" />
                ) : (
                  <>
                    <Feather name="log-in" size={20} color={cores.white} />
                    <Text style={styles.textoBotaoEntrar}>Entrar</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.linksContainer}>
                <TouchableOpacity onPress={() => router.push('/cadastro/recuperar-senha')}>
                  <Text style={styles.linkSecundario}>Esqueceu sua senha?</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divisor}>
                <View style={styles.linha} />
                <Text style={styles.textoDivisor}>ou</Text>
                <View style={styles.linha} />
              </View>

              <TouchableOpacity
                style={styles.botaoCadastro}
                onPress={() => router.push('/cadastro/form')}
                activeOpacity={0.8}
              >
                <Feather name="user-plus" size={20} color={cores.primary} />
                <Text style={styles.textoBotaoCadastro}>Criar nova conta</Text>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: cores.text,
    marginTop: 12,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 16,
    color: cores.gray600,
    fontWeight: '400',
  },
  formulario: {
    flex: 1,
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
  botaoMostrarSenha: {
    padding: 4,
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
  botaoEntrar: {
    backgroundColor: cores.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textoBotaoEntrar: {
    color: cores.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  linkSecundario: {
    color: cores.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  divisor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  linha: {
    flex: 1,
    height: 1,
    backgroundColor: cores.divider,
  },
  textoDivisor: {
    marginHorizontal: 16,
    color: cores.gray500,
    fontSize: 14,
  },
  botaoCadastro: {
    backgroundColor: cores.white,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: cores.primary,
    marginBottom: 20,
  },
  textoBotaoCadastro: {
    color: cores.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
})