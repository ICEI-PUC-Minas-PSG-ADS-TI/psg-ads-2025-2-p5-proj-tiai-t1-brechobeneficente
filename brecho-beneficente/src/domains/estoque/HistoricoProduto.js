import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useLocalSearchParams } from 'expo-router'
import { useContext, useMemo } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { EstoqueContext } from '../../../context/EstoqueContext'
import { ProdutosContext } from '../../../context/ProdutosContext'
import BaseLayout from '../../shared/BaseLayout'

const HistoricoProduto = () => {
  const { produtoId } = useLocalSearchParams()
  const id = produtoId?.toString?.()

  const { getMovimentacoesPorProduto } = useContext(EstoqueContext)
  const { produtos } = useContext(ProdutosContext)

  const produto = produtos.find(p => p.id == id)

  const movimentacoes = useMemo(() => {
    return getMovimentacoesPorProduto(id)
      .sort((a, b) => new Date(b.data) - new Date(a.data))
  }, [id, getMovimentacoesPorProduto])

  const formatarData = (dataISO) => {
    if (!dataISO) return '-'
    try {
      return format(new Date(dataISO), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    } catch {
      return '-'
    }
  }

  const renderItem = ({ item }) => (
    <View style={[
      styles.row,
      item.tipo == 'entrada' ? styles.fundoEntrada : styles.fundoSaida
    ]}>
      <Text style={[
        styles.quantidade,
        item.tipo == 'entrada' ? styles.entrada : styles.saida
      ]}>
        {(item.tipo == 'entrada' ? '+' : '-') + Number(item.quantidade || 0).toFixed(0)}
      </Text>
      <Text style={styles.origem}>{item.origem}</Text>
      <Text style={styles.data}>{formatarData(item.data)}</Text>
    </View>
  )

  return (
    <BaseLayout titulo="Histórico do Produto">
      <View style={styles.container}>
        {produto && (
          <Text style={styles.nomeProduto}>{produto.nome}</Text>
        )}

        <FlatList
          data={movimentacoes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhuma movimentação encontrada.</Text>
          }
        />
      </View>
    </BaseLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 8
  },
  nomeProduto: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333'
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    gap: 10
  },
  fundoEntrada: {
    backgroundColor: '#e8f5e9'
  },
  fundoSaida: {
    backgroundColor: '#fdecea'
  },
  quantidade: {
    width: 60,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left'
  },
  entrada: {
    color: '#28a745'
  },
  saida: {
    color: '#dc3545'
  },
  origem: {
    flex: 1,
    fontSize: 14,
    color: '#333'
  },
  data: {
    fontSize: 12,
    color: '#555'
  },
  vazio: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 20
  }
})

export default HistoricoProduto