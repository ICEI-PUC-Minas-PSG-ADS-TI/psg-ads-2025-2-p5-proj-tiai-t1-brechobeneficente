import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { db } from '../services/firebase'

const ProdutosContextDefaultValues = {
  produtos: [],
  carregando: false,
  erro: null,
  carregarProdutos: async () => { },
  adicionarProduto: async () => { },
  editarProduto: async () => { },
  excluirProduto: async () => { },
  adicionarEntradaAoProduto: async () => { },
  adicionarSaidaAoProduto: async () => { },
  buscarProdutoPorCodigo: () => null,
  calcularValorTotalEstoque: () => 0
}

export const ProdutosContext = createContext(ProdutosContextDefaultValues)

export const ProdutosProvider = ({ children }) => {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    carregarProdutos()
  }, [])

  const carregarProdutos = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)

      const snapshot = await getDocs(collection(db, 'produtos'))
      const lista = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }))

      lista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))

      setProdutos(lista)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      const mensagem = 'Erro ao carregar produtos. Verifique sua conexão.'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
    } finally {
      setCarregando(false)
    }
  }, [])

  const adicionarProduto = async (produto) => {
    try {
      setCarregando(true)
      setErro(null)

      if (!produto.codigo || !produto.nome) {
        throw new Error('Código e nome são obrigatórios')
      }

      const produtoExistente = produtos.find(p => p.codigo === produto.codigo)
      if (produtoExistente) {
        throw new Error(`Já existe um produto com o código ${produto.codigo}`)
      }

      const { id: _, ...produtoSemId } = produto
      const dadosProduto = {
        ...produtoSemId,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
        ativo: true
      }

      const docRef = await addDoc(collection(db, 'produtos'), dadosProduto)
      const novoProduto = { ...dadosProduto, id: docRef.id }

      setProdutos(prev => {
        const novaLista = [...prev, novoProduto]
        return novaLista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
      })

      return { success: true, produto: novoProduto }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error)
      const mensagem = error.message || 'Erro ao adicionar produto'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const editarProduto = async (produtoEditado) => {
    try {
      setCarregando(true)
      setErro(null)

      if (!produtoEditado?.id) {
        throw new Error('ID do produto é obrigatório para edição')
      }

      const produtoComMesmoCodigo = produtos.find(p =>
        p.codigo === produtoEditado.codigo && p.id !== produtoEditado.id
      )
      if (produtoComMesmoCodigo) {
        throw new Error(`Já existe outro produto com o código ${produtoEditado.codigo}`)
      }

      const { id, ...dadosParaAtualizar } = produtoEditado
      const dadosAtualizados = {
        ...dadosParaAtualizar,
        atualizadoEm: serverTimestamp()
      }

      const ref = doc(db, 'produtos', id)
      await updateDoc(ref, dadosAtualizados)

      const produtoAtualizado = { ...produtoEditado, atualizadoEm: new Date() }
      setProdutos(prev => {
        const novaLista = prev.map(p => (p.id === id ? produtoAtualizado : p))
        return novaLista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
      })

      return { success: true, produto: produtoAtualizado }
    } catch (error) {
      console.error('Erro ao editar produto:', error)
      const mensagem = error.message || 'Erro ao editar produto'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }



  const excluirProduto = async (id) => {
    try {
      setCarregando(true)
      setErro(null)

      if (!id) {
        throw new Error('ID do produto é obrigatório para exclusão')
      }

      const produto = produtos.find(p => p.id === id)
      if (!produto) {
        throw new Error('Produto não encontrado')
      }

      await deleteDoc(doc(db, 'produtos', id))
      setProdutos(prev => prev.filter(p => p.id !== id))

      return { success: true }
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      const mensagem = error.message || 'Erro ao excluir produto'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const adicionarEntradaAoProduto = async (produtoId, quantidade) => {
    try {
      const produto = produtos.find(p => p.id == produtoId)
      if (!produto) return

      const novaQuantidade = (produto.quantidade || 0) + Number(quantidade)
      await updateDoc(doc(db, 'produtos', produtoId), { quantidade: novaQuantidade })

      setProdutos(prev =>
        prev.map(p => (p.id == produtoId ? { ...p, quantidade: novaQuantidade } : p))
      )
    } catch (e) {
      console.error('Erro ao adicionar entrada no produto:', e)
    }
  }

  const adicionarSaidaAoProduto = async (produtoId, quantidade) => {
    try {
      setCarregando(true)
      setErro(null)

      const produto = produtos.find(p => p.id === produtoId)
      if (!produto) {
        throw new Error('Produto não encontrado')
      }

      const qtdSaida = Number(quantidade)
      if (qtdSaida <= 0) {
        throw new Error('Quantidade deve ser maior que zero')
      }

      const novaQuantidade = (produto.quantidade || 0) - qtdSaida
      if (novaQuantidade < 0) {
        throw new Error('Estoque insuficiente')
      }

      await updateDoc(doc(db, 'produtos', produtoId), {
        quantidade: novaQuantidade,
        atualizadoEm: serverTimestamp()
      })

      setProdutos(prev =>
        prev.map(p => (p.id === produtoId ? { ...p, quantidade: novaQuantidade } : p))
      )

      return { success: true, novaQuantidade }
    } catch (error) {
      console.error('Erro ao processar saída do produto:', error)
      const mensagem = error.message || 'Erro ao processar saída do produto'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const buscarProdutoPorCodigo = useCallback((codigo) => {
    return produtos.find(p => p.codigo === codigo) || null
  }, [produtos])

  const calcularValorTotalEstoque = useCallback(() => {
    return produtos.reduce((total, produto) => {
      const quantidade = Number(produto.quantidade) || 0
      const valorCusto = Number(produto.valorCusto) || 0
      return total + (quantidade * valorCusto)
    }, 0)
  }, [produtos])

  const contextValue = {
    produtos,
    carregando,
    erro,
    carregarProdutos,
    adicionarProduto,
    editarProduto,
    excluirProduto,
    adicionarEntradaAoProduto,
    adicionarSaidaAoProduto,
    buscarProdutoPorCodigo,
    calcularValorTotalEstoque,
    totalProdutos: produtos.length,
    produtosComEstoqueBaixo: produtos.filter(p => (p.quantidade || 0) < 5).length,
    produtosSemEstoque: produtos.filter(p => (p.quantidade || 0) === 0).length
  }

  return (
    <ProdutosContext.Provider value={contextValue}>
      {children}
    </ProdutosContext.Provider>
  )
}

export const useProdutos = () => {
  const context = useContext(ProdutosContext)
  if (!context) {
    throw new Error('useProdutos deve ser usado dentro de ProdutosProvider')
  }
  return context
}