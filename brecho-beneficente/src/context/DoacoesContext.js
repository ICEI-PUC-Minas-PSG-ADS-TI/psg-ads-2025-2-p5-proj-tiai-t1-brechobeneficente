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

const DoacoesContextDefaultValues = {
  doacoes: [],
  carregando: false,
  erro: null,
  carregarDoacoes: async () => {},
  adicionarDoacao: async () => {},
  editarDoacao: async () => {},
  excluirDoacao: async () => {},
  buscarDoacaoPorId: () => null,
  buscarDoacaoPorNome: () => null,
  calcularValorTotalDoacoes: () => 0
}

export const DoacoesContext = createContext(DoacoesContextDefaultValues)

export const DoacoesProvider = ({ children }) => {
  const [doacoes, setDoacoes] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    carregarDoacoes()
  }, [])

  const carregarDoacoes = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)

      const q = query(collection(db, 'doacoes'), orderBy('criadoEm', 'desc'))
      const snapshot = await getDocs(q)

      const lista = snapshot.docs.map(docSnap => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          criadoEm: data.criadoEm?.toDate?.() || (data.criadoEm ? new Date(data.criadoEm) : new Date()),
          atualizadoEm: data.atualizadoEm?.toDate?.() || (data.atualizadoEm ? new Date(data.atualizadoEm) : new Date())
        }
      })

      setDoacoes(lista)
    } catch (error) {
      console.error('Erro ao carregar doações:', error)
      const mensagem = 'Erro ao carregar doações. Verifique sua conexão.'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
    } finally {
      setCarregando(false)
    }
  }, [])

  const adicionarDoacao = async (doacao) => {
    try {
      setCarregando(true)
      setErro(null)

      const { nomeDoador, item, quantidade, valor, imagem } = doacao

      if (!nomeDoador || !item) {
        throw new Error('Nome do doador e item são obrigatórios.')
      }

      const dadosDoacao = {
        nomeDoador: nomeDoador.trim(),
        item: item.trim(),
        quantidade: Number(quantidade) || 1,
        valor: Number(valor) || 0,
        imagem: imagem || null,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
        ativo: true
      }

      const docRef = await addDoc(collection(db, 'doacoes'), dadosDoacao)
      const novaDoacao = {
        ...dadosDoacao,
        id: docRef.id,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      }

      setDoacoes(prev => [novaDoacao, ...prev])

      return { success: true, doacao: novaDoacao }
    } catch (error) {
      console.error('Erro ao adicionar doação:', error)
      const mensagem = error.message || 'Erro ao adicionar doação.'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const editarDoacao = async (doacaoEditada) => {
    try {
      setCarregando(true)
      setErro(null)

      if (!doacaoEditada?.id) {
        throw new Error('ID da doação é obrigatório para edição.')
      }

      const { id, criadoEm, atualizadoEm, ...dadosParaAtualizar } = doacaoEditada
      const dadosAtualizados = {
        ...dadosParaAtualizar,
        atualizadoEm: serverTimestamp()
      }

      const ref = doc(db, 'doacoes', id)
      await updateDoc(ref, dadosAtualizados)

      const doacaoAtualizada = {
        ...doacaoEditada,
        atualizadoEm: new Date(),
        criadoEm: doacaoEditada.criadoEm || new Date()
      }

      setDoacoes(prev => prev.map(d => (d.id === id ? doacaoAtualizada : d)))

      return { success: true, doacao: doacaoAtualizada }
    } catch (error) {
      console.error('Erro ao editar doação:', error)
      const mensagem = error.message || 'Erro ao editar doação.'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const excluirDoacao = async (id) => {
    try {
      setCarregando(true)
      setErro(null)

      if (!id) {
        throw new Error('ID da doação é obrigatório para exclusão.')
      }

      const doacao = doacoes.find(d => d.id === id)
      if (!doacao) {
        throw new Error('Doação não encontrada.')
      }

      await deleteDoc(doc(db, 'doacoes', id))
      setDoacoes(prev => prev.filter(d => d.id !== id))

      return { success: true }
    } catch (error) {
      console.error('Erro ao excluir doação:', error)
      const mensagem = error.message || 'Erro ao excluir doação.'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const buscarDoacaoPorId = useCallback((id) => {
    return doacoes.find(d => d.id === id) || null
  }, [doacoes])

  const buscarDoacaoPorNome = useCallback(
    (nome) => doacoes.find(d => d.nomeDoador?.toLowerCase() === nome?.toLowerCase()) || null,
    [doacoes]
  )

  const calcularValorTotalDoacoes = useCallback(() => {
    return doacoes.reduce((total, d) => {
      const valor = Number(d.valor) || 0
      return total + valor
    }, 0)
  }, [doacoes])

  const contextValue = {
    doacoes,
    carregando,
    erro,
    carregarDoacoes,
    adicionarDoacao,
    editarDoacao,
    excluirDoacao,
    buscarDoacaoPorId,
    buscarDoacaoPorNome,
    calcularValorTotalDoacoes,
    totalDoacoes: doacoes.length
  }

  return (
    <DoacoesContext.Provider value={contextValue}>
      {children}
    </DoacoesContext.Provider>
  )
}

export const useDoacoes = () => {
  const context = useContext(DoacoesContext)
  if (!context) {
    throw new Error('useDoacoes deve ser usado dentro de DoacoesProvider')
  }
  return context
}
