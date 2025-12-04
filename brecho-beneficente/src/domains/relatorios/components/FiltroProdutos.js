import { useRouter } from 'expo-router'
import { useContext } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { ProdutosContext } from '../../../context/ProdutosContext'
import { useRelatorioProdutos } from '../../../context/relatorios/RelatorioProdutosContext'
import AutoCompleteInput from '../../shared/AutoCompleteInput'
import BaseLayout from '../../shared/BaseLayout'

export default function FiltroProdutos() {
  const { filtros, setFiltros, aplicarFiltros } = useRelatorioProdutos()
  const { produtos } = useContext(ProdutosContext)
  const router = useRouter()

  const aplicar = () => {
    aplicarFiltros(filtros)
    router.push('/relatorios/produtos/relatorio')
  }

  return (
    <BaseLayout titulo="Relatório de Produtos">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.field}>
          <Text style={styles.label}>Nome</Text>
          <AutoCompleteInput
            placeholder="Nome do produto"
            dados={produtos}
            campoChave="id"
            campoLabel="nome"
            valorInicial={filtros.nome || ''}
            onSelecionar={(item) =>
              setFiltros((prev) => ({ ...prev, nome: item.nome }))
            }
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Código</Text>
          <TextInput
            style={styles.input}
            placeholder="Código do produto"
            value={filtros.codigo || ''}
            onChangeText={(text) =>
              setFiltros((prev) => ({ ...prev, codigo: text }))
            }
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={aplicar}>
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