import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { db } from '../services/firebase'

const ClientesContextDefaultValues = {
  clientes: [],
  carregando: false,
  erro: null,
  carregarClientes: async () => { },
  adicionarCliente: async () => { },
  editarCliente: async () => { },
  excluirCliente: async () => { },
}

export const ClientesContext = createContext(ClientesContextDefaultValues)

export const ClientesProvider = ({ children }) => {
  const [clientes, setClientes] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    carregarClientes()
  }, [])

  const carregarClientes = useCallback(async () => {
    try {
      setCarregando(true)
      setErro(null)

      const snapshot = await getDocs(collection(db, 'clientes'))
      const lista = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))

      lista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
      setClientes(lista)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      const mensagem = 'Erro ao carregar clientes. Verifique sua conexão.'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
    } finally {
      setCarregando(false)
    }
  }, [])

  const adicionarCliente = async (cliente) => {
    try {
      setCarregando(true)
      setErro(null)

      const { nome, documento, telefone, endereco } = cliente

      if (!nome && !documento && !telefone && !endereco) {
        throw new Error('Preencha ao menos um campo para cadastrar o cliente.')
      }

      const dadosCliente = {
        nome: nome?.trim() || 'Consumidor',
        documento: documento?.trim() || '',
        telefone: telefone?.trim() || '',
        endereco: endereco?.trim() || '',
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
        ativo: true,
      }

      const docRef = await addDoc(collection(db, 'clientes'), dadosCliente)
      const novoCliente = { ...dadosCliente, id: docRef.id }

      setClientes(prev => {
        const novaLista = [...prev, novoCliente]
        return novaLista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
      })

      return { success: true, cliente: novoCliente }
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
      const mensagem = error.message || 'Erro ao adicionar cliente.'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const editarCliente = async (clienteEditado) => {
    try {
      setCarregando(true)
      setErro(null)

      if (!clienteEditado?.id) {
        throw new Error('ID do cliente é obrigatório para edição.')
      }

      const { id, ...dadosParaAtualizar } = clienteEditado
      const dadosAtualizados = {
        ...dadosParaAtualizar,
        atualizadoEm: serverTimestamp(),
      }

      const ref = doc(db, 'clientes', id)
      await updateDoc(ref, dadosAtualizados)

      const clienteAtualizado = { ...clienteEditado, atualizadoEm: new Date() }
      setClientes(prev => {
        const novaLista = prev.map(c => (c.id === id ? clienteAtualizado : c))
        return novaLista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
      })

      return { success: true, cliente: clienteAtualizado }
    } catch (error) {
      console.error('Erro ao editar cliente:', error)
      const mensagem = error.message || 'Erro ao editar cliente.'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const excluirCliente = async (id) => {
    try {
      setCarregando(true)
      setErro(null)

      if (!id) {
        throw new Error('ID do cliente é obrigatório para exclusão.')
      }

      const cliente = clientes.find(c => c.id === id)
      if (!cliente) {
        throw new Error('Cliente não encontrado.')
      }

      await deleteDoc(doc(db, 'clientes', id))
      setClientes(prev => prev.filter(c => c.id !== id))

      return { success: true }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      const mensagem = error.message || 'Erro ao excluir cliente.'
      setErro(mensagem)
      Alert.alert('Erro', mensagem)
      throw error
    } finally {
      setCarregando(false)
    }
  }

  const contextValue = {
    clientes,
    carregando,
    erro,
    carregarClientes,
    adicionarCliente,
    editarCliente,
    excluirCliente,
    totalClientes: clientes.length,
  }

  return (
    <ClientesContext.Provider value={contextValue}>
      {children}
    </ClientesContext.Provider>
  )
}

export const useClientes = () => {
  const context = useContext(ClientesContext)
  if (!context) {
    throw new Error('useClientes deve ser usado dentro de ClientesProvider')
  }
  return context
}
