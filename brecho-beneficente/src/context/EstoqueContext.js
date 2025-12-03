import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { db } from '../services/firebase'
import { useProdutos } from './ProdutosContext'

const EstoqueContextDefaultValues = {
  historico: [],
  carregando: false,
  erro: null,
  carregarHistorico: async () => { },
  registrarEntrada: async () => { },
  registrarSaida: async () => { },
  calcularEstoque: () => ({ entradas: 0, saidas: 0 }),
  getMovimentacoesPorProduto: () => []
}

export const EstoqueContext = createContext(EstoqueContextDefaultValues)

export const EstoqueProvider = ({ children }) => {
  const { adicionarEntradaAoProduto, adicionarSaidaAoProduto, setCallbackEstoqueInicial } = useProdutos()
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    carregarHistorico()
  }, [])

  useEffect(() => {
    if (setCallbackEstoqueInicial) {
      setCallbackEstoqueInicial(() => registrarEstoqueInicial)
    }
  }, [setCallbackEstoqueInicial])

  const carregarHistorico = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)

      const q = query(
        collection(db, 'estoque_historico'),
        orderBy('criadoEm', 'desc')
      )
      const snapshot = await getDocs(q)

      const lista = snapshot.docs.map(docSnap => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          criadoEm: data.criadoEm?.toDate?.() || (data.criadoEm ? new Date(data.criadoEm) : new Date())
        }
      })

      setHistorico(lista)
    } catch (error) {
      console.error('Erro ao carregar histórico do estoque:', error)
      const mensagem = 'Erro ao carregar histórico do estoque. Verifique sua conexão.'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
    } finally {
      setCarregando(false)
    }
  }, [])

  const registrarEntrada = async ({ produtoId, quantidade, origem = 'Entrada manual', observacao = '', silencioso = false }) => {
    try {
      setCarregando(true)
      setErro(null)

      const qtd = Number(quantidade)
      if (!produtoId || isNaN(qtd) || qtd <= 0) {
        throw new Error('Produto e quantidade válida são obrigatórios.')
      }

      await adicionarEntradaAoProduto(produtoId, qtd)

      await registrarHistorico({
        tipo: 'entrada',
        produtoId,
        quantidade: qtd,
        origem,
        observacao
      })

      if (!silencioso) {
        Alert.alert('Sucesso', `Entrada de ${qtd} unidades registrada com sucesso!`)
      }

      return { success: true }
    } catch (error) {
      console.error('Erro ao registrar entrada:', error)
      const mensagem = error.message || 'Erro ao registrar entrada no estoque'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const registrarSaida = async ({ produtoId, quantidade, origem = 'Saída manual', observacao = '', silencioso = false }) => {
    try {
      setCarregando(true)
      setErro(null)

      const qtd = Number(quantidade)
      if (!produtoId || isNaN(qtd) || qtd <= 0) {
        throw new Error('Produto e quantidade válida são obrigatórios.')
      }

      await adicionarSaidaAoProduto(produtoId, qtd)

      await registrarHistorico({
        tipo: 'saida',
        produtoId,
        quantidade: qtd,
        origem,
        observacao
      })

      if (!silencioso) {
        Alert.alert('Sucesso', `Saída de ${qtd} unidades registrada com sucesso!`)
      }

      return { success: true }
    } catch (error) {
      console.error('Erro ao registrar saída:', error)
      const mensagem = error.message || 'Erro ao registrar saída do estoque'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const registrarHistorico = async ({ tipo, produtoId, quantidade, origem, observacao = '' }) => {
    try {
      const novaMovimentacao = {
        tipo,
        produtoId,
        quantidade: Number(quantidade),
        origem,
        observacao,
        criadoEm: serverTimestamp(),
        ativo: true
      }

      const docRef = await addDoc(collection(db, 'estoque_historico'), novaMovimentacao)

      const movimentacaoComId = {
        ...novaMovimentacao,
        id: docRef.id,
        criadoEm: new Date()
      }

      setHistorico(prev => [movimentacaoComId, ...prev])
    } catch (error) {
      console.error('Erro ao registrar histórico de estoque:', error)
      throw error
    }
  }

  const getMovimentacoesPorProduto = (produtoId) => {
    return historico.filter(h => h.produtoId == produtoId)
  }

  const calcularEstoque = (produtoId) => {
    if (!produtoId) return { entradas: 0, saidas: 0, total: 0 }

    const movimentacoesProduto = historico.filter(h =>
      h.produtoId === produtoId && h.ativo !== false
    )

    const entradas = movimentacoesProduto
      .filter(h => h.tipo === 'entrada')
      .reduce((acc, h) => acc + Number(h.quantidade || 0), 0)

    const saidas = movimentacoesProduto
      .filter(h => h.tipo === 'saida')
      .reduce((acc, h) => acc + Number(h.quantidade || 0), 0)

    const total = entradas - saidas

    return { entradas, saidas, total }
  }

  const registrarEstoqueInicial = async (produtoId, quantidade, nomeProduto) => {
    try {
      if (quantidade > 0) {
        console.log(`📦 Registrando estoque inicial para ${nomeProduto}: ${quantidade} un.`)

        await registrarHistorico({
          tipo: 'entrada',
          produtoId,
          quantidade: Number(quantidade),
          origem: 'Estoque inicial',
          observacao: `Estoque inicial do produto: ${nomeProduto}`
        })

        console.log(`✅ Estoque inicial registrado com sucesso`)
      }
    } catch (error) {
      console.error('❌ Erro ao registrar estoque inicial:', error)
    }
  }

  return (
    <EstoqueContext.Provider
      value={{
        historico,
        carregando,
        erro,
        carregarHistorico,
        registrarEntrada,
        registrarSaida,
        calcularEstoque,
        getMovimentacoesPorProduto,
        registrarEstoqueInicial
      }}
    >
      {children}
    </EstoqueContext.Provider>
  )
}

export const useEstoque = () => {
  const context = useContext(EstoqueContext)
  if (!context) {
    throw new Error('useEstoque deve ser usado dentro de EstoqueProvider')
  }
  return context
}