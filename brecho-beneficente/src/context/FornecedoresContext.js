import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { db } from '../services/firebase'

const FornecedoresContextDefaultValues = {
    fornecedores: [],
    carregando: false,
    erro: null,
    carregarFornecedores: async () => { },
    adicionarFornecedor: async () => { },
    editarFornecedor: async () => { },
    excluirFornecedor: async () => { },
}

export const FornecedoresContext = createContext(FornecedoresContextDefaultValues)

export const FornecedoresProvider = ({ children }) => {
    const [fornecedores, setFornecedores] = useState([])
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        carregarFornecedores()
    }, [])

    const carregarFornecedores = useCallback(async () => {
        try {
            setCarregando(true)
            setErro(null)

            const snapshot = await getDocs(collection(db, 'fornecedores'))
            const lista = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data(),
            }))

            lista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
            setFornecedores(lista)
        } catch (error) {
            console.error('Erro ao carregar fornecedores:', error)
            const mensagem = 'Erro ao carregar fornecedores. Verifique sua conexão.'
            setErro(mensagem)
            Alert.alert('Erro', mensagem)
        } finally {
            setCarregando(false)
        }
    }, [])

    const adicionarFornecedor = async (fornecedor) => {
        try {
            setCarregando(true)
            setErro(null)

            const { nome, documento, telefone, endereco } = fornecedor

            if (!nome && !documento && !telefone && !endereco) {
                throw new Error('Preencha ao menos um campo para cadastrar o fornecedor.')
            }

            const dadosFornecedor = {
                nome: nome?.trim() || 'Fornecedor',
                documento: documento?.trim() || '',
                telefone: telefone?.trim() || '',
                endereco: endereco?.trim() || '',
                criadoEm: serverTimestamp(),
                atualizadoEm: serverTimestamp(),
                ativo: true,
            }

            const docRef = await addDoc(collection(db, 'fornecedores'), dadosFornecedor)
            const novoFornecedor = { ...dadosFornecedor, id: docRef.id }

            setFornecedores(prev => {
                const novaLista = [...prev, novoFornecedor]
                return novaLista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
            })

            return { success: true, fornecedor: novoFornecedor }

        } catch (error) {
            console.error('Erro ao adicionar fornecedor:', error)
            const mensagem = error.message || 'Erro ao adicionar fornecedor.'
            setErro(mensagem)
            Alert.alert('Erro', mensagem)
            throw error
        } finally {
            setCarregando(false)
        }
    }

    const editarFornecedor = async (fornecedorEditado) => {
        try {
            setCarregando(true)
            setErro(null)

            if (!fornecedorEditado?.id) {
                throw new Error('ID do fornecedor é obrigatório para edição.')
            }

            const { id, ...dadosParaAtualizar } = fornecedorEditado

            const dadosAtualizados = {
                ...dadosParaAtualizar,
                atualizadoEm: serverTimestamp(),
            }

            const ref = doc(db, 'fornecedores', id)
            await updateDoc(ref, dadosAtualizados)

            const fornecedorAtualizado = { ...fornecedorEditado, atualizadoEm: new Date() }
            setFornecedores(prev => {
                const novaLista = prev.map(f => (f.id === id ? fornecedorAtualizado : f))
                return novaLista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
            })

            return { success: true, fornecedor: fornecedorAtualizado }

        } catch (error) {
            console.error('Erro ao editar fornecedor:', error)
            const mensagem = error.message || 'Erro ao editar fornecedor.'
            setErro(mensagem)
            Alert.alert('Erro', mensagem)
            throw error
        } finally {
            setCarregando(false)
        }
    }

    const excluirFornecedor = async (id) => {
        try {
            setCarregando(true)
            setErro(null)

            if (!id) {
                throw new Error('ID do fornecedor é obrigatório para exclusão.')
            }

            const fornecedor = fornecedores.find(f => f.id === id)
            if (!fornecedor) {
                throw new Error('Fornecedor não encontrado.')
            }

            await deleteDoc(doc(db, 'fornecedores', id))
            setFornecedores(prev => prev.filter(f => f.id !== id))

            return { success: true }
        } catch (error) {
            console.error('Erro ao excluir fornecedor:', error)
            const mensagem = error.message || 'Erro ao excluir fornecedor.'
            setErro(mensagem)
            Alert.alert('Erro', mensagem)
            throw error
        } finally {
            setCarregando(false)
        }
    }

    const contextValue = {
        fornecedores,
        carregando,
        erro,
        carregarFornecedores,
        adicionarFornecedor,
        editarFornecedor,
        excluirFornecedor,
        totalFornecedores: fornecedores.length,
    }

    return (
        <FornecedoresContext.Provider value={contextValue}>
            {children}
        </FornecedoresContext.Provider>
    )
}

export const useFornecedores = () => {
    const context = useContext(FornecedoresContext)
    if (!context) {
        throw new Error('useFornecedores deve ser usado dentro de FornecedoresProvider')
    }
    return context
}