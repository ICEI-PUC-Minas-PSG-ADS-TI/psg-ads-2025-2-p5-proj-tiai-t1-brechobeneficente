import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'
import SeletorProduto from '../shared/SeletorProduto'
import { useEstoque } from '../../context/EstoqueContext'
import { useProdutos } from '../../context/ProdutosContext'

const EntradaEstoque = () => {
    const router = useRouter()
    const { produtoId } = useLocalSearchParams()
    const { registrarEntrada, carregando } = useEstoque()
    const { produtos, buscarProdutoPorId } = useProdutos()

    const [produtoSelecionado, setProdutoSelecionado] = useState(null)
    const [quantidade, setQuantidade] = useState('')
    const [observacao, setObservacao] = useState('')

    useEffect(() => {
        if (produtoId) {
            const produto = buscarProdutoPorId(produtoId)
            if (produto) {
                setProdutoSelecionado(produto)
            }
        }
    }, [produtoId, buscarProdutoPorId])

    const formatarQuantidade = (texto) => {
        const apenasNumeros = texto.replace(/\D/g, '')
        return apenasNumeros
    }

    const validarFormulario = () => {
        if (!produtoSelecionado) {
            Alert.alert('Erro', 'Selecione um produto.')
            return false
        }
        if (!quantidade || Number(quantidade) <= 0) {
            Alert.alert('Erro', 'Informe uma quantidade válida.')
            return false
        }
        return true
    }

    const registrarEntradaEstoque = async () => {
        if (!validarFormulario()) return

        try {
            await registrarEntrada({
                produtoId: produtoSelecionado.id,
                quantidade: Number(quantidade),
                origem: 'Entrada manual',
                observacao
            })

            router.replace('/estoque')
        } catch (error) {
        }
    }

    return (
        <BaseLayout titulo="Entrada de Estoque">
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.secao}>
                    <Text style={styles.tituloSecao}>Produto *</Text>
                    <SeletorProduto
                        value={produtoSelecionado?.id}
                        onSelect={(produto) => setProdutoSelecionado(produto)}
                        placeholder="Selecione um produto para entrada"
                    />
                </View>

                <View style={styles.secao}>
                    <Text style={styles.tituloSecao}>Quantidade *</Text>
                    <View style={styles.inputContainer}>
                        <Feather name="package" size={20} color={cores.gray500} />
                        <TextInput
                            style={styles.input}
                            value={quantidade}
                            onChangeText={(text) => setQuantidade(formatarQuantidade(text))}
                            placeholder="Digite a quantidade"
                            keyboardType="numeric"
                            placeholderTextColor={cores.gray500}
                        />
                    </View>
                </View>

                <View style={styles.secao}>
                    <Text style={styles.tituloSecao}>Observação</Text>
                    <View style={styles.inputContainer}>
                        <Feather name="file-text" size={20} color={cores.gray500} />
                        <TextInput
                            style={[styles.input, styles.inputObservacao]}
                            value={observacao}
                            onChangeText={setObservacao}
                            placeholder="Observações sobre a entrada (opcional)"
                            multiline
                            numberOfLines={3}
                            placeholderTextColor={cores.gray500}
                        />
                    </View>
                </View>

                <View style={styles.botoesContainer}>
                    <TouchableOpacity
                        style={styles.botaoRegistrar}
                        onPress={registrarEntradaEstoque}
                        disabled={carregando}
                        activeOpacity={0.8}
                    >
                        {carregando ? (
                            <ActivityIndicator color={cores.white} size="small" />
                        ) : (
                            <>
                                <Feather name="plus-circle" size={20} color={cores.white} />
                                <Text style={styles.textoBotaoRegistrar}>Registrar Entrada</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.botaoCancelar}
                        onPress={() => router.back()}
                        activeOpacity={0.8}
                    >
                        <Feather name="x" size={20} color={cores.primary} />
                        <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </BaseLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: cores.background,
    },

    secao: {
        marginBottom: 24,
    },
    tituloSecao: {
        fontSize: 16,
        fontWeight: 'bold',
        color: cores.text,
        marginBottom: 8,
    },

    produtoContainer: {
        backgroundColor: cores.white,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: cores.border,
    },
    produtoInfo: {
        flex: 1,
    },
    produtoNome: {
        fontSize: 16,
        fontWeight: '600',
        color: cores.text,
        marginBottom: 4,
    },
    produtoEstoque: {
        fontSize: 14,
        color: cores.gray600,
    },
    botaoTrocarProduto: {
        padding: 8,
    },
    seletorProduto: {
        backgroundColor: cores.white,
        padding: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: cores.border,
    },
    textoSeletor: {
        fontSize: 16,
        color: cores.gray600,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: cores.white,
        borderWidth: 2,
        borderColor: cores.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: cores.text,
        paddingVertical: 12,
        marginLeft: 12,
    },
    inputObservacao: {
        minHeight: 80,
        textAlignVertical: 'top',
    },

    botoesContainer: {
        gap: 12,
        marginTop: 20,
        marginBottom: 40,
    },
    botaoRegistrar: {
        backgroundColor: cores.primary,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: cores.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    textoBotaoRegistrar: {
        color: cores.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    botaoCancelar: {
        backgroundColor: cores.background,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderWidth: 2,
        borderColor: cores.border,
    },
    textoBotaoCancelar: {
        color: cores.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
})

export default EntradaEstoque