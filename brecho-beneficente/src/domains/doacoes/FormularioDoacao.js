import React, { useContext, useState } from 'react'
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
import { useRouter } from 'expo-router'
import { DoacoesContext } from '../../context/DoacoesContext'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'

// 🔹 Função para formatar o valor em reais
const formatarParaReal = (valor) => {
  if (!valor) return ''
  const num = valor.replace(/\D/g, '')
  if (!num) return 'R$ 0,00'
  const numero = (parseInt(num, 10) / 100).toFixed(2)
  return 'R$ ' + numero.replace('.', ',')
}

export default function FormularioDoacao() {
  const router = useRouter()
  const { adicionarDoacao, atualizarDoacao, doacaoSelecionada, carregando } = useContext(DoacoesContext)

  const [nomeDoador, setNomeDoador] = useState(doacaoSelecionada?.nomeDoador || '')
  const [itens, setItens] = useState(doacaoSelecionada?.itens || '')
  const [valor, setValor] = useState(
    doacaoSelecionada?.valor ? formatarParaReal(doacaoSelecionada.valor.toString()) : ''
  )
  const [imagem, setImagem] = useState(doacaoSelecionada?.imagem || null)
  const [editando, setEditando] = useState(!!doacaoSelecionada)

  const validarCampos = () => {
    if (!nomeDoador.trim()) {
      Alert.alert('Atenção', 'O nome do doador é obrigatório.')
      return false
    }
    return true
  }

  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos da permissão para acessar suas imagens.')
      return
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.8,
    })

    if (!resultado.canceled) {
      setImagem(resultado.assets[0].uri)
    }
  }

  const handleSalvar = async () => {
    if (!validarCampos()) return

    const valorNumerico = parseFloat(valor.replace(/\D/g, '')) / 100 || 0

    const novaDoacao = {
      nomeDoador,
      itens,
      valor: valorNumerico,
      imagem, 
    }

    try {
      if (editando) {
        await atualizarDoacao(doacaoSelecionada.id, novaDoacao)
      } else {
        await adicionarDoacao(novaDoacao)
      }

      Alert.alert(
        'Sucesso!',
        editando ? 'Doação atualizada com sucesso!' : 'Doação cadastrada com sucesso!',
        [{ text: 'OK', onPress: () => router.replace('/doacoes') }]
      )
    } catch (error) {
      console.error(error)
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
            
            {/* 🔹 Cabeçalho */}
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

            {/* 🔸 Formulário */}
            <View style={styles.formulario}>
              
              {/* Campo de imagem */}
              <View style={styles.campoContainer}>
                <Text style={styles.label}>Imagem da Doação</Text>
                {imagem ? (
                  <Image source={{ uri: imagem }} style={styles.previewImagem} />
                ) : (
                  <View style={styles.placeholderImagem}>
                    <Feather name="image" size={40} color={cores.gray400} />
                    <Text style={styles.textoPlaceholder}>Nenhuma imagem selecionada</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.botaoImagem} onPress={escolherImagem}>
                  <Feather name="upload" size={20} color={cores.white} />
                  <Text style={styles.textoBotaoImagem}>Selecionar Imagem</Text>
                </TouchableOpacity>
              </View>

              {/* Nome do doador */}
              <View style={styles.campoContainer}>
                <Text style={styles.label}>Nome do Doador *</Text>
                <View style={styles.inputContainer}>
                  <Feather name="user" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: João Silva"
                    value={nomeDoador}
                    onChangeText={setNomeDoador}
                    placeholderTextColor={cores.gray500}
                  />
                </View>
              </View>

              {/* Itens */}
              <View style={styles.campoContainer}>
                <Text style={styles.label}>Itens Doado(s)</Text>
                <View style={styles.inputContainer}>
                  <Feather name="gift" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Camisa, Short..."
                    value={itens}
                    onChangeText={setItens}
                    placeholderTextColor={cores.gray500}
                  />
                </View>
              </View>

              {/* Valor */}
              <View style={styles.campoContainer}>
                <Text style={styles.label}>Valor Estimado (opcional)</Text>
                <View style={styles.inputContainer}>
                  <Feather name="dollar-sign" size={20} color={cores.gray500} />
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="R$ 0,00"
                    value={valor}
                    onChangeText={(texto) => setValor(formatarParaReal(texto))}
                    placeholderTextColor={cores.gray500}
                  />
                </View>
              </View>

              {/* 🔘 Botões */}
              <View style={styles.botoesContainer}>
                <TouchableOpacity
                  style={styles.botaoSalvar}
                  onPress={handleSalvar}
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
  input: {
    flex: 1,
    fontSize: 16,
    color: cores.text,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  previewImagem: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  placeholderImagem: {
    height: 180,
    borderRadius: 12,
    backgroundColor: cores.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  textoPlaceholder: {
    marginTop: 6,
    color: cores.gray500,
  },
  botaoImagem: {
    backgroundColor: cores.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 12,
  },
  textoBotaoImagem: {
    color: cores.white,
    fontWeight: 'bold',
    marginLeft: 8,
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
