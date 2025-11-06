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
import { TextInputMask } from 'react-native-masked-text'
import { AuthContext } from '../../context/AuthContext'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'

export default function FormularioCadastro() {
  const router = useRouter()
  const { register } = useContext(AuthContext)

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false)
  const [erros, setErros] = useState({})

  const validarCampos = () => {
    const novosErros = {}
    
    if (!nome.trim()) {
      novosErros.nome = 'Nome é obrigatório'
    } else if (nome.trim().length < 2) {
      novosErros.nome = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (!telefone.trim()) {
      novosErros.telefone = 'Telefone é obrigatório'
    } else if (telefone.replace(/\D/g, '').length < 10) {
      novosErros.telefone = 'Telefone inválido'
    }

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

    if (!confirmarSenha.trim()) {
      novosErros.confirmarSenha = 'Confirmação de senha é obrigatória'
    } else if (senha !== confirmarSenha) {
      novosErros.confirmarSenha = 'Senhas não coincidem'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const realizarCadastro = async () => {
    if (!validarCampos()) return

    setCarregando(true)
    try {
      await register({ 
        email: email.trim(), 
        senha, 
        nome: nome.trim(), 
        telefone: telefone.replace(/\D/g, '') 
      })
      Alert.alert(
        'Sucesso!', 
        'Cadastro realizado com sucesso! Você será redirecionado para o login.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      )
    } catch (error) {
      console.error('Erro ao cadastrar:', error)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <BaseLayout titulo="Cadastro">
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
                <Text style={styles.subtitulo}>Criar nova conta</Text>
              </View>
            </View>

            <View style={styles.formulario}>
              <View style={styles.campoContainer}>
                <Text style={styles.label}>Nome Completo *</Text>
                <View style={[
                  styles.inputContainer, 
                  erros.nome && styles.inputContainerErro
                ]}>
                  <Feather name="user" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    value={nome}
                    onChangeText={(text) => {
                      setNome(text)
                      if (erros.nome) {
                        setErros(prev => ({ ...prev, nome: null }))
                      }
                    }}
                    placeholder="Digite seu nome completo"
                    placeholderTextColor={cores.gray500}
                  />
                </View>
                {erros.nome && (
                  <View style={styles.erroContainer}>
                    <Feather name="alert-circle" size={14} color={cores.error} />
                    <Text style={styles.erroTexto}>{erros.nome}</Text>
                  </View>
                )}
              </View>

              <View style={styles.campoContainer}>
                <Text style={styles.label}>Telefone *</Text>
                <View style={[
                  styles.inputContainer, 
                  erros.telefone && styles.inputContainerErro
                ]}>
                  <Feather name="phone" size={20} color={cores.gray500} />
                  <TextInputMask
                    type={'cel-phone'}
                    options={{
                      maskType: 'BRL',
                      withDDD: true,
                      dddMask: '(99) '
                    }}
                    value={telefone}
                    onChangeText={(text) => {
                      setTelefone(text)
                      if (erros.telefone) {
                        setErros(prev => ({ ...prev, telefone: null }))
                      }
                    }}
                    style={styles.input}
                    keyboardType="phone-pad"
                    placeholder="(99) 99999-9999"
                    placeholderTextColor={cores.gray500}
                  />
                </View>
                {erros.telefone && (
                  <View style={styles.erroContainer}>
                    <Feather name="alert-circle" size={14} color={cores.error} />
                    <Text style={styles.erroTexto}>{erros.telefone}</Text>
                  </View>
                )}
              </View>

              <View style={styles.campoContainer}>
                <Text style={styles.label}>E-mail *</Text>
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
                    placeholder="Digite seu e-mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
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
                <Text style={styles.label}>Senha *</Text>
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
                    placeholder="Digite uma senha"
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

              <View style={styles.campoContainer}>
                <Text style={styles.label}>Confirmar Senha *</Text>
                <View style={[
                  styles.inputContainer, 
                  erros.confirmarSenha && styles.inputContainerErro
                ]}>
                  <Feather name="lock" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    value={confirmarSenha}
                    onChangeText={(text) => {
                      setConfirmarSenha(text)
                      if (erros.confirmarSenha) {
                        setErros(prev => ({ ...prev, confirmarSenha: null }))
                      }
                    }}
                    secureTextEntry={!mostrarConfirmarSenha}
                    placeholder="Confirme sua senha"
                    placeholderTextColor={cores.gray500}
                  />
                  <TouchableOpacity 
                    onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    style={styles.botaoMostrarSenha}
                  >
                    <Feather 
                      name={mostrarConfirmarSenha ? "eye-off" : "eye"} 
                      size={20} 
                      color={cores.gray500} 
                    />
                  </TouchableOpacity>
                </View>
                {erros.confirmarSenha && (
                  <View style={styles.erroContainer}>
                    <Feather name="alert-circle" size={14} color={cores.error} />
                    <Text style={styles.erroTexto}>{erros.confirmarSenha}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.botaoCadastrar}
                onPress={realizarCadastro}
                disabled={carregando}
                activeOpacity={0.8}
              >
                {carregando ? (
                  <ActivityIndicator color={cores.white} size="small" />
                ) : (
                  <>
                    <Feather name="user-plus" size={20} color={cores.white} />
                    <Text style={styles.textoBotaoCadastrar}>Cadastrar</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.divisor}>
                <View style={styles.linha} />
                <Text style={styles.textoDivisor}>ou</Text>
                <View style={styles.linha} />
              </View>

              <TouchableOpacity 
                style={styles.botaoLogin}
                onPress={() => router.replace('/login')}
                activeOpacity={0.8}
              >
                <Feather name="log-in" size={20} color={cores.primary} />
                <Text style={styles.textoBotaoLogin}>Já tenho uma conta</Text>
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
    marginBottom: 30,
    marginTop: 10,
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
    marginBottom: 16,
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
  botaoCadastrar: {
    backgroundColor: cores.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textoBotaoCadastrar: {
    color: cores.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  botaoLogin: {
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
  textoBotaoLogin: {
    color: cores.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
})