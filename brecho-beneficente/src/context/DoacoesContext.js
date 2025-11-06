import { 
  addDoc, collection, deleteDoc, doc, getDocs, updateDoc, serverTimestamp 
} from 'firebase/firestore'
import { createContext, useState, useEffect, useCallback } from 'react'
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
}

export const DoacoesContext = createContext(DoacoesContextDefaultValues)

export const DoacoesProvider = ({ children }) => {
  const [doacoes, setDoacoes] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const testarConexao = async () => {
      try {
        console.log('🔹 Testando acesso ao Firestore...')
        await getDocs(collection(db, 'test-connection'))
        console.log('✅ Firestore acessível!')
      } catch (e) {
        console.error('❌ Erro ao conectar no Firestore:', e)
      }
    }
    testarConexao()
  }, [])

  const carregarDoacoes = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)

      const snapshot = await getDocs(collection(db, 'doacoes'))
      const lista = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      lista.sort((a, b) => (a.nomeDoador || '').localeCompare(b.nomeDoador || ''))
      setDoacoes(lista)
    } catch (error) {
      console.error('❌ Erro ao carregar doações:', error)
      const mensagem = 'Erro ao carregar doações. Verifique sua conexão.'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarDoacoes()
  }, [carregarDoacoes])

  const adicionarDoacao = async (doacao) => {
    try {
      setCarregando(true)
      setErro(null)

      console.log('📦 Salvando doação no Firestore:', doacao)

      if (!doacao.nomeDoador || (!doacao.itens && !doacao.valor)) {
        throw new Error('O nome do doador e algum item/valor são obrigatórios')
      }

      const dadosDoacao = {
        ...doacao,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
        ativo: true,
      }

      const docRef = await addDoc(collection(db, 'doacoes'), dadosDoacao)
      console.log('✅ Doação adicionada com ID:', docRef.id)

      const novaDoacao = { ...dadosDoacao, id: docRef.id }

      setDoacoes(prev => {
        const novaLista = [...prev, novaDoacao]
        return novaLista.sort((a, b) => (a.nomeDoador || '').localeCompare(b.nomeDoador || ''))
      })

      return { success: true, doacao: novaDoacao }
    } catch (error) {
      console.error('❌ Erro ao adicionar doação:', error)
      const mensagem = error.message || 'Erro ao adicionar doação'
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
        throw new Error('ID da doação é obrigatório para edição')
      }

      const { id, ...dadosParaAtualizar } = doacaoEditada
      const dadosAtualizados = {
        ...dadosParaAtualizar,
        atualizadoEm: serverTimestamp(),
      }

      await updateDoc(doc(db, 'doacoes', id), dadosAtualizados)
      console.log('✏️ Doação atualizada:', id)

      const doacaoAtualizada = { ...doacaoEditada, atualizadoEm: new Date() }

      setDoacoes(prev =>
        prev.map(d => (d.id === id ? doacaoAtualizada : d))
      )

      return { success: true, doacao: doacaoAtualizada }
    } catch (error) {
      console.error('❌ Erro ao editar doação:', error)
      const mensagem = error.message || 'Erro ao editar doação'
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
        throw new Error('ID da doação é obrigatório para exclusão')
      }

      await deleteDoc(doc(db, 'doacoes', id))
      console.log('🗑️ Doação removida:', id)

      setDoacoes(prev => prev.filter(d => d.id !== id))
      return { success: true }
    } catch (error) {
      console.error('❌ Erro ao excluir doação:', error)
      const mensagem = error.message || 'Erro ao excluir doação'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const contextValue = {
    doacoes,
    carregando,
    erro,
    carregarDoacoes,
    adicionarDoacao,
    editarDoacao,
    excluirDoacao,
    totalDoacoes: doacoes.length,
  }

  return (
    <DoacoesContext.Provider value={contextValue}>
      {children}
    </DoacoesContext.Provider>
  )
}
