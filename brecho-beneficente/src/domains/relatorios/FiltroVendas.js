import { useRouter } from 'expo-router'
import { useState, useContext } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { ClientesContext } from '../../../context/ClientesContext'
import { FormasPagamentoContext } from '../../context/FormasPagamentoContext'
import { ProdutosContext } from '../../../context/ProdutosContext'
import { useRelatorioVendas } from '../../context/relatorios/RelatorioVendasContext'
import AutoCompleteInput from '../shared/AutoCompleteInput'
import BaseLayout from '../shared/BaseLayout'
import cores from '../../constants/colors'

export default function FiltroVendas() {
  const [cliente, setCliente] = useState('')
  const [produto, setProduto] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [valorMin, setValorMin] = useState('')
  const [valorMax, setValorMax] = useState('')

  const { aplicarFiltros } = useRelatorioVendas()
  const { clientes } = useContext(ClientesContext)
  const { produtos } = useContext(ProdutosContext)
  const { formasPagamento } = useContext(FormasPagamentoContext)
  const router = useRouter()

  const aplicarFiltro = () => {
    aplicarFiltros({ 
      cliente, 
      produto, 
      formaPagamento,
      valorMin,
      valorMax
    })
    router.push('/relatorios/vendas/relatorio')
  }

  return (
    <BaseLayout titulo="Filtros - Relatório de Vendas">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.field}>
          <Text style={styles.label}>Cliente</Text>
          <AutoCompleteInput
            placeholder="Digite o nome do cliente"
            dados={clientes}
            campoChave="id"
            campoLabel="nome"
            valorInicial={cliente}
            onSelecionar={(item) => setCliente(item?.nome || '')}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Produto</Text>
          <AutoCompleteInput
            placeholder="Digite o nome do produto"
            dados={produtos}
            campoChave="id"
            campoLabel="nome"
            valorInicial={produto}
            onSelecionar={(item) => setProduto(item?.nome || '')}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Forma de Pagamento</Text>
          <AutoCompleteInput
            placeholder="Selecione a forma de pagamento"
            dados={formasPagamento}
            campoChave="id"
            campoLabel="nome"
            valorInicial={formaPagamento}
            onSelecionar={(item) => setFormaPagamento(item?.nome || '')}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Valor Mínimo (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            keyboardType="numeric"
            value={valorMin}
            onChangeText={setValorMin}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Valor Máximo (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="9999,99"
            keyboardType="numeric"
            value={valorMax}
            onChangeText={setValorMax}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={aplicarFiltro}>
          <Text style={styles.buttonText}>Aplicar Filtros</Text>
        </TouchableOpacity>
      </ScrollView>
    </BaseLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40
  },
  field: {
    marginBottom: 16
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
    color: cores.text
  },
  input: {
    borderWidth: 1,
    borderColor: cores.border || '#ccc',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: cores.white
  },
  button: {
    backgroundColor: cores.primary,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20
  },
  buttonText: {
    color: cores.white,
    fontWeight: 'bold',
    fontSize: 16
  }
})