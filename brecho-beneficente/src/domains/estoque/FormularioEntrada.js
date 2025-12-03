import { router } from 'expo-router'
import { useContext, useState } from 'react'
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native'
import { EstoqueContext } from '../../../context/EstoqueContext'
import { ProdutosContext } from '../../../context/ProdutosContext'
import AutoCompleteInput from '../../shared/AutoCompleteInput'

const FormularioEntrada = () => {
  const { produtos } = useContext(ProdutosContext)
  const { registrarEntrada } = useContext(EstoqueContext)

  const [produtoNome, setProdutoNome] = useState('')
  const [produtoId, setProdutoId] = useState(null)
  const [quantidade, setQuantidade] = useState('')
  const [processando, setProcessando] = useState(false)

  const realizarEntrada = () => {
    const id = produtoId
    const qtd = parseInt(quantidade)

    if (!produtos.find(p => p.id === id)) {
      return Alert.alert('Erro', 'Selecione um produto válido')
    }
    if (isNaN(qtd) || qtd <= 0) {
      return Alert.alert('Erro', 'Quantidade inválida')
    }

    setProcessando(true)
    registrarEntrada({
      produtoId: id,
      quantidade: qtd,
      origem: 'Entrada manual'
    })

    Alert.alert('Sucesso', 'Entrada registrada com sucesso')
    router.back()
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <AutoCompleteInput
            label="Produto"
            placeholder="Digite o nome do produto"
            dados={produtos}
            campoChave="id"
            campoLabel="nome"
            valorInicial={produtoNome}
            onSelecionar={(produto) => {
              setProdutoId(produto.id)
              setProdutoNome(produto.nome)
            }}
          />

          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a quantidade"
            keyboardType="numeric"
            value={quantidade}
            onChangeText={setQuantidade}
          />

          <TouchableOpacity
            style={[styles.botao, processando && styles.botaoDesativado]}
            onPress={realizarEntrada}
            disabled={processando}
          >
            <Text style={styles.botaoTexto}>
              {processando ? 'Registrando...' : 'Registrar entrada'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 10
  },
  botao: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center'
  },
  botaoDesativado: {
    backgroundColor: '#6cb2eb'
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold'
  }
})

export default FormularioEntrada