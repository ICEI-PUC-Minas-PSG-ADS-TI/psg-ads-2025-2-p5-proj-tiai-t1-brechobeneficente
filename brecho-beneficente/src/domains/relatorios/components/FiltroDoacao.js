import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useRelatorioDoacao } from '../../../context/relatorios/RelatorioDoacoesContext'
import BaseLayout from '../../shared/BaseLayout'
import cores from '../../../constants/colors'

export default function FiltroDoacao() {
  const [categoria, setCategoria] = useState('')
  const [status, setStatus] = useState('')
  const [tipo, setTipo] = useState('')
  const [valorMin, setValorMin] = useState('')
  const [valorMax, setValorMax] = useState('')

  const { aplicarFiltros } = useRelatorioDoacao()
  const router = useRouter()

  const aplicarFiltro = () => {
    aplicarFiltros({ categoria, status, tipo, valorMin, valorMax })
    router.push('/relatorios/doacoes/relatorio')
  }

  return (
    <BaseLayout titulo="Relatório de Doações">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.field}>
          <Text style={styles.label}>Categoria</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a categoria"
            value={categoria}
            onChangeText={setCategoria}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Status</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o status"
            value={status}
            onChangeText={setStatus}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tipo</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o tipo"
            value={tipo}
            onChangeText={setTipo}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Valor Mínimo</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o valor mínimo"
            keyboardType="numeric"
            value={valorMin}
            onChangeText={setValorMin}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Valor Máximo</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o valor máximo"
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
    color: cores.text,
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