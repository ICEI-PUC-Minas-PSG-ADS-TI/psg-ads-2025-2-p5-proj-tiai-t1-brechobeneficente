import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'
import { useEstoque } from '../../context/EstoqueContext'
import { useProdutos } from '../../context/ProdutosContext'

const HistoricoEstoque = () => {
    const router = useRouter()
    const { produtoId } = useLocalSearchParams()
    const { historico, carregando, carregarHistorico, calcularEstoque } = useEstoque()
    const { buscarProdutoPorId } = useProdutos()

    const [produto, setProduto] = useState(null)

    useEffect(() => {
        carregarHistorico()
        if (produtoId) {
            const prod = buscarProdutoPorId(produtoId)
            setProduto(prod)
        }
    }, [produtoId])

    const movimentacoesFiltradas = produtoId
        ? historico.filter(h => h.produtoId === produtoId)
        : historico

    const formatarData = (data) => {
        try {
            const dataObj = data instanceof Date ? data : new Date(data)
            return format(dataObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
        } catch {
            return 'Data inválida'
        }
    }

    const renderMovimentacao = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <View style={styles.tipoContainer}>
                    <View style={[
                        styles.indicadorTipo,
                        { backgroundColor: item.tipo === 'entrada' ? cores.primary : cores.error }
                    ]} />
                    <Text style={styles.tipoTexto}>
                        {item.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </Text>
                </View>
                <Text style={styles.quantidade}>
                    {item.tipo === 'entrada' ? '+' : '-'}{item.quantidade} un.
                </Text>
            </View>

            <Text style={styles.origem}>{item.origem}</Text>

            {item.observacao && (
                <Text style={styles.observacao}>{item.observacao}</Text>
            )}

            <Text style={styles.data}>{formatarData(item.criadoEm)}</Text>
        </View>
    )

    return (
        <BaseLayout
            titulo={produto ? `Histórico - ${produto.nome}` : 'Histórico de Movimentações'}
        >
            <View style={styles.container}>
                {produto && (
                    <View style={styles.produtoInfo}>
                        <Text style={styles.produtoNome}>{produto.nome}</Text>
                        <Text style={styles.produtoEstoque}>
                            Estoque atual: {(() => {
                                const { total } = calcularEstoque(produto.id)
                                return total || Number(produto.quantidade) || 0
                            })()} unidades
                        </Text>
                    </View>
                )}

                {carregando ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={cores.primary} />
                        <Text style={styles.loadingTexto}>Carregando histórico...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={movimentacoesFiltradas}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMovimentacao}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Feather name="clock" size={64} color={cores.gray400} />
                                <Text style={styles.emptyTexto}>
                                    Nenhuma movimentação encontrada
                                </Text>
                                <Text style={styles.emptySubtexto}>
                                    {produto ?
                                        'Este produto ainda não possui movimentações' :
                                        'Nenhum produto possui movimentações ainda'
                                    }
                                </Text>
                            </View>
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}

                <View style={styles.acoesContainer}>
                    <TouchableOpacity
                        style={[styles.botaoAcao, styles.botaoEntrada]}
                        onPress={() => router.push(`/estoque/entrada${produto ? `?produtoId=${produto.id}` : ''}`)}
                        activeOpacity={0.8}
                    >
                        <Feather name="plus-circle" size={18} color={cores.white} />
                        <Text style={styles.textoBotao}>Nova Entrada</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.botaoAcao, styles.botaoSaida]}
                        onPress={() => router.push(`/estoque/saida${produto ? `?produtoId=${produto.id}` : ''}`)}
                        activeOpacity={0.8}
                    >
                        <Feather name="minus-circle" size={18} color={cores.white} />
                        <Text style={styles.textoBotao}>Nova Saída</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </BaseLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: cores.background,
    },

    produtoInfo: {
        backgroundColor: cores.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: cores.border,
    },
    produtoNome: {
        fontSize: 18,
        fontWeight: 'bold',
        color: cores.text,
        marginBottom: 4,
    },
    produtoEstoque: {
        fontSize: 14,
        color: cores.gray600,
    },

    itemContainer: {
        backgroundColor: cores.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: cores.border,
        shadowColor: cores.shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    indicadorTipo: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    tipoTexto: {
        fontSize: 16,
        fontWeight: '600',
        color: cores.text,
    },
    quantidade: {
        fontSize: 16,
        fontWeight: 'bold',
        color: cores.text,
    },
    origem: {
        fontSize: 14,
        color: cores.gray600,
        marginBottom: 4,
    },
    observacao: {
        fontSize: 14,
        color: cores.text,
        fontStyle: 'italic',
        marginBottom: 8,
        backgroundColor: cores.background,
        padding: 8,
        borderRadius: 8,
    },
    data: {
        fontSize: 12,
        color: cores.gray500,
        textAlign: 'right',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingTexto: {
        marginTop: 16,
        fontSize: 16,
        color: cores.gray600,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTexto: {
        fontSize: 18,
        fontWeight: 'bold',
        color: cores.text,
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtexto: {
        fontSize: 14,
        color: cores.gray600,
        marginTop: 8,
        textAlign: 'center',
    },

    acoesContainer: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        backgroundColor: cores.background,
    },
    botaoAcao: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: cores.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    botaoEntrada: {
        backgroundColor: cores.primary,
    },
    botaoSaida: {
        backgroundColor: cores.error,
    },
    textoBotao: {
        color: cores.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
})

export default HistoricoEstoque