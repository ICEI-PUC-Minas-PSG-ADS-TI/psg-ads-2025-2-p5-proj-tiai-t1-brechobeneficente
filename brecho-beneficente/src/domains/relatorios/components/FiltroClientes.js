import { useRouter } from 'expo-router'
import { useContext, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { ClientesContext } from '../../../context/ClientesContext'
import { useRelatorioClientes } from '../../../context/relatorios/RelatorioClientesContext'
import AutoCompleteInput from '../../shared/AutoCompleteInput'
import BaseLayout from '../../shared/BaseLayout'

export default function FiltroClientes() {
  const [nome, setNome] = useState('')
  const [documento, setDocumento] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')

  const { aplicarFiltros } = useRelatorioClientes()
  const { clientes } = useContext(ClientesContext)
  const router = useRouter()

  const aplicarFiltro = () => {
    aplicarFiltros({ nome, documento, telefone, endereco })
    router.push('/relatorios/clientes/relatorio')
  }

  return (
    <BaseLayout titulo="Relatório de Clientes">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.field}>
          <Text style={styles.label}>Nome</Text>
          <AutoCompleteInput
            placeholder="Digite o nome do cliente"
            dados={clientes}
            campoChave="id"
            campoLabel="nome"
            valorInicial={nome}
            onSelecionar={(item) => setNome(item.nome)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Documento</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o CPF ou CNPJ"
            value={documento}
            onChangeText={setDocumento}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o telefone"
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={setTelefone}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Endereço</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o endereço"
            value={endereco}
            onChangeText={setEndereco}
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
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    fontSize: 16
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
})