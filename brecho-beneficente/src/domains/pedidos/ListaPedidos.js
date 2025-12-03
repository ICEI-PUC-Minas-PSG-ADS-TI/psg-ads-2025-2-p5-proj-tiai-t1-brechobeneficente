import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native'
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
    editarPedido,
    totalPedidos,
    pedidosPendentes,
    pedidosFinalizados,
    pedidosCancelados,
  } = usePedidos()

  const [modalStatusVisivel, setModalStatusVisivel] = useState(false)
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)

  useEffect(() => {
    carregarPedidos()
  }, [])

  const statusOptions = [
    { value: 'pendente', label: 'Pendente', icon: 'clock', color: cores.warning },
    { value: 'finalizado', label: 'Finalizado', icon: 'check-circle', color: cores.success },
    { value: 'cancelado', label: 'Cancelado', icon: 'x-circle', color: cores.error }
  ]

  const abrirModalStatus = (pedido) => {
    setPedidoSelecionado(pedido)
    setModalStatusVisivel(true)
  }

  const getStatusDisponivels = (statusAtual) => {
    switch (statusAtual) {
      case 'pendente':
        return statusOptions.filter(s => ['pendente', 'finalizado', 'cancelado'].includes(s.value))
      case 'finalizado':
        return statusOptions.filter(s => ['finalizado', 'cancelado', 'pendente'].includes(s.value))
      case 'cancelado':
        return statusOptions.filter(s => ['cancelado', 'pendente', 'finalizado'].includes(s.value))
      default:
        return statusOptions
    }
  }

  const alterarStatus = async (novoStatus) => {
    if (!pedidoSelecionado || pedidoSelecionado.status === novoStatus) {
      setModalStatusVisivel(false)
      return
    }

    const statusLabel = statusOptions.find(s => s.value === novoStatus)?.label

    let mensagem = `Deseja alterar o status do pedido de "${pedidoSelecionado.nomeCliente}" para "${statusLabel}"?`
    let titulo = 'Alterar Status'

    if (pedidoSelecionado.status === 'finalizado' && novoStatus === 'cancelado') {
      titulo = 'Cancelar Pedido Finalizado'
      mensagem = `Atenção! Você está cancelando um pedido já finalizado.\n\nCliente: ${pedidoSelecionado.nomeCliente}\nTotal: R$ ${pedidoSelecionado.total?.toFixed(2)}\n\nEsta ação pode afetar o controle de estoque. Deseja continuar?`
    } else if (pedidoSelecionado.status === 'finalizado' && novoStatus === 'pendente') {
      titulo = 'Reabrir Pedido Finalizado'
      mensagem = `Atenção! Você está reabrindo um pedido já finalizado.\n\nCliente: ${pedidoSelecionado.nomeCliente}\nTotal: R$ ${pedidoSelecionado.total?.toFixed(2)}\n\nEsta ação pode afetar o controle de estoque. Deseja continuar?`
    } else if (pedidoSelecionado.status === 'finalizado') {
      mensagem = `Atenção! Este pedido já foi finalizado.\n\n${mensagem}\n\nEsta ação pode afetar o controle de estoque.`
    }

    Alert.alert(
      titulo,
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              if (novoStatus === 'finalizado') {
                await finalizarPedido(pedidoSelecionado.id)
              } else if (novoStatus === 'cancelado') {
                await cancelarPedido(pedidoSelecionado.id)
              } else if (novoStatus === 'pendente') {
                const pedidoAtualizado = {
                  ...pedidoSelecionado,
                  status: 'pendente'
                }
                await editarPedido(pedidoAtualizado)
              }

              setModalStatusVisivel(false)
              setPedidoSelecionado(null)
            } catch (error) {
              console.error('Erro ao alterar status:', error)
              Alert.alert('Erro', error.message || 'Não foi possível alterar o status do pedido')
            }
          },
          style: pedidoSelecionado.status === 'finalizado' ? 'destructive' : 'default'
        }
      ]
    )
  }

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
    
    try {
      let dataObj
      if (data instanceof Date) {
        dataObj = data
      }
      else if (data && typeof data.toDate === 'function') {
        dataObj = data.toDate()
      }
      else {
        dataObj = new Date(data)
      }
      if (isNaN(dataObj.getTime())) {
        return 'Data inválida'
      }
      return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Erro ao formatar data:', error, data)
      return 'Data inválida'
    }
  }

  const renderItem = ({ item: pedido }) => (
    <View style={styles.pedidoCard}>
      <View style={styles.pedidoHeader}>
        <View style={styles.clienteInfo}>
          <Text style={styles.nomeCliente}>{pedido.nomeCliente}</Text>
          <Text style={styles.dataPedido}>{formatarData(pedido.criadoEm)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.statusBadge, { backgroundColor: getStatusColor(pedido.status) }]}
          onPress={() => abrirModalStatus(pedido)}
          activeOpacity={0.8}
        >
          <Text style={styles.statusText}>{getStatusLabel(pedido.status)}</Text>
          <Feather name="chevron-down" size={12} color={cores.white} style={styles.statusIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.pedidoDetalhes}>
        <Text style={styles.totalPedido}>
          Total: R$ {pedido.total?.toFixed(2) || '0,00'}
        </Text>
        <Text style={styles.qtdItens}>
          {pedido.itens?.length || 0} item(ns)
        </Text>
      </View>

      {pedido.observacoes && (
        <Text style={styles.observacoes} numberOfLines={2}>
          Obs: {pedido.observacoes}
        </Text>
      )}

      <View style={styles.acoes}>
        <TouchableOpacity
          style={[styles.botaoIcone, styles.botaoVer]}
          onPress={() => router.push(`/pedidos/form?id=${pedido.id}&readonly=true`)}
        >
          <Feather name="eye" size={18} color={cores.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoIcone, styles.botaoEditar]}
          onPress={() => router.push(`/pedidos/form?id=${pedido.id}`)}
        >
          <Feather name="edit" size={18} color={cores.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoIcone, styles.botaoExcluir]}
          onPress={() => confirmarExclusao(pedido)}
        >
          <Feather name="trash-2" size={18} color={cores.error} />
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
          <Text style={styles.estatisticaNumero}>{pedidosCancelados}</Text>
          <Text style={styles.estatisticaLabel}>Cancelados</Text>
        </View>
        {/* <View style={styles.estatisticaItem}>
          <Text style={styles.estatisticaNumero}>R$ {totalVendas.toFixed(2)}</Text>
          <Text style={styles.estatisticaLabel}>Vendas</Text>
        </View> */}
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

      <Modal
        visible={modalStatusVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalStatusVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Alterar status</Text>
              <TouchableOpacity onPress={() => setModalStatusVisivel(false)}>
                <Feather name="x" size={24} color={cores.gray600} />
              </TouchableOpacity>
            </View>

            {pedidoSelecionado && (
              <View style={styles.modalContent}>
                <Text style={styles.pedidoInfo}>
                  Cliente: {pedidoSelecionado.nomeCliente}
                </Text>
                <Text style={styles.pedidoInfo}>
                  Total: R$ {pedidoSelecionado.total?.toFixed(2)}
                </Text>

                {pedidoSelecionado.status === 'finalizado' && (
                  <View style={styles.avisoFinalizado}>
                    <Feather name="alert-circle" size={16} color={cores.warning} />
                    <Text style={styles.textoAviso}>
                      Alterar status de pedido finalizado pode afetar o estoque
                    </Text>
                  </View>
                )}

                {pedidoSelecionado.status === 'cancelado' && (
                  <View style={styles.avisoFinalizado}>
                    <Feather name="info" size={16} color={cores.info} />
                    <Text style={styles.textoAviso}>
                      Pedido cancelado pode ser reaberto ou finalizado
                    </Text>
                  </View>
                )}

                <View style={styles.statusOptions}>
                  {getStatusDisponivels(pedidoSelecionado.status).map((status) => {
                    const isAtivo = pedidoSelecionado.status === status.value
                    const isDisponivel = pedidoSelecionado.status !== status.value

                    return (
                      <TouchableOpacity
                        key={status.value}
                        style={[
                          styles.statusOption,
                          isAtivo && styles.statusOptionAtivo,
                          !isDisponivel && styles.statusOptionDesabilitado
                        ]}
                        onPress={() => isDisponivel ? alterarStatus(status.value) : null}
                        disabled={!isDisponivel}
                        activeOpacity={isDisponivel ? 0.7 : 1}
                      >
                        <Feather
                          name={status.icon}
                          size={20}
                          color={isAtivo ? cores.white : status.color}
                        />
                        <Text style={[
                          styles.statusOptionText,
                          isAtivo && styles.statusOptionTextAtivo
                        ]}>
                          {status.label}
                        </Text>
                        {isAtivo && (
                          <Feather name="check" size={16} color={cores.white} />
                        )}
                        {isDisponivel && !isAtivo && (
                          <Feather name="chevron-right" size={16} color={cores.gray400} />
                        )}
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 1,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusText: {
    color: cores.white,
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 4,
  },
  statusIcon: {
    marginLeft: 2,
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  botaoIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  botaoVer: {
    backgroundColor: cores.white,
    borderWidth: 1.5,
    borderColor: cores.gray300,
  },
  botaoEditar: {
    backgroundColor: cores.white,
    borderWidth: 1.5,
    borderColor: cores.gray300,
  },
  botaoExcluir: {
    backgroundColor: cores.white,
    borderWidth: 1.5,
    borderColor: cores.gray300,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: cores.overlay,
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: cores.white,
    borderRadius: 12,
    maxHeight: '60%',
    elevation: 5,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: cores.divider,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.text,
  },
  modalContent: {
    padding: 20,
  },
  pedidoInfo: {
    fontSize: 14,
    color: cores.gray600,
    marginBottom: 8,
  },
  statusOptions: {
    marginTop: 20,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: cores.gray100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusOptionAtivo: {
    backgroundColor: cores.primary,
    borderColor: cores.primaryDark,
  },
  statusOptionDesabilitado: {
    opacity: 0.5,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: cores.text,
    marginLeft: 12,
    flex: 1,
  },
  statusOptionTextAtivo: {
    color: cores.white,
  },
  avisoFinalizado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: cores.warning + '40',
  },
  textoAviso: {
    fontSize: 14,
    color: cores.warning,
    marginLeft: 8,
    fontWeight: '500',
  },
})

export default ListaPedidos