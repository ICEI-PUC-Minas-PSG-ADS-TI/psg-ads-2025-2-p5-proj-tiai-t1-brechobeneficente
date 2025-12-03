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
import { ProdutosContext } from '../../context/ProdutosContext'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'

export default function FormularioProduto() {
  const router = useRouter()
  const { produto } = useLocalSearchParams()
  const { adicionarProduto, editarProduto, carregando } = useContext(ProdutosContext)

  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [valorCusto, setValorCusto] = useState('R$ 0,00')
  const [valorVenda, setValorVenda] = useState('R$ 0,00')
  const [erros, setErros] = useState({})
  const [editando, setEditando] = useState(false)
  const [id, setId] = useState(null)

  useEffect(() => {
    try {
      if (produto && typeof produto === 'string' && produto.includes('{')) {
        const obj = JSON.parse(produto)
        setEditando(true)
        setId(obj.id)
        setCodigo(obj.codigo || '')
        setNome(obj.nome || '')
        setQuantidade(obj.quantidade?.toString() || '')
        setValorCusto(formatarNumeroParaMoeda(obj.valorCusto || 0))
        setValorVenda(formatarNumeroParaMoeda(obj.valorVenda || 0))
      }
    } catch (e) {
      console.error('Erro ao carregar produto para edição:', e)
    }
  }, [produto])

  const formatarParaReal = (valor) => {
    const somenteNumeros = valor.toString().replace(/[^\d]/g, '')
    const valorNumerico = parseFloat(somenteNumeros) / 100
    return valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const formatarNumeroParaMoeda = (valor) => {
    const numero = Number(valor)
    if (isNaN(numero)) return 'R$ 0,00'
    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }


  const validarCampos = () => {
    const novosErros = {}

    if (!codigo.trim()) {
      novosErros.codigo = 'Código é obrigatório'
    } else if (codigo.trim().length < 2) {
      novosErros.codigo = 'Código deve ter pelo menos 2 caracteres'
    }

    if (!nome.trim()) {
      novosErros.nome = 'Nome é obrigatório'
    } else if (nome.trim().length < 3) {
      novosErros.nome = 'Nome deve ter pelo menos 3 caracteres'
    }

    if (!quantidade || isNaN(quantidade) || Number(quantidade) < 0) {
      novosErros.quantidade = 'Quantidade deve ser um número válido'
    }

    const valorCustoNumerico = Number((valorCusto || '').replace(/\D/g, '')) / 100
    if (valorCustoNumerico <= 0) {
      novosErros.valorCusto = 'Valor de custo deve ser maior que zero'
    }

    const valorVendaNumerico = Number((valorVenda || '').replace(/\D/g, '')) / 100
    if (valorVendaNumerico <= 0) {
      novosErros.valorVenda = 'Valor de venda deve ser maior que zero'
    } else if (valorVendaNumerico <= valorCustoNumerico) {
      novosErros.valorVenda = 'Valor de venda deve ser maior que o custo'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const limparErro = (campo) => {
    if (erros[campo]) {
      setErros(prev => ({ ...prev, [campo]: null }))
    }
  }

  const salvarProduto = async () => {
    if (!validarCampos()) {
      Alert.alert('Atenção', 'Por favor, corrija os erros antes de continuar.')
      return
    }

    const novoProduto = {
      id,
      codigo: codigo.trim(),
      nome: nome.trim(),
      quantidade: Number(quantidade),
      valorCusto: Number((valorCusto || '').replace(/\D/g, '')) / 100,
      valorVenda: Number((valorVenda || '').replace(/\D/g, '')) / 100
    }

    try {
      if (editando) {
        await editarProduto(novoProduto)
      } else {
        await adicionarProduto(novoProduto)
      }

      Alert.alert(
        'Sucesso!',
        editando ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!',
        [{ text: 'OK', onPress: () => router.replace('/produtos') }]
      )
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
    }
  }

  return (
    <BaseLayout titulo={editando ? 'Editar Produto' : 'Cadastrar Produto'}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

            <View style={styles.header}>
              <Feather name="package" size={48} color={cores.primary} />
              <Text style={styles.titulo}>
                {editando ? 'Editar Produto' : 'Novo Produto'}
              </Text>
              <Text style={styles.subtitulo}>
                {editando ? 'Atualize as informações do produto' : 'Preencha os dados do novo produto'}
              </Text>
            </View>

            <View style={styles.formulario}>
              <View style={styles.campoContainer}>
                <Text style={styles.label}>Código *</Text>
                <View style={[styles.inputContainer, erros.codigo && styles.inputContainerErro]}>
                  <Feather name="hash" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: PRD001"
                    value={codigo}
                    onChangeText={(text) => {
                      setCodigo(text)
                      limparErro('codigo')
                    }}
                    placeholderTextColor={cores.gray500}
                  />
                </View>
                {erros.codigo && (
                  <View style={styles.erroContainer}>
                    <Feather name="alert-circle" size={14} color={cores.error} />
                    <Text style={styles.erroTexto}>{erros.codigo}</Text>
                  </View>
                )}
              </View>

              <View style={styles.campoContainer}>
                <Text style={styles.label}>Nome do Produto *</Text>
                <View style={[styles.inputContainer, erros.nome && styles.inputContainerErro]}>
                  <Feather name="tag" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Camiseta Polo"
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
                <Text style={styles.label}>Quantidade em Estoque</Text>
                <View style={[styles.inputContainer, erros.quantidade && styles.inputContainerErro]}>
                  <Feather name="layers" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 10"
                    value={quantidade}
                    onChangeText={(text) => {
                      setQuantidade(text)
                      limparErro('quantidade')
                    }}
                    keyboardType="numeric"
                    placeholderTextColor={cores.gray500}
                  />
                </View>
                {erros.quantidade && (
                  <View style={styles.erroContainer}>
                    <Feather name="alert-circle" size={14} color={cores.error} />
                    <Text style={styles.erroTexto}>{erros.quantidade}</Text>
                  </View>
                )}
              </View>

              <View style={styles.campoContainer}>
                <Text style={styles.label}>Valor de Custo *</Text>
                <View style={[styles.inputContainer, erros.valorCusto && styles.inputContainerErro]}>
                  <Feather name="trending-down" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    placeholder="R$ 0,00"
                    value={valorCusto}
                    onChangeText={(texto) => {
                      setValorCusto(formatarParaReal(texto))
                      limparErro('valorCusto')
                    }}
                    keyboardType="numeric"
                    placeholderTextColor={cores.gray500}
                  />
                </View>
                {erros.valorCusto && (
                  <View style={styles.erroContainer}>
                    <Feather name="alert-circle" size={14} color={cores.error} />
                    <Text style={styles.erroTexto}>{erros.valorCusto}</Text>
                  </View>
                )}
              </View>

              <View style={styles.campoContainer}>
                <Text style={styles.label}>Valor de Venda *</Text>
                <View style={[styles.inputContainer, erros.valorVenda && styles.inputContainerErro]}>
                  <Feather name="trending-up" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    placeholder="R$ 0,00"
                    value={valorVenda}
                    onChangeText={(texto) => {
                      setValorVenda(formatarParaReal(texto))
                      limparErro('valorVenda')
                    }}
                    keyboardType="numeric"
                    placeholderTextColor={cores.gray500}
                  />
                </View>
                {erros.valorVenda && (
                  <View style={styles.erroContainer}>
                    <Feather name="alert-circle" size={14} color={cores.error} />
                    <Text style={styles.erroTexto}>{erros.valorVenda}</Text>
                  </View>
                )}
              </View>

              <View style={styles.botoesContainer}>
                <TouchableOpacity
                  style={styles.botaoSalvar}
                  onPress={salvarProduto}
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
                  onPress={() => router.replace('/produtos')}
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