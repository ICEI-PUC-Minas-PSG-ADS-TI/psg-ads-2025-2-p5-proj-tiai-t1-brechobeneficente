import React, { useContext, useState } from 'react'
import { useRouter } from 'expo-router'
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { DoacoesContext } from '../../context/DoacoesContext'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'
import ItemDoacao from './ItemDoacao'

const doacoesPorPagina = 5

const ListaDoacao = () => {
  const {
    doacoes,
    excluirDoacao,
    carregando,
    carregarDoacoes,
    totalDoacoes
  } = useContext(DoacoesContext)

  const [filtro, setFiltro] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [refrescando, setRefrescando] = useState(false)
  const router = useRouter()

  const atualizarDoacao = (doacao) => {
    try {
      if (!doacao || typeof doacao !== 'object') return

      router.push({
        pathname: '/doacoes/forms',
        params: { 
          id: doacao.id,
          editando: 'true'
        }
      })
    } catch (error) {
      console.error('Erro ao navegar para edição:', error)
      Alert.alert('Erro', 'Não foi possível editar a doação.')
    }
  }

  const confirmarExclusao = (id, nome) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a doação de "${nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => handleExcluirDoacao(id)
        }
      ]
    )
  }

  const handleExcluirDoacao = async (id) => {
    try {
      await excluirDoacao(id)
      Alert.alert('Sucesso', 'Doação excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir doação:', error)
      Alert.alert('Erro', 'Não foi possível excluir a doação.')
    }
  }

  const handleRefresh = async () => {
    setRefrescando(true)
    try {
      await carregarDoacoes()
    } finally {
      setRefrescando(false)
    }
  }

  const doacoesFiltradas = doacoes.filter((d) =>
    (d.nomeDoador?.toLowerCase() || '').includes(filtro.toLowerCase())
  )

  const totalPaginas = Math.ceil(doacoesFiltradas.length / doacoesPorPagina)

  const doacoesPaginadas = doacoesFiltradas.slice(
    (paginaAtual - 1) * doacoesPorPagina,
    paginaAtual * doacoesPorPagina
  )

  const paginaAnterior = () => {
    if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1)
  }

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1)
  }

  return (
    <BaseLayout titulo="Doações">
      <View style={styles.container}>
        <View style={styles.estatisticas}>
          <View style={styles.cardEstatistica}>
            <Feather name="gift" size={20} color={cores.primary} />
            <Text style={styles.numeroEstatistica}>{totalDoacoes}</Text>
            <Text style={styles.labelEstatistica}>Total</Text>
          </View>
        </View>

        <View style={styles.areaAcoes}>
          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={() => router.push('/doacoes/forms')}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color={cores.white} />
            <Text style={styles.textoBotaoAdicionar}>Nova Doação</Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Feather name="search" size={20} color={cores.gray500} style={styles.searchIcon} />
            <TextInput
              placeholder="Buscar por nome do doador..."
              style={styles.input}
              value={filtro}
              onChangeText={setFiltro}
              placeholderTextColor={cores.gray500}
            />
          </View>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.cellNome}>Doador</Text>
          <Text style={styles.cellItem}>Item</Text>
          <Text style={styles.cellQuantidade}>Qtd</Text>
          <Text style={styles.cellValor}>Valor</Text>
          <Text style={styles.cellAcoes}>Ações</Text>
        </View>

        {carregando && !refrescando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={cores.primary} />
            <Text style={styles.loadingTexto}>Carregando doações...</Text>
          </View>
        ) : (
          <FlatList
            data={doacoesPaginadas}
            keyExtractor={(item) => (item?.id ? item.id.toString() : Math.random().toString())}
            renderItem={({ item }) => (
              <ItemDoacao
                doacao={item}
                onEditar={atualizarDoacao}
                onExcluir={() => confirmarExclusao(item.id, item.nomeDoador)}
              />
            )}
            ListEmptyComponent={
              !carregando && (
                <View style={styles.emptyContainer}>
                  <Feather name="gift" size={64} color={cores.gray400} />
                  <Text style={styles.emptyTexto}>
                    {filtro ? 'Nenhuma doação encontrada' : 'Nenhuma doação cadastrada'}
                  </Text>
                  <Text style={styles.emptySubtexto}>
                    {filtro ? 'Tente ajustar sua busca' : 'Comece adicionando sua primeira doação'}
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
            <TouchableOpacity onPress={paginaAnterior} disabled={paginaAtual == 1}>
              <Text style={[styles.paginaBotao, paginaAtual == 1 && styles.botaoDesativado]}>←</Text>
            </TouchableOpacity>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
              <TouchableOpacity key={pagina} onPress={() => setPaginaAtual(pagina)}>
                <Text
                  style={[
                    styles.paginaNumero,
                    paginaAtual == pagina && styles.paginaAtiva
                  ]}
                >
                  {pagina}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={proximaPagina} disabled={paginaAtual == totalPaginas}>
              <Text
                style={[
                  styles.paginaBotao,
                  paginaAtual == totalPaginas && styles.botaoDesativado
                ]}
              >
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
  container: { flex: 1, backgroundColor: cores.background },
  estatisticas: { flexDirection: 'row', gap: 12, marginBottom: 20 },
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
  labelEstatistica: { fontSize: 12, color: cores.gray600, marginTop: 4 },
  areaAcoes: { gap: 16, marginBottom: 20 },
  botaoAdicionar: {
    backgroundColor: cores.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  textoBotaoAdicionar: {
    color: cores.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8
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
  searchIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: cores.text, paddingVertical: 14 },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: cores.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center'
  },
  cellNome: { flex: 4, fontWeight: 'bold', color: cores.white, fontSize: 14 },
  cellItem: { flex: 2, fontWeight: 'bold', textAlign: 'center', color: cores.white, fontSize: 14 },
  cellQuantidade: { flex: 2, fontWeight: 'bold', textAlign: 'center', color: cores.white, fontSize: 14 },
  cellValor: { flex: 3, fontWeight: 'bold', textAlign: 'right', color: cores.white, fontSize: 14 },
  cellAcoes: { flex: 3, fontWeight: 'bold', textAlign: 'center', color: cores.white, fontSize: 14 },
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingTexto: { marginTop: 16, fontSize: 16, color: cores.gray600 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyTexto: { fontSize: 18, fontWeight: 'bold', color: cores.text, marginTop: 16, textAlign: 'center' },
  emptySubtexto: { fontSize: 14, color: cores.gray600, marginTop: 8, textAlign: 'center' },
  paginacao: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 20, gap: 10 },
  paginaBotao: { fontSize: 18, color: cores.primary, paddingHorizontal: 12, paddingVertical: 8, fontWeight: 'bold' },
  botaoDesativado: { color: cores.gray400 },
  paginaNumero: { fontSize: 16, color: cores.primary, borderWidth: 2, borderColor: cores.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontWeight: '600' },
  paginaAtiva: { backgroundColor: cores.primary, color: cores.white }
})

export default ListaDoacao
