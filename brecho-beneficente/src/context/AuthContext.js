import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth'
import {doc, setDoc, getDoc, updateDoc, serverTimestamp} from 'firebase/firestore'
import React, {createContext, useEffect, useState, useCallback, useContext} from 'react'
import {Alert} from 'react-native'
import {auth, db} from '../services/firebase'

const AuthContextDefaultValues = {
    usuario: null,
    dadosUsuario: null,
    isAutenticado: false,
    carregando: true,
    login: async() => false,
    logout: async() => {},
    register: async() => {},
    recuperarSenha: async() => {},
    atualizarPerfil: async() => {},
    buscarDadosUsuario: async() => null
}

export const AuthContext = createContext(AuthContextDefaultValues)

export const AuthProvider = ({children}) => {
    const [usuario,
        setUsuario] = useState(null)
    const [dadosUsuario,
        setDadosUsuario] = useState(null)
    const [carregando,
        setCarregando] = useState(true)
    const [inicializado,
        setInicializado] = useState(false)

    const buscarDadosUsuario = useCallback(async(uid) => {
        try {
            const docRef = doc(db, 'usuarios', uid)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const dados = docSnap.data()
                setDadosUsuario({
                    uid: dados.uid,
                    email: dados.email,
                    nome: dados.nome,
                    telefone: dados.telefone,
                    criadoEm: dados.criado_em,
                    atualizadoEm: dados.atualizado_em,
                    ultimoLogin: dados.ultimo_login
                })
                return dados
            } else {
                console.warn('Dados do usuário não encontrados no Firestore')
                setDadosUsuario(null)
                return null
            }
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error)
            setDadosUsuario(null)
            return null
        }
    }, [])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async(user) => {
            setCarregando(true)

            if (user) {
                setUsuario(user)
                await buscarDadosUsuario(user.uid)

                try {
                    const userRef = doc(db, 'usuarios', user.uid)
                    await updateDoc(userRef, {ultimo_login: serverTimestamp()})
                } catch (error) {
                    console.warn('Erro ao atualizar último login:', error)
                }
            } else {
                setUsuario(null)
                setDadosUsuario(null)
            }

            setCarregando(false)
            setInicializado(true)
        })

        return () => unsubscribe()
    }, [buscarDadosUsuario])

    const login = async(email, senha) => {
        try {
            setCarregando(true)

            const userCredential = await signInWithEmailAndPassword(auth, email, senha)
            const user = userCredential.user

            if (!user) {
                throw new Error('Credenciais inválidas.')
            }

            await buscarDadosUsuario(user.uid)

            return {success: true, user}
        } catch (error) {
            console.error('Erro no login:', error)

            const mensagem = traduzErroFirebase(error.code)

            Alert.alert('Erro de Autenticação', mensagem)
            setUsuario(null)
            setDadosUsuario(null)
            return {success: false, error: mensagem}
        } finally {
            setCarregando(false)
        }
    }

    const register = async({email, senha, nome, telefone}) => {
        try {
            setCarregando(true)

            const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
            const user = userCredential.user

            await updateProfile(user, {
                displayName: nome.trim()
            })

            const dadosUsuario = {
                uid: user.uid,
                email: email
                    .toLowerCase()
                    .trim(),
                nome: nome.trim(),
                telefone: telefone.replace(/\D/g, ''),
                criado_em: serverTimestamp(),
                atualizado_em: serverTimestamp(),
                ultimo_login: serverTimestamp()
            }

            await setDoc(doc(db, 'usuarios', user.uid), dadosUsuario)

            return {success: true, user}
        } catch (error) {
            console.error('Erro no cadastro:', error)

            const mensagem = traduzErroFirebase(error.code)

            Alert.alert('Erro no Cadastro', mensagem)
            throw new Error(mensagem)
        } finally {
            setCarregando(false)
        }
    }

    const recuperarSenha = async(email) => {
        try {
            setCarregando(true)
            await sendPasswordResetEmail(auth, email.toLowerCase().trim())
            return {success: true}
        } catch (error) {
            console.error('Erro ao recuperar senha:', error)
            const mensagem = traduzErroFirebase(error.code)
            Alert.alert('Erro', mensagem)
            throw new Error(mensagem)
        } finally {
            setCarregando(false)
        }
    }

    const logout = async() => {
        try {
            setCarregando(true)
            await signOut(auth)
            setUsuario(null)
            setDadosUsuario(null)
            return {success: true}
        } catch (error) {
            console.error('Erro ao fazer logout:', error)
            Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.')
            return {success: false}
        } finally {
            setCarregando(false)
        }
    }

    const atualizarPerfil = async(novosDados) => {
        try {
            if (!usuario) {
                throw new Error('Usuário não autenticado.')
            }
            setCarregando(true)
            const {nome, telefone} = novosDados
            const dadosAtualizados = {
                atualizado_em: serverTimestamp()
            }
            if (nome && nome.trim() !== dadosUsuario
                ?.nome) {
                dadosAtualizados.nome = nome.trim()
                await updateProfile(usuario, {
                    displayName: nome.trim()
                })
            }
            if (telefone && telefone !== dadosUsuario
                ?.telefone) {
                dadosAtualizados.telefone = telefone.replace(/\D/g, '')
            }
            const userRef = doc(db, 'usuarios', usuario.uid)
            await updateDoc(userRef, dadosAtualizados)
            await buscarDadosUsuario(usuario.uid)
            return {success: true}
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error)
            Alert.alert('Erro', 'Não foi possível atualizar o perfil.')
            return {success: false, error: error.message}
        } finally {
            setCarregando(false)
        }
    }

    const traduzErroFirebase = useCallback((code) => {
        switch (code) {
            case 'auth/user-not-found':
                return 'Usuário não encontrado no sistema.'
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return 'E-mail ou senha incorretos.'
            case 'auth/email-already-in-use':
                return 'Este e-mail já está em uso por outra conta.'
            case 'auth/invalid-email':
                return 'Formato de e-mail inválido.'
            case 'auth/weak-password':
                return 'A senha deve ter pelo menos 6 caracteres.'
            case 'auth/too-many-requests':
                return 'Muitas tentativas. Tente novamente em alguns minutos.'
            case 'auth/user-disabled':
                return 'Esta conta foi desativada.'
            case 'auth/operation-not-allowed':
                return 'Operação não permitida.'
            case 'auth/network-request-failed':
                return 'Erro de conexão. Verifique sua internet.'
            case 'permission-denied':
                return 'Acesso negado. Verifique suas permissões.'
            case 'unavailable':
                return 'Serviço temporariamente indisponível.'
            default:
                return 'Erro inesperado. Tente novamente.'
        }
    }, [])

    const contextValue = {
        usuario,
        dadosUsuario,
        isAutenticado: !!usuario && !!dadosUsuario,
        carregando: carregando || !inicializado,
        login,
        logout,
        register,
        recuperarSenha,
        atualizarPerfil,
        buscarDadosUsuario,
        traduzErroFirebase,
        nomeUsuario: dadosUsuario
            ?.nome || usuario
                ?.displayName || 'Usuário',
        emailUsuario: dadosUsuario
            ?.email || usuario
                ?.email || ''
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider')
    }
    return context
}

export const withAuth = (Component) => {
    return function AuthenticatedComponent(props) {
        const {isAutenticado, carregando} = useAuth()

        if (carregando) {
            return null
        }
        if (!isAutenticado) {

            return null
        }
        return <Component {...props}/>
    }
}