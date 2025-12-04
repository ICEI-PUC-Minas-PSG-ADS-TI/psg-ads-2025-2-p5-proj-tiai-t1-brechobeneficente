import { useLocalSearchParams, useRouter } from 'expo-router'
import { useContext, useEffect, useState } from 'react'
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
import { FornecedoresContext } from '../../context/FornecedoresContext'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'

export default function FormularioFornecedor() {
  const router = useRouter()
  const { fornecedor } = useLocalSearchParams()
  const { adicionarFornecedor, editarFornecedor, carregando } = useContext(FornecedoresContext)

  const [id, setId] = useState(null)
  const [nome, setNome] = useState('')
  const [documento, setDocumento] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [erros, setErros] = useState({})
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    try {
      if (fornecedor && typeof fornecedor === 'string' && fornecedor.includes('{')) {
        const obj = JSON.parse(fornecedor)
        setEditando(true)
        setId(obj.id)
        setNome(obj.nome || '')
        setDocumento(obj.documento || '')
        setTelefone(obj.telefone || '')
        setEndereco(obj.endereco || '')
      }
    } catch (e) {
      console.error('Erro ao carregar fornecedor para edição:', e)
    }
  }, [fornecedor])

  const validarCampos = () => {
    const novosErros = {}

    if (!nome.trim()) {
      novosErros.nome = 'Nome é obrigatório'
    } else if (nome.trim().length < 3) {
      novosErros.nome = 'Nome deve ter pelo menos 3 caracteres'
    }

    if (documento && documento.trim().length < 5) {
      novosErros.documento = 'Documento inválido'
    }

    if (telefone && telefone.trim().length < 8) {
      novosErros.telefone = 'Telefone inválido'
    }

    if (endereco && endereco.trim().length < 5) {
      novosErros.endereco = 'Endereço muito curto'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const limparErro = (campo) => {
    if (erros[campo]) {
      setErros(prev => ({ ...prev, [campo]: null }))
    }
  }

  const salvarFornecedor = async () => {
    if (!validarCampos()) {
      Alert.alert('Atenção', 'Por favor, corrija os erros antes de continuar.')
      return
    }

    const novoFornecedor = {
      id,
      nome: nome.trim(),
      documento: documento.trim(),
      telefone: telefone.trim(),
      endereco: endereco.trim()
    }

    try {
      if (editando) {
        await editarFornecedor(novoFornecedor)
      } else {
        await adicionarFornecedor(novoFornecedor)
      }

      Alert.alert(
        'Sucesso!',
        editando ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor cadastrado com sucesso!',
        [{ text: 'OK', onPress: () => router.replace('/fornecedores') }]
      )
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error)
    }
  }

  return (
    <BaseLayout titulo={editando ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Feather name="truck" size={48} color={cores.primary} />
              <Text style={styles.titulo}>
                {editando ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </Text>
              <Text style={styles.subtitulo}>
                {editando
                  ? 'Atualize as informações do fornecedor'
                  : 'Preencha os dados do novo fornecedor'}
              </Text>
            </View>

            <View style={styles.formulario}>
              <View style={styles.campoContainer}>
                <Text style={styles.label}>Nome *</Text>
                <View style={[styles.inputContainer, erros.nome && styles.inputContainerErro]}>
                  <Feather name="user" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Fornecedor LTDA"
                    value={nome}
                    onChangeText={(text) => {
                      setNome(text)
                      limparErro('nome')
                    }}
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
                <Text style={styles.label}>Documento</Text>
                <View style={[styles.inputContainer, erros.documento && styles.inputContainerErro]}>
                  <Feather name="file-text" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 12345678900123"
                    value={documento}
                    onChangeText={(text) => {
                      setDocumento(text)
                      limparErro('documento')
                    }}
                    keyboardType="numeric"
                    placeholderTextColor={cores.gray500}
                  />
                </View>
                {erros.documento && (
                  <View style={styles.erroContainer}>
                    <Feather name="alert-circle" size={14} color={cores.error} />
                    <Text style={styles.erroTexto}>{erros.documento}</Text>
                  </View>
                )}
              </View>

              <View style={styles.campoContainer}>
                <Text style={styles.label}>Telefone</Text>
                <View style={[styles.inputContainer, erros.telefone && styles.inputContainerErro]}>
                  <Feather name="phone" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: (31) 99999-0000"
                    value={telefone}
                    onChangeText={(text) => {
                      setTelefone(text)
                      limparErro('telefone')
                    }}
                    keyboardType="phone-pad"
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
                <Text style={styles.label}>Endereço</Text>
                <View style={[styles.inputContainer, erros.endereco && styles.inputContainerErro]}>
                  <Feather name="map-pin" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Rua Exemplo, 123 - Bairro"
                    value={endereco}
                    onChangeText={(text) => {
                      setEndereco(text)
                      limparErro('endereco')
                    }}
                    placeholderTextColor={cores.gray500}
                  />
                </View>
                {erros.endereco && (
                  <View style={styles.erroContainer}>
                    <Feather name="alert-circle" size={14} color={cores.error} />
                    <Text style={styles.erroTexto}>{erros.endereco}</Text>
                  </View>
                )}
              </View>

              <View style={styles.botoesContainer}>
                <TouchableOpacity
                  style={styles.botaoSalvar}
                  onPress={salvarFornecedor}
                  disabled={carregando}
                  activeOpacity={0.8}
                >
                  {carregando ? (
                    <ActivityIndicator color={cores.white} size="small" />
                  ) : (
                    <>
                      <Feather name="check" size={20} color={cores.white} />
                      <Text style={styles.textoBotaoSalvar}>
                        {editando ? 'Atualizar' : 'Cadastrar'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoCancelar}
                  onPress={() => router.replace('/fornecedores')}
                  activeOpacity={0.8}
                >
                  <Feather name="x" size={20} color={cores.primary} />
                  <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: cores.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: cores.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: cores.gray600,
    textAlign: 'center',
    lineHeight: 22,
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
    backgroundColor: cores.white,
    borderWidth: 2,
    borderColor: cores.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 56,
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
    marginTop: 8,
  },
  erroTexto: {
    color: cores.error,
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  botoesContainer: {
    gap: 16,
    marginTop: 32,
    marginBottom: 20,
  },
  botaoSalvar: {
    backgroundColor: cores.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  textoBotaoSalvar: {
    color: cores.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  botaoCancelar: {
    backgroundColor: cores.white,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: cores.primary,
  },
  textoBotaoCancelar: {
    color: cores.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
})