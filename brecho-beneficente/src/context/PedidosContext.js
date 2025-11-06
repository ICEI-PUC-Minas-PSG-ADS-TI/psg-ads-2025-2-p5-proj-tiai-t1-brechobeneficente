import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { db } from '../services/firebase'

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
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    carregarPedidos()
  }, [])

  const carregarPedidos = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)


      const q = query(collection(db, 'pedidos'), orderBy('criadoEm', 'desc'))
      const snapshot = await getDocs(q)

      const lista = snapshot.docs.map(docSnap => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,

          itens: data.itens || [],

          criadoEm: data.criadoEm?.toDate?.() || new Date(),
          atualizadoEm: data.atualizadoEm?.toDate?.() || new Date()
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


      if (!pedido.nomeCliente || !pedido.itens || pedido.itens.length === 0) {
        throw new Error('Nome do cliente e itens são obrigatórios')
      }


      const total = pedido.itens.reduce((acc, item) => {
        return acc + (item.quantidade * item.valorUnitario)
      }, 0)

      const dadosPedido = {
        nomeCliente: pedido.nomeCliente.trim(),
        telefoneCliente: pedido.telefoneCliente?.replace(/\D/g, '') || '',
        observacoes: pedido.observacoes?.trim() || '',
        itens: pedido.itens,
        total: total,
        status: 'pendente',
        formaPagamento: pedido.formaPagamento || 'dinheiro',
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
      setPedidos(prev => [novoPedido, ...prev])
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


      const total = pedidoEditado.itens.reduce((acc, item) => {
        return acc + (item.quantidade * item.valorUnitario)
      }, 0)

      const { id, criadoEm, ...dadosParaAtualizar } = pedidoEditado
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
        atualizadoEm: new Date()
      }

      setPedidos(prev =>
        prev.map(p => (p.id === id ? pedidoAtualizado : p))
      )

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

      const pedido = pedidos.find(p => p.id === id)
      if (!pedido) {
        throw new Error('Pedido não encontrado')
      }


      if (pedido.status === 'finalizado') {
        throw new Error('Não é possível excluir pedidos finalizados')
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

      const pedido = pedidos.find(p => p.id === id)
      if (!pedido) {
        throw new Error('Pedido não encontrado')
      }

      if (pedido.status === 'finalizado') {
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

      setPedidos(prev =>
        prev.map(p => (p.id === id ? pedidoAtualizado : p))
      )

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

      const pedido = pedidos.find(p => p.id === id)
      if (!pedido) {
        throw new Error('Pedido não encontrado')
      }

      if (pedido.status === 'finalizado') {
        throw new Error('Não é possível cancelar pedidos finalizados')
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

      setPedidos(prev =>
        prev.map(p => (p.id === id ? pedidoAtualizado : p))
      )

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
    if (!Array.isArray(itens)) return 0
    return itens.reduce((total, item) => {
      return total + (item.quantidade * item.valorUnitario)
    }, 0)
  }, [])

  const calcularTotalVendas = useCallback(() => {
    return pedidos
      .filter(p => p.status === 'finalizado' && p.tipoVenda === 'venda')
      .reduce((total, pedido) => total + (pedido.total || 0), 0)
  }, [pedidos])

  const buscarPedidoPorId = useCallback((id) => {
    return pedidos.find(p => p.id === id) || null
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
    pedidosPendentes: pedidos.filter(p => p.status === 'pendente').length,
    pedidosFinalizados: pedidos.filter(p => p.status === 'finalizado').length,
    pedidosCancelados: pedidos.filter(p => p.status === 'cancelado').length,
    totalVendas: calcularTotalVendas(),
    vendaDia: pedidos
      .filter(p => {
        const hoje = new Date()
        const dataPedido = p.criadoEm || new Date()
        return p.status === 'finalizado' &&
          dataPedido.toDateString() === hoje.toDateString()
      })
      .reduce((total, pedido) => total + (pedido.total || 0), 0)
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