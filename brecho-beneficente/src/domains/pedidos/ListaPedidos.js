import React, { useEffect } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'
import { usePedidos } from '../../context/PedidosContext'

const ListaPedidos = () => {
  const router = useRouter()
  const {
    pedidos,
    carregando,
    carregarPedidos,
    excluirPedido,
    finalizarPedido,
    cancelarPedido,
    totalPedidos,
    pedidosPendentes,
    pedidosFinalizados,
    totalVendas
  } = usePedidos()

  useEffect(() => {
    carregarPedidos()
  }, [])

  const confirmarExclusao = (pedido) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o pedido de "${pedido.nomeCliente}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: () => excluirPedido(pedido.id),
          style: 'destructive'
        }
      ]
    )
  }

  const confirmarFinalizacao = (pedido) => {
    Alert.alert(
      'Finalizar Pedido',
      `Deseja finalizar o pedido de "${pedido.nomeCliente}"?\nTotal: R$ ${pedido.total?.toFixed(2)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: () => finalizarPedido(pedido.id)
        }
      ]
    )
  }

  const confirmarCancelamento = (pedido) => {
    Alert.alert(
      'Cancelar Pedido',
      `Deseja cancelar o pedido de "${pedido.nomeCliente}"?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Cancelar Pedido',
          onPress: () => cancelarPedido(pedido.id),
          style: 'destructive'
        }
      ]
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return cores.warning
      case 'finalizado': return cores.success
      case 'cancelado': return cores.error
      default: return cores.gray500
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pendente': return 'Pendente'
      case 'finalizado': return 'Finalizado'
      case 'cancelado': return 'Cancelado'
      default: return status
    }
  }

  const formatarData = (data) => {
    if (!data) return 'Data inválida'
    const dataObj = data instanceof Date ? data : new Date(data)
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderItem = ({ item: pedido }) => (
    <View style={styles.pedidoCard}>
      <View style={styles.pedidoHeader}>
        <View style={styles.clienteInfo}>
          <Text style={styles.nomeCliente}>{pedido.nomeCliente}</Text>
          <Text style={styles.dataPedido}>{formatarData(pedido.criadoEm)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pedido.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(pedido.status)}</Text>
        </View>
      </View>

      <View style={styles.pedidoDetalhes}>
        <Text style={styles.totalPedido}>
          Total: R$ {pedido.total?.toFixed(2) || '0,00'}
        </Text>
        <Text style={styles.qtdItens}>
          {pedido.itens?.length || 0} item(ns)
        </Text>
        {pedido.telefoneCliente && (
          <Text style={styles.telefone}>
            Tel: {pedido.telefoneCliente.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
          </Text>
        )}
      </View>

      {pedido.observacoes && (
        <Text style={styles.observacoes} numberOfLines={2}>
          Obs: {pedido.observacoes}
        </Text>
      )}

      <View style={styles.acoes}>
        {pedido.status === 'pendente' && (
          <>
            <TouchableOpacity
              style={[styles.botaoAcao, { backgroundColor: cores.success }]}
              onPress={() => confirmarFinalizacao(pedido)}
            >
              <Feather name="check" size={16} color={cores.white} />
              <Text style={styles.textoBotao}>Finalizar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botaoAcao, { backgroundColor: cores.primary }]}
              onPress={() => router.push(`/pedidos/form?id=${pedido.id}`)}
            >
              <Feather name="edit" size={16} color={cores.white} />
              <Text style={styles.textoBotao}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botaoAcao, { backgroundColor: cores.warning }]}
              onPress={() => confirmarCancelamento(pedido)}
            >
              <Feather name="x" size={16} color={cores.white} />
              <Text style={styles.textoBotao}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}

        {pedido.status !== 'finalizado' && (
          <TouchableOpacity
            style={[styles.botaoAcao, { backgroundColor: cores.error }]}
            onPress={() => confirmarExclusao(pedido)}
          >
            <Feather name="trash-2" size={16} color={cores.white} />
            <Text style={styles.textoBotao}>Excluir</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.botaoAcao, { backgroundColor: cores.gray500 }]}
          onPress={() => router.push(`/pedidos/form?id=${pedido.id}&readonly=true`)}
        >
          <Feather name="eye" size={16} color={cores.white} />
          <Text style={styles.textoBotao}>Ver</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.estatisticas}>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaNumero}>{totalPedidos}</Text>
          <Text style={styles.estatisticaLabel}>Total</Text>
        </View>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaNumero}>{pedidosPendentes}</Text>
          <Text style={styles.estatisticaLabel}>Pendentes</Text>
        </View>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaNumero}>{pedidosFinalizados}</Text>
          <Text style={styles.estatisticaLabel}>Finalizados</Text>
        </View>
        <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaNumero}>R$ {totalVendas.toFixed(2)}</Text>
          <Text style={styles.estatisticaLabel}>Vendas</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.botaoNovo}
        onPress={() => router.push('/pedidos/form')}
      >
        <Feather name="plus" size={20} color={cores.white} />
        <Text style={styles.textoBotaoNovo}>Novo Pedido</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <BaseLayout titulo="Pedidos" scrollable={false}>
      <FlatList
        data={pedidos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshing={carregando}
        onRefresh={carregarPedidos}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="shopping-cart" size={64} color={cores.gray400} />
            <Text style={styles.emptyText}>Nenhum pedido cadastrado</Text>
            <Text style={styles.emptySubtext}>Toque em "Novo Pedido" para começar</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </BaseLayout>
  )
}

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
  },
  header: {
    marginBottom: 20,
  },
  estatisticas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: cores.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  estatisticaItem: {
    alignItems: 'center',
    flex: 1,
  },
  estatisticaNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.primary,
    marginBottom: 4,
  },
  estatisticaLabel: {
    fontSize: 12,
    color: cores.gray600,
    textAlign: 'center',
  },
  botaoNovo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primary,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textoBotaoNovo: {
    color: cores.white,
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  pedidoCard: {
    backgroundColor: cores.white,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: cores.primary,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clienteInfo: {
    flex: 1,
  },
  nomeCliente: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.text,
    marginBottom: 4,
  },
  dataPedido: {
    fontSize: 12,
    color: cores.gray600,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: cores.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  pedidoDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  totalPedido: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.primary,
  },
  qtdItens: {
    fontSize: 14,
    color: cores.gray600,
  },
  telefone: {
    fontSize: 12,
    color: cores.gray600,
    marginTop: 4,
  },
  observacoes: {
    fontSize: 14,
    color: cores.gray700,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  acoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  botaoAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  textoBotao: {
    color: cores.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: cores.gray600,
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: cores.gray500,
    marginTop: 8,
    textAlign: 'center',
  },
})

export default ListaPedidos