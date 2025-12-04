import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { db } from '../services/firebase'
import { useProdutos } from './ProdutosContext'
import { useEstoque } from './EstoqueContext'

const PedidosContextDefaultValues = {
  pedidos: [],
  carregando: false,
  erro: null,
  carregarPedidos: async () => { },
  adicionarPedido: async () => { },
  editarPedido: async () => { },
  excluirPedido: async () => { },
  calcularTotalPedido: () => 0,
  calcularTotalVendas: () => 0,
  buscarPedidoPorId: () => null,
  finalizarPedido: async () => { },
  cancelarPedido: async () => { }
}

export const PedidosContext = createContext(PedidosContextDefaultValues)

export const PedidosProvider = ({ children }) => {
  const [pedidos,
    setPedidos] = useState([])
  const [carregando,
    setCarregando] = useState(false)
  const [erro,
    setErro] = useState(null)

  const { adicionarSaidaAoProduto, adicionarEntradaAoProduto } = useProdutos()
  const { registrarSaida, registrarEntrada } = useEstoque()

  useEffect(() => {
    carregarPedidos()
  }, [])

  const realizarBaixaEstoque = useCallback(async (pedido) => {
    try {
      if (pedido.status == 'finalizado' && pedido.tipoVenda == 'venda') {
        console.log(`🛒 Processando baixa de estoque - Pedido #${pedido.id?.slice(-8) || 'N/A'}`)

        for (const item of pedido.itens) {
          if (item.produtoId && item.quantidade > 0) {
            await adicionarSaidaAoProduto(item.produtoId, item.quantidade)

            await registrarSaida({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              origem: 'Venda',
              observacao: `Venda - Pedido #${pedido.id?.slice(-8) || 'N/A'}`,
              silencioso: true
            })

            console.log(`✅ Estoque atualizado: -${item.quantidade} un. (Produto: ${item.produtoId})`)
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao realizar baixa no estoque:', error)
      Alert.alert('Erro', 'Erro ao atualizar estoque: ' + error.message)
    }
  }, [adicionarSaidaAoProduto, registrarSaida])

  const processarMudancaStatus = useCallback(async (pedidoAnterior, pedidoAtualizado) => {
    try {
      const statusAnterior = pedidoAnterior.status
      const statusAtual = pedidoAtualizado.status

      console.log(`📊 Mudança de status detectada: ${statusAnterior} → ${statusAtual}`)

      
      if (statusAnterior === 'finalizado' && statusAtual !== 'finalizado') {
        console.log('🔄 Fazendo estorno de estoque...')
        
        for (const item of pedidoAtualizado.itens) {
          if (item.produtoId && item.quantidade > 0) {
            
            await adicionarEntradaAoProduto(item.produtoId, item.quantidade)
            
            
            await registrarEntrada({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              origem: 'Estorno',
              observacao: `Estorno - Pedido #${pedidoAtualizado.id?.slice(-8) || 'N/A'} (${statusAnterior} → ${statusAtual})`,
              silencioso: true
            })
            
            console.log(`✅ Estorno realizado: +${item.quantidade} un. (Produto: ${item.produtoId})`)
          }
        }
      }
      
      
      else if (statusAnterior !== 'finalizado' && statusAtual === 'finalizado') {
        console.log('📦 Realizando baixa de estoque...')
        await realizarBaixaEstoque(pedidoAtualizado)
      }
    } catch (error) {
      console.error('❌ Erro ao processar mudança de status:', error)
    }
  }, [adicionarEntradaAoProduto, registrarEntrada, realizarBaixaEstoque])

  const carregarPedidos = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)

      const q = query(collection(db, 'pedidos'), orderBy('criadoEm', 'desc'))
      const snapshot = await getDocs(q)

      const lista = snapshot
        .docs
        .map(docSnap => {
          const data = docSnap.data()
          return {
            id: docSnap.id,
            ...data,
            itens: data.itens || [],
            criadoEm: data.criadoEm
              ?.toDate
              ?.() || (data.criadoEm
                ? new Date(data.criadoEm)
                : new Date()),
            atualizadoEm: data.atualizadoEm
              ?.toDate
              ?.() || (data.atualizadoEm
                ? new Date(data.atualizadoEm)
                : new Date()),
            dataFinalizacao: data.dataFinalizacao
              ?.toDate
              ?.() || (data.dataFinalizacao
                ? new Date(data.dataFinalizacao)
                : null),
            dataCancelamento: data.dataCancelamento
              ?.toDate
              ?.() || (data.dataCancelamento
                ? new Date(data.dataCancelamento)
                : null)
          }
        })

      setPedidos(lista)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
      const mensagem = 'Erro ao carregar pedidos. Verifique sua conexão.'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
    } finally {
      setCarregando(false)
    }
  }, [])

  const adicionarPedido = async (pedido) => {
    try {
      setCarregando(true)
      setErro(null)

      if (!pedido.nomeCliente || !pedido.itens || pedido.itens.length == 0) {
        throw new Error('Nome do cliente e itens são obrigatórios')
      }

      const total = pedido
        .itens
        .reduce((acc, item) => {
          return acc + (item.quantidade * item.valorUnitario)
        }, 0)

      const dadosPedido = {
        clienteId: pedido.clienteId || null,
        nomeCliente: pedido
          .nomeCliente
          .trim(),
        telefoneCliente: pedido.telefoneCliente
          ?.replace(/\D/g, '') || '',
        enderecoCliente: pedido.enderecoCliente
          ?.trim() || '',
        observacoes: pedido.observacoes
          ?.trim() || '',
        itens: pedido.itens,
        total: total,
        status: 'pendente',
        formaPagamento: pedido.formaPagamento || 'Dinheiro',
        tipoVenda: pedido.tipoVenda || 'venda',
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'pedidos'), dadosPedido)
      const novoPedido = {
        ...dadosPedido,
        id: docRef.id,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      }
      setPedidos(prev => [
        novoPedido, ...prev
      ])
      return { success: true, pedido: novoPedido }
    } catch (error) {
      console.error('Erro ao adicionar pedido:', error)
      const mensagem = error.message || 'Erro ao adicionar pedido'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const editarPedido = async (pedidoEditado) => {
    try {
      setCarregando(true)
      setErro(null)

      if (!pedidoEditado?.id) {
        throw new Error('ID do pedido é obrigatório para edição')
      }

      
      const pedidoAtual = pedidos.find(p => p.id === pedidoEditado.id)
      if (!pedidoAtual) {
        throw new Error('Pedido não encontrado')
      }

      const total = pedidoEditado.itens.reduce((acc, item) => {
        return acc + (item.quantidade * item.valorUnitario)
      }, 0)

      const { id, criadoEm, atualizadoEm, ...dadosParaAtualizar } = pedidoEditado
      const dadosAtualizados = {
        ...dadosParaAtualizar,
        total: total,
        atualizadoEm: serverTimestamp()
      }

      const ref = doc(db, 'pedidos', id)
      await updateDoc(ref, dadosAtualizados)

      const pedidoAtualizado = {
        ...pedidoEditado,
        total: total,
        atualizadoEm: new Date(),
        criadoEm: pedidoEditado.criadoEm || new Date()
      }

      setPedidos(prev => prev.map(p => (p.id == id ? pedidoAtualizado : p)))

      
      await processarMudancaStatus(pedidoAtual, pedidoAtualizado)

      return { success: true, pedido: pedidoAtualizado }
    } catch (error) {
      console.error('Erro ao editar pedido:', error)
      const mensagem = error.message || 'Erro ao editar pedido'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const excluirPedido = async (id) => {
    try {
      setCarregando(true)
      setErro(null)

      if (!id) {
        throw new Error('ID do pedido é obrigatório para exclusão')
      }

      const pedido = pedidos.find(p => p.id == id)
      if (!pedido) {
        throw new Error('Pedido não encontrado')
      }
      await deleteDoc(doc(db, 'pedidos', id))
      setPedidos(prev => prev.filter(p => p.id !== id))

      return { success: true }
    } catch (error) {
      console.error('Erro ao excluir pedido:', error)
      const mensagem = error.message || 'Erro ao excluir pedido'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const finalizarPedido = async (id) => {
    try {
      setCarregando(true)
      setErro(null)

      const pedido = pedidos.find(p => p.id == id)
      if (!pedido) {
        throw new Error('Pedido não encontrado')
      }

      if (pedido.status == 'finalizado') {
        throw new Error('Pedido já finalizado')
      }

      const dadosAtualizados = {
        status: 'finalizado',
        dataFinalizacao: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      }

      await updateDoc(doc(db, 'pedidos', id), dadosAtualizados)

      const pedidoAtualizado = {
        ...pedido,
        status: 'finalizado',
        dataFinalizacao: new Date(),
        atualizadoEm: new Date()
      }

      setPedidos(prev => prev.map(p => (p.id == id
        ? pedidoAtualizado
        : p)))

      await realizarBaixaEstoque(pedidoAtualizado)

      return { success: true }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      const mensagem = error.message || 'Erro ao finalizar pedido'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const cancelarPedido = async (id) => {
    try {
      setCarregando(true)
      setErro(null)

      const pedido = pedidos.find(p => p.id == id)
      if (!pedido) {
        throw new Error('Pedido não encontrado')
      }
      const dadosAtualizados = {
        status: 'cancelado',
        dataCancelamento: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      }

      await updateDoc(doc(db, 'pedidos', id), dadosAtualizados)

      const pedidoAtualizado = {
        ...pedido,
        status: 'cancelado',
        dataCancelamento: new Date(),
        atualizadoEm: new Date()
      }

      setPedidos(prev => prev.map(p => (p.id == id
        ? pedidoAtualizado
        : p)))

      return { success: true }
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error)
      const mensagem = error.message || 'Erro ao cancelar pedido'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const calcularTotalPedido = useCallback((itens) => {
    if (!Array.isArray(itens))
      return 0
    return itens.reduce((total, item) => {
      return total + (item.quantidade * item.valorUnitario)
    }, 0)
  }, [])

  const calcularTotalVendas = useCallback(() => {
    return pedidos
      .filter(p => p.status == 'finalizado' && p.tipoVenda == 'venda')
      .reduce((total, pedido) => total + (pedido.total || 0), 0)
  }, [pedidos])

  const buscarPedidoPorId = useCallback((id) => {
    return pedidos.find(p => p.id == id) || null
  }, [pedidos])

  const contextValue = {
    pedidos,
    carregando,
    erro,
    carregarPedidos,
    adicionarPedido,
    editarPedido,
    excluirPedido,
    finalizarPedido,
    cancelarPedido,
    calcularTotalPedido,
    calcularTotalVendas,
    buscarPedidoPorId,

    totalPedidos: pedidos.length,
    pedidosPendentes: pedidos
      .filter(p => p.status == 'pendente')
      .length,
    pedidosFinalizados: pedidos
      .filter(p => p.status == 'finalizado')
      .length,
    pedidosCancelados: pedidos
      .filter(p => p.status == 'cancelado')
      .length,
    totalVendas: calcularTotalVendas(),
    vendaDia: pedidos.filter(p => {
      const hoje = new Date()
      const dataPedido = p.criadoEm || new Date()
      return p.status == 'finalizado' && dataPedido.toDateString() == hoje.toDateString()
    }).reduce((total, pedido) => total + (pedido.total || 0), 0)
  }

  return (
    <PedidosContext.Provider value={contextValue}>
      {children}
    </PedidosContext.Provider>
  )
}

export const usePedidos = () => {
  const context = useContext(PedidosContext)
  if (!context) {
    throw new Error('usePedidos deve ser usado dentro de PedidosProvider')
  }
  return context
}