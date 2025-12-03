import React, { useState, useCallback } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Modal,
    Alert
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import cores from '../../constants/colors'
import { useProdutos } from '../../context/ProdutosContext'

const SeletorProduto = ({ value, onSelect, placeholder = "Selecione um produto" }) => {
    const [modalVisible, setModalVisible] = useState(false)
    const [busca, setBusca] = useState('')
    const { produtos, carregando } = useProdutos()

    const produtosFiltrados = produtos.filter(produto => {
        if (!busca) return true
        const termoLower = busca.toLowerCase()
        return (
            produto.nome?.toLowerCase().includes(termoLower) ||
            produto.codigo?.toLowerCase().includes(termoLower) ||
            produto.categoria?.toLowerCase().includes(termoLower)
        )
    })

    const selecionarProduto = useCallback((produto) => {
        onSelect(produto)
        setModalVisible(false)
        setBusca('')
    }, [onSelect])

    const renderItemProduto = ({ item }) => (
        <TouchableOpacity
            style={styles.itemProduto}
            onPress={() => selecionarProduto(item)}
        >
            <View style={styles.infoProduto}>
                <Text style={styles.nomeProduto}>{item.nome}</Text>
                <Text style={styles.codigoProduto}>Código: {item.codigo}</Text>
                <Text style={styles.categoriaProduto}>Categoria: {item.categoria}</Text>
                <Text style={[
                    styles.estoqueProduto,
                    (item.quantidade || 0) < 5 ? styles.estoquebaixo :
                        (item.quantidade || 0) === 0 ? styles.estoqueSemEstoque : styles.estoqueOk
                ]}>
                    Estoque: {item.quantidade || 0} un.
                </Text>
            </View>
            <Feather name="chevron-right" size={20} color={cores.text} />
        </TouchableOpacity>
    )

    const produtoSelecionado = value ? produtos.find(p => p.id === value) : null

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.seletor}
                onPress={() => setModalVisible(true)}
            >
                <View style={styles.conteudoSeletor}>
                    {produtoSelecionado ? (
                        <View>
                            <Text style={styles.produtoSelecionadoNome}>{produtoSelecionado.nome}</Text>
                            <Text style={styles.produtoSelecionadoInfo}>
                                {produtoSelecionado.codigo} • {produtoSelecionado.categoria} • Estoque: {produtoSelecionado.quantidade || 0}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.placeholder}>{placeholder}</Text>
                    )}
                </View>
                <Feather name="chevron-down" size={20} color={cores.text} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.botaoFechar}
                        >
                            <Feather name="x" size={24} color={cores.text} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitulo}>Selecionar Produto</Text>
                    </View>

                    <View style={styles.buscaContainer}>
                        <Feather name="search" size={20} color={cores.text} style={styles.iconeBusca} />
                        <TextInput
                            style={styles.inputBusca}
                            placeholder="Buscar por nome, código ou categoria..."
                            value={busca}
                            onChangeText={setBusca}
                            placeholderTextColor={cores.text + '80'}
                        />
                    </View>

                    <FlatList
                        data={produtosFiltrados}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItemProduto}
                        contentContainerStyle={styles.listaProdutos}
                        showsVerticalScrollIndicator={false}
                        refreshing={carregando}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Feather name="package" size={48} color={cores.text + '40'} />
                                <Text style={styles.emptyText}>
                                    {busca ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                                </Text>
                                {busca && (
                                    <Text style={styles.emptySubtext}>
                                        Tente ajustar os termos da busca
                                    </Text>
                                )}
                            </View>
                        )}
                    />
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    seletor: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: cores.white,
        borderWidth: 1,
        borderColor: cores.primary + '40',
        borderRadius: 12,
        padding: 16,
        minHeight: 56,
    },
    conteudoSeletor: {
        flex: 1,
    },
    placeholder: {
        color: cores.text + '60',
        fontSize: 16,
    },
    produtoSelecionadoNome: {
        fontSize: 16,
        fontWeight: '600',
        color: cores.text,
        marginBottom: 4,
    },
    produtoSelecionadoInfo: {
        fontSize: 14,
        color: cores.text + '80',
    },
    modal: {
        flex: 1,
        backgroundColor: cores.background,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: cores.primary + '20',
    },
    botaoFechar: {
        marginRight: 16,
    },
    modalTitulo: {
        fontSize: 20,
        fontWeight: '600',
        color: cores.text,
    },
    buscaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 20,
        marginBottom: 16,
        backgroundColor: cores.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: cores.primary + '30',
        paddingHorizontal: 16,
    },
    iconeBusca: {
        marginRight: 12,
    },
    inputBusca: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: cores.text,
    },
    listaProdutos: {
        paddingHorizontal: 20,
    },
    itemProduto: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: cores.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: cores.primary + '20',
    },
    infoProduto: {
        flex: 1,
    },
    nomeProduto: {
        fontSize: 16,
        fontWeight: '600',
        color: cores.text,
        marginBottom: 4,
    },
    codigoProduto: {
        fontSize: 14,
        color: cores.text + '80',
        marginBottom: 2,
    },
    categoriaProduto: {
        fontSize: 14,
        color: cores.text + '80',
        marginBottom: 2,
    },
    estoqueProduto: {
        fontSize: 14,
        fontWeight: '500',
    },
    estoqueOk: {
        color: cores.primary,
    },
    estoqueBaixo: {
        color: cores.warning,
    },
    estoqueSemEstoque: {
        color: cores.error,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '500',
        color: cores.text + '60',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: cores.text + '40',
        marginTop: 8,
        textAlign: 'center',
    },
})

export default SeletorProduto