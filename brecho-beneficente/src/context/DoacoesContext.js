import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  serverTimestamp
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
  buscarDoacaoPorNome: () => null,
  calcularValorTotalDoacoes: () => 0
}

export const DoacoesContext = createContext(DoacoesContextDefaultValues)

export const DoacoesProvider = ({ children }) => {
  const [doacoes, setDoacoes] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  // 🔹 Carregar doações ao iniciar
  useEffect(() => {
    carregarDoacoes()
  }, [])

  // 🔹 Função para buscar todas as doações do Firestore
  const carregarDoacoes = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)

      const snapshot = await getDocs(collection(db, 'doacoes'))
      const lista = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }))

      lista.sort((a, b) => (a.nomeDoador || '').localeCompare(b.nomeDoador || ''))
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

  // 🔹 Adicionar nova doação
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
      const novaDoacao = { ...dadosDoacao, id: docRef.id }

      setDoacoes(prev => {
        const novaLista = [...prev, novaDoacao]
        return novaLista.sort((a, b) => (a.nomeDoador || '').localeCompare(b.nomeDoador || ''))
      })

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

  // 🔹 Editar uma doação existente
  const editarDoacao = async (doacaoEditada) => {
    try {
      setCarregando(true)
      setErro(null)

      if (!doacaoEditada?.id) {
        throw new Error('ID da doação é obrigatório para edição.')
      }

      const { id, ...dadosParaAtualizar } = doacaoEditada
      const dadosAtualizados = {
        ...dadosParaAtualizar,
        atualizadoEm: serverTimestamp()
      }

      const ref = doc(db, 'doacoes', id)
      await updateDoc(ref, dadosAtualizados)

      const doacaoAtualizada = { ...doacaoEditada, atualizadoEm: new Date() }
      setDoacoes(prev => {
        const novaLista = prev.map(d => (d.id === id ? doacaoAtualizada : d))
        return novaLista.sort((a, b) => (a.nomeDoador || '').localeCompare(b.nomeDoador || ''))
      })

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

  // 🔹 Excluir doação
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

  // 🔹 Buscar doação pelo nome do doador
  const buscarDoacaoPorNome = useCallback(
    (nome) => doacoes.find(d => d.nomeDoador?.toLowerCase() === nome?.toLowerCase()) || null,
    [doacoes]
  )

  // 🔹 Calcular valor total de todas as doações
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
