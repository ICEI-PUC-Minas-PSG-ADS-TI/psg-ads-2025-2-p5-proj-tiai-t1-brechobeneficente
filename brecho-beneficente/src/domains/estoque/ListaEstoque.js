import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useProdutos } from '../../context/ProdutosContext'
import { useEstoque } from '../../context/EstoqueContext'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'
import ItemEstoque from './ItemEstoque'

const itemPorPagina = 5

const ListaEstoque = () => {
  const router = useRouter()
  const { produtos, carregando: carregandoProdutos, carregarProdutos } = useProdutos()
  const { historico, carregando: carregandoEstoque, carregarHistorico } = useEstoque()
  const [filtro, setFiltro] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [refrescando, setRefrescando] = useState(false)

  useEffect(() => {
    carregarHistorico()
  }, [])

  useEffect(() => {
    setPaginaAtual(1)
  }, [filtro])

  const handleRefresh = async () => {
    setRefrescando(true)
    try {
      await Promise.all([
        carregarProdutos(),
        carregarHistorico()
      ])
    } finally {
      setRefrescando(false)
    }
  }

  const produtosFiltrados = produtos.filter(p =>
    p.nome?.toLowerCase().includes(filtro.trim().toLowerCase())
  )

  const totalPaginas = Math.ceil(produtosFiltrados.length / itemPorPagina)

  const produtosPaginados = produtosFiltrados.slice(
    (paginaAtual - 1) * itemPorPagina,
    paginaAtual * itemPorPagina
  )

  const { calcularEstoque } = useEstoque()

  const estatisticas = {
    totalProdutos: produtos.length,
    produtosComEstoque: produtos.filter(p => {
      const { total } = calcularEstoque(p.id)
      const estoqueAtual = total || Number(p.quantidade) || 0
      return estoqueAtual > 0
    }).length,
    produtosSemEstoque: produtos.filter(p => {
      const { total } = calcularEstoque(p.id)
      const estoqueAtual = total || Number(p.quantidade) || 0
      return estoqueAtual === 0
    }).length,
    totalMovimentacoes: historico.length
  }

  const carregando = carregandoProdutos || carregandoEstoque

  return (
    <BaseLayout titulo="Controle de Estoque">
      <View style={styles.container}>
        <View style={styles.estatisticas}>
          <View style={styles.cardEstatistica}>
            <Feather name="package" size={20} color={cores.primary} />
            <Text style={styles.numeroEstatistica}>{estatisticas.produtosComEstoque}</Text>
            <Text style={styles.labelEstatistica}>Com Estoque</Text>
          </View>

          <View style={styles.cardEstatistica}>
            <Feather name="alert-triangle" size={20} color={cores.error} />
            <Text style={styles.numeroEstatistica}>{estatisticas.produtosSemEstoque}</Text>
            <Text style={styles.labelEstatistica}>Sem Estoque</Text>
          </View>

          <View style={styles.cardEstatistica}>
            <Feather name="activity" size={20} color={cores.secondary} />
            <Text style={styles.numeroEstatistica}>{estatisticas.totalMovimentacoes}</Text>
            <Text style={styles.labelEstatistica}>Movimentações</Text>
          </View>
        </View>

        <View style={styles.areaAcoes}>
          <View style={styles.botoesContainer}>
            <TouchableOpacity
              style={[styles.botaoAcao, styles.botaoEntrada]}
              onPress={() => router.push('/estoque/entrada')}
              activeOpacity={0.8}
            >
              <Feather name="plus-circle" size={18} color={cores.white} />
              <Text style={styles.textoBotao}>Entrada</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botaoAcao, styles.botaoSaida]}
              onPress={() => router.push('/estoque/saida')}
              activeOpacity={0.8}
            >
              <Feather name="minus-circle" size={18} color={cores.white} />
              <Text style={styles.textoBotao}>Saída</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botaoAcao, styles.botaoHistorico]}
              onPress={() => router.push('/estoque/historico')}
              activeOpacity={0.8}
            >
              <Feather name="clock" size={18} color={cores.white} />
              <Text style={styles.textoBotao}>Histórico</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Feather name="search" size={20} color={cores.gray500} style={styles.searchIcon} />
            <TextInput
              placeholder="Buscar produto por nome..."
              style={styles.input}
              value={filtro}
              onChangeText={setFiltro}
              placeholderTextColor={cores.gray500}
            />
          </View>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.cellNome}>Produto</Text>
          <Text style={styles.cellQtd}>Atual</Text>
          <Text style={styles.cellEntrada}>Entradas</Text>
          <Text style={styles.cellSaida}>Saídas</Text>
          <Text style={styles.cellAcoes}>Ações</Text>
        </View>

        {carregando && !refrescando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={cores.primary} />
            <Text style={styles.loadingTexto}>Carregando estoque...</Text>
          </View>
        ) : (
          <FlatList
            data={produtosPaginados}
            keyExtractor={item => item.id?.toString() || Math.random().toString()}
            renderItem={({ item }) => <ItemEstoque produto={item} />}
            ListEmptyComponent={
              !carregando && (
                <View style={styles.emptyContainer}>
                  <Feather name="package" size={64} color={cores.gray400} />
                  <Text style={styles.emptyTexto}>
                    {filtro ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                  </Text>
                  <Text style={styles.emptySubtexto}>
                    {filtro ? 'Tente ajustar sua busca' : 'Comece cadastrando produtos'}
                  </Text>
                </View>
              )
            }
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={handleRefresh}
                colors={[cores.primary]}
                tintColor={cores.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {totalPaginas > 1 && (
          <View style={styles.paginacao}>
            <TouchableOpacity
              onPress={() => setPaginaAtual(paginaAtual - 1)}
              disabled={paginaAtual === 1}
            >
              <Text style={[
                styles.paginaBotao,
                paginaAtual === 1 && styles.botaoDesativado
              ]}>
                ←
              </Text>
            </TouchableOpacity>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
              <TouchableOpacity key={pagina} onPress={() => setPaginaAtual(pagina)}>
                <Text style={[
                  styles.paginaNumero,
                  paginaAtual === pagina && styles.paginaAtiva
                ]}>
                  {pagina}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setPaginaAtual(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
            >
              <Text style={[
                styles.paginaBotao,
                paginaAtual === totalPaginas && styles.botaoDesativado
              ]}>
                →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </BaseLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.background
  },
  estatisticas: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  cardEstatistica: {
    flex: 1,
    backgroundColor: cores.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: cores.border
  },
  numeroEstatistica: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.text,
    marginTop: 8
  },
  labelEstatistica: {
    fontSize: 12,
    color: cores.gray600,
    marginTop: 4
  },

  areaAcoes: {
    gap: 16,
    marginBottom: 20
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: 8
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
    elevation: 3
  },
  botaoEntrada: {
    backgroundColor: cores.primary
  },
  botaoSaida: {
    backgroundColor: cores.error
  },
  botaoHistorico: {
    backgroundColor: cores.secondary
  },
  textoBotao: {
    color: cores.white,
    fontWeight: 'bold',
    fontSize: 14
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.white,
    borderWidth: 2,
    borderColor: cores.border,
    borderRadius: 12,
    paddingHorizontal: 16
  },
  searchIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: cores.text,
    paddingVertical: 14
  },

  headerRow: {
    flexDirection: 'row',
    backgroundColor: cores.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center'
  },
  cellNome: {
    flex: 4,
    fontWeight: 'bold',
    color: cores.white,
    fontSize: 14
  },
  cellQtd: {
    flex: 2,
    fontWeight: 'bold',
    textAlign: 'center',
    color: cores.white,
    fontSize: 14
  },
  cellEntrada: {
    flex: 2,
    fontWeight: 'bold',
    textAlign: 'center',
    color: cores.white,
    fontSize: 14
  },
  cellSaida: {
    flex: 2,
    fontWeight: 'bold',
    textAlign: 'center',
    color: cores.white,
    fontSize: 14
  },
  cellAcoes: {
    flex: 2,
    fontWeight: 'bold',
    textAlign: 'center',
    color: cores.white,
    fontSize: 14
  },

  loadingContainer: {
    padding: 40,
    alignItems: 'center'
  },
  loadingTexto: {
    marginTop: 16,
    fontSize: 16,
    color: cores.gray600
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.text,
    marginTop: 16,
    textAlign: 'center'
  },
  emptySubtexto: {
    fontSize: 14,
    color: cores.gray600,
    marginTop: 8,
    textAlign: 'center'
  },

  paginacao: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
    gap: 10
  },
  paginaBotao: {
    fontSize: 18,
    color: cores.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontWeight: 'bold'
  },
  botaoDesativado: {
    color: cores.gray400
  },
  paginaNumero: {
    fontSize: 16,
    color: cores.primary,
    borderWidth: 2,
    borderColor: cores.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontWeight: '600'
  },
  paginaAtiva: {
    backgroundColor: cores.primary,
    color: cores.white
  }
})

export default ListaEstoque