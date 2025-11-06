import { Entypo, Feather } from '@expo/vector-icons'
import { format } from 'date-fns'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import StatusPedidos from '../../shared/StatusPedidos'

const ItemPedidos = ({ pedido, onEditar, onExcluir }) => {
  const formatarValor = (valor) => {
    const numero = typeof valor === 'number' ? valor : 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numero)
  }

  const formatarData = (dataISO) => {
    if (!dataISO) return ''
    try {
      return format(new Date(dataISO), 'dd/MM/yyyy')
    } catch {
      return ''
    }
  }

  return (
    <View style={styles.row}>
      <View style={styles.cellCliente}>
        <Text style={styles.nomeCliente}>{pedido.cliente}</Text>
        <Text style={styles.dataVenda}>{formatarData(pedido.dataVenda)}</Text>
      </View>
      <View style={styles.cellStatus}>
        <StatusPedidos status={pedido.status} />
      </View>
      <Text style={styles.cellValor}>{formatarValor(pedido.valor)}</Text>
      <View style={styles.cellAcoes}>
        <TouchableOpacity style={styles.botaoEditar} onPress={() => onEditar(pedido)}>
          <Feather name="edit" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoExcluir} onPress={() => onExcluir(pedido.id)}>
          <Entypo name="cross" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 6,
    borderRadius: 8,
    elevation: 1
  },
  cellCliente: {
    flex: 4,
    justifyContent: 'center'
  },
  nomeCliente: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold'
  },
  dataVenda: {
    fontSize: 12,
    color: '#999'
  },
  cellStatus: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    overflow: 'hidden'
  },
  cellValor: {
    flex: 3,
    fontSize: 14,
    textAlign: 'right',
    color: '#666'
  },
  cellAcoes: {
    flex: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10
  },
  botaoEditar: {
    backgroundColor: '#007bff',
    padding: 6,
    borderRadius: 4
  },
  botaoExcluir: {
    backgroundColor: '#dc3545',
    padding: 6,
    borderRadius: 4
  }
})

export default ItemPedidos