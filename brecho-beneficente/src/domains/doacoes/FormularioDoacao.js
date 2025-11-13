import { useLocalSearchParams, useRouter } from 'expo-router'
import { useContext, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
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
import * as ImagePicker from 'expo-image-picker'
import { Feather } from '@expo/vector-icons'
import { DoacoesContext } from '../../context/DoacoesContext'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'

export default function FormularioDoacao() {
  const router = useRouter()
  const { doacao } = useLocalSearchParams()
  const { adicionarDoacao, atualizarDoacao, carregando } = useContext(DoacoesContext)

  const [id, setId] = useState(null)
  const [nomeDoador, setNomeDoador] = useState('')
  const [item, setItem] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [valor, setValor] = useState('R$ 0,00')
  const [imagem, setImagem] = useState(null)
  const [editando, setEditando] = useState(false)
  const [erros, setErros] = useState({})

  // --- FORMATAÇÃO DE VALOR ---
  const formatarParaReal = (valor) => {
    const somenteNumeros = valor.toString().replace(/[^\d]/g, '')
    const valorNumerico = parseFloat(somenteNumeros) / 100
    return valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  // --- CARREGAR DADOS PARA EDIÇÃO ---
  useEffect(() => {
    try {
      if (doacao && typeof doacao === 'string' && doacao.includes('{')) {
        const obj = JSON.parse(doacao)
        setEditando(true)
        setId(obj.id)
        setNomeDoador(obj.nomeDoador || '')
        setItem(obj.item || '')
        setQuantidade(obj.quantidade?.toString() || '')
        setValor(obj.valor ? formatarParaReal(obj.valor) : 'R$ 0,00')
        setImagem(obj.imagem || null)
      }
    } catch (e) {
      console.error('Erro ao carregar doação para edição:', e)
    }
  }, [doacao])

  // --- VALIDAÇÃO ---
  const validarCampos = () => {
    const novosErros = {}

    if (!nomeDoador.trim()) {
      novosErros.nomeDoador = 'Nome do doador é obrigatório'
    }

    if (!item.trim()) {
      novosErros.item = 'Item doado é obrigatório'
    }

    if (!quantidade || isNaN(quantidade) || Number(quantidade) <= 0) {
      novosErros.quantidade = 'Quantidade deve ser um número válido'
    }

    const valorNumerico = Number((valor || '').replace(/\D/g, '')) / 100
    if (valorNumerico <= 0) {
      novosErros.valor = 'Valor estimado deve ser maior que zero'
    }

    if (!imagem) {
      novosErros.imagem = 'Selecione uma imagem para a doação'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const limparErro = (campo) => {
    if (erros[campo]) {
      setErros(prev => ({ ...prev, [campo]: null }))
    }
  }

  // --- ESCOLHER IMAGEM ---
  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos da permissão para acessar suas imagens.')
      return
    }

    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.8
      })

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        setImagem(resultado.assets[0].uri)
        limparErro('imagem')
      }
    } catch (e) {
      console.error('Erro ao selecionar imagem:', e)
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.')
    }
  }

  // --- SALVAR OU ATUALIZAR ---
  const salvarDoacao = async () => {
    if (!validarCampos()) {
      Alert.alert('Atenção', 'Por favor, corrija os erros antes de continuar.')
      return
    }

    const valorNumerico = Number((valor || '').replace(/\D/g, '')) / 100

    const novaDoacao = {
      id,
      nomeDoador: nomeDoador.trim(),
      item: item.trim(),
      quantidade: Number(quantidade),
      valor: valorNumerico,
      imagem
    }

    try {
      if (editando) {
        await atualizarDoacao(id, novaDoacao)
        Alert.alert('Sucesso!', 'Doação atualizada com sucesso!', [
          { text: 'OK', onPress: () => router.replace('/doacoes') }
        ])
      } else {
        await adicionarDoacao(novaDoacao)
        Alert.alert('Sucesso!', 'Doação cadastrada com sucesso!', [
          { text: 'OK', onPress: () => router.replace('/doacoes') }
        ])
      }
    } catch (error) {
      console.error('Erro ao salvar doação:', error)
      Alert.alert('Erro', 'Não foi possível salvar a doação.')
    }
  }

  return (
    <BaseLayout titulo={editando ? 'Editar Doação' : 'Cadastrar Doação'}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Feather name="heart" size={48} color={cores.primary} />
              <Text style={styles.titulo}>
                {editando ? 'Editar Doação' : 'Nova Doação'}
              </Text>
              <Text style={styles.subtitulo}>
                {editando
                  ? 'Atualize as informações da doação'
                  : 'Preencha os dados da nova doação'}
              </Text>
            </View>

            {/* IMAGEM */}
            <View style={styles.campoContainer}>
              <Text style={styles.label}>Imagem da Doação *</Text>
              {imagem ? (
                <Image source={{ uri: imagem }} style={styles.previewImagem} />
              ) : (
                <View style={[styles.placeholderImagem, erros.imagem && styles.inputContainerErro]}>
                  <Feather name="image" size={40} color={cores.gray400} />
                  <Text style={styles.textoPlaceholder}>Nenhuma imagem selecionada</Text>
                </View>
              )}
              <TouchableOpacity style={styles.botaoImagem} onPress={escolherImagem}>
                <Feather name="upload" size={20} color={cores.white} />
                <Text style={styles.textoBotaoImagem}>Selecionar Imagem</Text>
              </TouchableOpacity>
              {erros.imagem && (
                <View style={styles.erroContainer}>
                  <Feather name="alert-circle" size={14} color={cores.error} />
                  <Text style={styles.erroTexto}>{erros.imagem}</Text>
                </View>
              )}
            </View>

            {/* CAMPOS */}
            {[
              {
                label: 'Nome do Doador *',
                icon: 'user',
                value: nomeDoador,
                setter: setNomeDoador,
                erro: erros.nomeDoador,
                campo: 'nomeDoador',
                placeholder: 'Ex: João Silva'
              },
              {
                label: 'Item Doado *',
                icon: 'gift',
                value: item,
                setter: setItem,
                erro: erros.item,
                campo: 'item',
                placeholder: 'Ex: Camisa, Calça...'
              }
            ].map((f) => (
              <View key={f.campo} style={styles.campoContainer}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={[styles.inputContainer, f.erro && styles.inputContainerErro]}>
                  <Feather name={f.icon} size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    value={f.value}
                    onChangeText={(text) => {
                      f.setter(text)
                      limparErro(f.campo)
                    }}
                    placeholderTextColor={cores.gray500}
                  />
                </View>
                {f.erro && (
                  <View style={styles.erroContainer}>
                    <Feather name="alert-circle" size={14} color={cores.error} />
                    <Text style={styles.erroTexto}>{f.erro}</Text>
                  </View>
                )}
              </View>
            ))}

            {/* QUANTIDADE */}
            <View style={styles.campoContainer}>
              <Text style={styles.label}>Quantidade *</Text>
              <View style={[styles.inputContainer, erros.quantidade && styles.inputContainerErro]}>
                <Feather name="layers" size={20} color={cores.gray500} />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Ex: 1"
                  value={quantidade}
                  onChangeText={(text) => {
                    setQuantidade(text)
                    limparErro('quantidade')
                  }}
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

            {/* VALOR */}
            <View style={styles.campoContainer}>
              <Text style={styles.label}>Valor Estimado *</Text>
              <View style={[styles.inputContainer, erros.valor && styles.inputContainerErro]}>
                <Feather name="dollar-sign" size={20} color={cores.gray500} />
                <TextInput
                  style={styles.input}
                  placeholder="R$ 0,00"
                  value={valor}
                  onChangeText={(texto) => {
                    setValor(formatarParaReal(texto))
                    limparErro('valor')
                  }}
                  keyboardType="numeric"
                  placeholderTextColor={cores.gray500}
                />
              </View>
              {erros.valor && (
                <View style={styles.erroContainer}>
                  <Feather name="alert-circle" size={14} color={cores.error} />
                  <Text style={styles.erroTexto}>{erros.valor}</Text>
                </View>
              )}
            </View>

            {/* BOTÕES */}
            <View style={styles.botoesContainer}>
              <TouchableOpacity
                style={styles.botaoSalvar}
                onPress={salvarDoacao}
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
                onPress={() => router.replace('/doacoes')}
                activeOpacity={0.8}
              >
                <Feather name="x" size={20} color={cores.primary} />
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </BaseLayout>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: cores.background },
  header: { alignItems: 'center', marginBottom: 32, paddingVertical: 20 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: cores.text, marginTop: 16, marginBottom: 8 },
  subtitulo: { fontSize: 16, color: cores.gray600, textAlign: 'center', lineHeight: 22 },
  campoContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: cores.text, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.white,
    borderWidth: 2,
    borderColor: cores.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56
  },
  inputContainerErro: { borderColor: cores.error },
  input: { flex: 1, fontSize: 16, color: cores.text, paddingVertical: 12, paddingHorizontal: 12 },
  previewImagem: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10 },
  placeholderImagem: {
    height: 180,
    borderRadius: 12,
    backgroundColor: cores.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  textoPlaceholder: { marginTop: 6, color: cores.gray500 },
  botaoImagem: {
    backgroundColor: cores.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 12
  },
  textoBotaoImagem: { color: cores.white, fontWeight: 'bold', marginLeft: 8 },
  botoesContainer: { gap: 16, marginTop: 32, marginBottom: 20 },
  botaoSalvar: {
    backgroundColor: cores.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textoBotaoSalvar: { color: cores.white, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  botaoCancelar: {
    backgroundColor: cores.white,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: cores.primary
  },
  textoBotaoCancelar: { color: cores.primary, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  erroContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  erroTexto: { color: cores.error, fontSize: 14, marginLeft: 6, fontWeight: '500' }
})
