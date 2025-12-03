import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { isThisMonth, parseISO } from 'date-fns';
import BaseLayout from '../shared/BaseLayout';
import cores from '../../constants/colors';
import { usePedidos } from '../../context/PedidosContext';
import { useDoacoes } from '../../context/DoacoesContext';
import { useProdutos } from '../../context/ProdutosContext';

const { width } = Dimensions.get('window');

export default function Home() {
    const { pedidos } = usePedidos();
    const { doacoes } = useDoacoes();
    const { produtos } = useProdutos();

    const dashboardData = useMemo(() => {
        let totalVendas = 0;
        let vendasMesAtual = 0;
        let pedidosFinalizados = 0;
        let pedidosEmAndamento = 0;


        if (pedidos.length > 0) {
            const pedidosSample = pedidos.slice(0, 2).map(p => ({
                id: p.id,
                status: p.status,
                total: p.total,
                tipoVenda: p.tipoVenda,
                criadoEm: p.criadoEm
            }));
        }

        pedidos.forEach(pedido => {
            if (!pedido || !pedido.status) return;

            const valor = Number(pedido.total || 0);
            const status = pedido.status;
            const data = pedido.criadoEm;
            const isVenda = pedido.tipoVenda == 'venda';
            const isFinalizado = status == 'finalizado';
            const isPendente = status == 'pendente';

            if (isFinalizado && isVenda) {
                totalVendas += valor;
                pedidosFinalizados++;


                const dataParaVerificar = pedido.dataFinalizacao || data;
                if (dataParaVerificar && isThisMonth(dataParaVerificar instanceof Date ? dataParaVerificar : parseISO(dataParaVerificar.toString()))) {
                    vendasMesAtual += valor;
                }
            } else if (isPendente) {
                pedidosEmAndamento++;
            }
        });

        let totalDoacoes = doacoes.length;
        let valorTotalDoacoes = 0;
        let doacoesMesAtual = 0;

        doacoes.forEach(doacao => {
            if (!doacao) return;

            const valor = Number(doacao.valor || 0);
            valorTotalDoacoes += valor;

            const data = doacao.criadoEm;
            if (data && isThisMonth(data instanceof Date ? data : parseISO(data))) {
                doacoesMesAtual++;
            }
        });

        let totalProdutos = produtos.length;
        let produtosDisponveis = 0;
        let valorTotalEstoque = 0;

        produtos.forEach(produto => {
            if (!produto) return;

            const estoque = Number(produto.estoque || 0);
            const preco = Number(produto.preco || 0);

            if (estoque > 0) {
                produtosDisponveis++;
                valorTotalEstoque += (estoque * preco);
            }
        });

        return {
            totalVendas,
            vendasMesAtual,
            pedidosFinalizados,
            pedidosEmAndamento,
            totalDoacoes,
            valorTotalDoacoes,
            doacoesMesAtual,
            totalProdutos,
            produtosDisponveis,
            valorTotalEstoque
        };
    }, [pedidos, doacoes, produtos]);

    const formatarMoeda = (valor) => {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    return (
        <BaseLayout titulo="Dashboard" scrollable>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.titulo}>Bem-vindo ao Brechó Beneficente!</Text>
                    <Text style={styles.subtitulo}>
                        Aqui estão as métricas do seu brechó beneficente
                    </Text>
                </View>

                <View style={styles.gridContainer}>
                    <View style={[styles.card, styles.cardPrimario]}>
                        <View style={styles.cardHeader}>
                            <Feather name="dollar-sign" size={24} color={cores.white} />
                            <Text style={styles.cardTitulo}>Vendas do mês</Text>
                        </View>
                        <Text style={styles.cardValor}>{formatarMoeda(dashboardData.vendasMesAtual)}</Text>
                    </View>

                    <View style={[styles.card, styles.cardSecundario]}>
                        <View style={styles.cardHeader}>
                            <Feather name="heart" size={24} color={cores.white} />
                            <Text style={styles.cardTitulo}>Doações recebidas</Text>
                        </View>
                        <Text style={styles.cardValor}>{dashboardData.doacoesMesAtual}</Text>
                        <Text style={styles.cardDescricao}>Este mês</Text>
                    </View>
                </View>

                <View style={styles.gridContainer}>
                    <View style={[styles.card, styles.cardInfo]}>
                        <View style={styles.cardHeader}>
                            <Feather name="package" size={24} color={cores.white} />
                            <Text style={styles.cardTitulo}>Produtos</Text>
                        </View>
                        <Text style={styles.cardValor}>{dashboardData.produtosDisponveis}</Text>
                        <Text style={styles.cardDescricao}>Disponíveis</Text>
                    </View>

                    <View style={[styles.card, styles.cardSucesso]}>
                        <View style={styles.cardHeader}>
                            <Feather name="check-circle" size={24} color={cores.white} />
                            <Text style={styles.cardTitulo}>Pedidos</Text>
                        </View>
                        <Text style={styles.cardValor}>{dashboardData.pedidosFinalizados}</Text>
                        <Text style={styles.cardDescricao}>Finalizados</Text>
                    </View>
                </View>

                <View style={styles.cardLargo}>
                    <View style={styles.cardHeader}>
                        <Feather name="trending-up" size={24} color={cores.primary} />
                        <Text style={[styles.cardTitulo, { color: cores.text }]}>Total de vendas realizadas</Text>
                    </View>
                    <Text style={[styles.cardValorGrande, { color: cores.primary }]}>{formatarMoeda(dashboardData.totalVendas)}</Text>
                    <Text style={styles.cardDescricaoGrande}>Receita total do brechó</Text>
                </View>

                <View style={styles.cardResumo}>
                    <Text style={styles.resumoTitulo}>Resumo do período</Text>
                    <View style={styles.resumoItem}>
                        <View style={styles.resumoIcone}>
                            <Feather name="package" size={16} color={cores.success} />
                        </View>
                        <Text style={styles.resumoTexto}>
                            Total de produtos cadastrados: <Text style={styles.resumoDestaque}>{dashboardData.totalProdutos}</Text>
                        </Text>
                    </View>
                    <View style={styles.resumoItem}>
                        <View style={styles.resumoIcone}>
                            <Feather name="heart" size={16} color={cores.primary} />
                        </View>
                        <Text style={styles.resumoTexto}>
                            Total de doações recebidas: <Text style={styles.resumoDestaque}>{dashboardData.totalDoacoes} ({formatarMoeda(dashboardData.valorTotalDoacoes)})</Text>
                        </Text>
                    </View>
                    <View style={styles.resumoItem}>
                        <View style={styles.resumoIcone}>
                            <Feather name="alert-circle" size={16} color="#f39c12" />
                        </View>
                        <Text style={styles.resumoTexto}>
                            Pedidos em andamento: <Text style={styles.resumoDestaque}>{dashboardData.pedidosEmAndamento}</Text>
                        </Text>
                    </View>
                    <View style={styles.resumoItem}>
                        <View style={styles.resumoIcone}>
                            <Feather name="dollar-sign" size={16} color={cores.secondary} />
                        </View>
                        <Text style={styles.resumoTexto}>
                            Valor do estoque: <Text style={styles.resumoDestaque}>{formatarMoeda(dashboardData.valorTotalEstoque)}</Text>
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </BaseLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        paddingVertical: 16,
    },
    titulo: {
        fontSize: 26,
        fontWeight: 'bold',
        color: cores.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitulo: {
        fontSize: 16,
        color: cores.gray600,
        textAlign: 'center',
        lineHeight: 22,
    },
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 4,
        shadowColor: cores.shadowColor,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
    },
    cardPrimario: {
        backgroundColor: cores.primary,
    },
    cardSecundario: {
        backgroundColor: cores.secondary,
    },
    cardInfo: {
        backgroundColor: '#3498db',
    },
    cardSucesso: {
        backgroundColor: '#2ecc71',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitulo: {
        fontSize: 14,
        fontWeight: '600',
        color: cores.white,
        marginLeft: 8,
        flex: 1,
    },
    cardValor: {
        fontSize: 20,
        fontWeight: 'bold',
        color: cores.white,
        marginBottom: 4,
    },
    cardDescricao: {
        fontSize: 12,
        color: cores.white,
        opacity: 0.9,
    },
    progressoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    progressoBar: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 3,
        marginRight: 8,
    },
    progressoFill: {
        height: '100%',
        backgroundColor: cores.white,
        borderRadius: 3,
    },
    progressoTexto: {
        fontSize: 12,
        color: cores.white,
        fontWeight: '600',
    },
    cardLargo: {
        backgroundColor: cores.white,
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: cores.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: cores.border,
        alignItems: 'center',
    },
    cardValorGrande: {
        fontSize: 48,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    cardDescricaoGrande: {
        fontSize: 14,
        color: cores.gray600,
        textAlign: 'center',
    },
    cardResumo: {
        backgroundColor: cores.background,
        padding: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: cores.primary,
        marginBottom: 20,
    },
    resumoTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: cores.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    resumoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    resumoIcone: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: cores.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    resumoTexto: {
        fontSize: 14,
        color: cores.gray700,
        flex: 1,
        lineHeight: 20,
    },
    resumoDestaque: {
        fontWeight: 'bold',
        color: cores.primary,
    },
});