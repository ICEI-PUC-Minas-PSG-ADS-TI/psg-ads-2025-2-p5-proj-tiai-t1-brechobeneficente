import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BaseLayout from '../shared/BaseLayout';
import cores from '../../constants/colors';

const { width } = Dimensions.get('window');

export default function Home() {
    // Dados mockados para demonstração
    const dadosMockados = useMemo(() => {
        return {
            vendasMes: 15680.50,
            doacoesRecebidas: 127,
            produtosCadastrados: 342,
            beneficiariosCadastrados: 28,
            receitaMensal: 8945.75,
            produtosVendidos: 89,
            estoqueDisponivel: 253
        };
    }, []);

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
                            <Text style={styles.cardTitulo}>Receita do Mês</Text>
                        </View>
                        <Text style={styles.cardValor}>{formatarMoeda(dadosMockados.receitaMensal)}</Text>
                    </View>

                    <View style={[styles.card, styles.cardSecundario]}>
                        <View style={styles.cardHeader}>
                            <Feather name="heart" size={24} color={cores.white} />
                            <Text style={styles.cardTitulo}>Doações Recebidas</Text>
                        </View>
                        <Text style={styles.cardValor}>{dadosMockados.doacoesRecebidas}</Text>
                        <Text style={styles.cardDescricao}>Este mês</Text>
                    </View>
                </View>

                <View style={styles.gridContainer}>
                    <View style={[styles.card, styles.cardInfo]}>
                        <View style={styles.cardHeader}>
                            <Feather name="package" size={24} color={cores.white} />
                            <Text style={styles.cardTitulo}>Produtos</Text>
                        </View>
                        <Text style={styles.cardValor}>{dadosMockados.estoqueDisponivel}</Text>
                        <Text style={styles.cardDescricao}>Disponíveis</Text>
                    </View>

                    <View style={[styles.card, styles.cardSucesso]}>
                        <View style={styles.cardHeader}>
                            <Feather name="shopping-bag" size={24} color={cores.white} />
                            <Text style={styles.cardTitulo}>Vendas</Text>
                        </View>
                        <Text style={styles.cardValor}>{dadosMockados.produtosVendidos}</Text>
                        <Text style={styles.cardDescricao}>Este mês</Text>
                    </View>
                </View>

                <View style={styles.cardLargo}>
                    <View style={styles.cardHeader}>
                        <Feather name="users" size={24} color={cores.primary} />
                        <Text style={[styles.cardTitulo, { color: cores.text }]}>Beneficiários Cadastrados</Text>
                    </View>
                    <Text style={[styles.cardValorGrande, { color: cores.primary }]}>{dadosMockados.beneficiariosCadastrados}</Text>
                    <Text style={styles.cardDescricaoGrande}>Famílias atendidas pelo programa</Text>
                </View>

                <View style={styles.cardResumo}>
                    <Text style={styles.resumoTitulo}>Resumo do Período</Text>
                    <View style={styles.resumoItem}>
                        <View style={styles.resumoIcone}>
                            <Feather name="trending-up" size={16} color={cores.success} />
                        </View>
                        <Text style={styles.resumoTexto}>
                            Total de produtos cadastrados: <Text style={styles.resumoDestaque}>{dadosMockados.produtosCadastrados}</Text>
                        </Text>
                    </View>
                    <View style={styles.resumoItem}>
                        <View style={styles.resumoIcone}>
                            <Feather name="award" size={16} color={cores.primary} />
                        </View>
                        <Text style={styles.resumoTexto}>
                            Impacto social: <Text style={styles.resumoDestaque}>R$ {formatarMoeda(dadosMockados.vendasMes).replace('R$ ', '')} arrecadados</Text>
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