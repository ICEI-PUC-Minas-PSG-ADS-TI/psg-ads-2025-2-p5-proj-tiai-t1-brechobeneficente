import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native'
import BaseLayout from '../shared/BaseLayout'
import cores from '../../constants/colors'

export default function ListaRelatorios() {
  const router = useRouter()

  const relatorios = [
    { label: 'Relatório de Vendas', path: '/relatorios/vendas/filtro', icon: 'shopping-cart', cor: cores.primary },
    { label: 'Relatório de Produtos', path: '/relatorios/produtos/filtro', icon: 'package', cor: cores.secondary },
    { label: 'Relatório de Clientes', path: '/relatorios/clientes/filtro', icon: 'users', cor: '#8B7355' },
    { label: 'Relatório de Doações', path: '/relatorios/doacoes/filtro', icon: 'heart', cor: '#D4A574' }
  ]

  return (
    <BaseLayout titulo="Relatórios">
      <ScrollView contentContainerStyle={styles.container}>
        {relatorios.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: item.cor }]}
            onPress={() => router.push(item.path)}
          >
            <Feather name={item.icon} size={24} color={cores.white} style={styles.icon} />
            <Text style={styles.cardText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </BaseLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40
  },
  card: {
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: cores.shadowColor,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5
  },
  icon: {
    marginRight: 12
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.white
  }
})