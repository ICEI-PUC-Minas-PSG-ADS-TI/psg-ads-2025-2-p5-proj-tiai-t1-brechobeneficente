import { useRouter } from 'expo-router'
import { useContext, useState } from 'react'
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
import { ProdutosContext } from '../../context/ProdutosContext'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'
import ItemProduto from './ItemProduto'

const itemPorPagina = 5

const ListaProdutos = () => {
  const {
    produtos,
    excluirProduto,
    carregando,
    carregarProdutos,
    totalProdutos,
    produtosSemEstoque
  } = useContext(ProdutosContext)
  const [filtro, setFiltro] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [refrescando, setRefrescando] = useState(false)
  const router = useRouter()

  const editarProduto = (produto) => {
    try {
      if (!produto || typeof produto !== 'object') return

      const json = JSON.stringify({
        id: produto.id || '',
        codigo: produto.codigo || '',
        nome: produto.nome || '',
        quantidade: produto.quantidade ?? 0,
        valorCusto: produto.valorCusto ?? 0,
        valorVenda: produto.valorVenda ?? 0
      })

      router.push({ pathname: '/produtos/form', params: { produto: json } })
    } catch (error) {
      console.error('Erro ao preparar produto para edição:', error)
      Alert.alert('Erro', 'Não foi possível editar o produto')
    }
  }

  const confirmarExclusao = (id, nome) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o produto "${nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => handleExcluirProduto(id)
        }
      ]
    )
  }

  const handleExcluirProduto = async (id) => {
    try {
      await excluirProduto(id)
      Alert.alert('Sucesso', 'Produto excluído com sucesso!')
    } catch (error) {
    }
  }

  const handleRefresh = async () => {
    setRefrescando(true)
    try {
      await carregarProdutos()
    } finally {
      setRefrescando(false)
    }
  }

  const produtosFiltrados = produtos.filter(p =>
    (p.nome?.toLowerCase() || '').includes(filtro.toLowerCase()) ||
    ((typeof p.codigo == 'string' || typeof p.codigo == 'number') ? p.codigo.toString() : '').includes(filtro)
  )


  const totalPaginas = Math.ceil(produtosFiltrados.length / itemPorPagina)

  const produtosPaginados = produtosFiltrados.slice(
    (paginaAtual - 1) * itemPorPagina,
    paginaAtual * itemPorPagina
  )

  const paginaAnterior = () => {
    if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1)
  }

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1)
  }

  return (
    <BaseLayout titulo="Produtos">
      <View style={styles.container}>
        <View style={styles.estatisticas}>
          <View style={styles.cardEstatistica}>
            <Feather name="package" size={20} color={cores.primary} />
            <Text style={styles.numeroEstatistica}>{totalProdutos}</Text>
            <Text style={styles.labelEstatistica}>Total</Text>
          </View>
          <View style={styles.cardEstatistica}>
            <Feather name="alert-triangle" size={20} color={cores.error} />
            <Text style={styles.numeroEstatistica}>{produtosSemEstoque}</Text>
            <Text style={styles.labelEstatistica}>Sem Estoque</Text>
          </View>
        </View>

        <View style={styles.areaAcoes}>
          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={() => router.push('/produtos/form')}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color={cores.white} />
            <Text style={styles.textoBotaoAdicionar}>Novo Produto</Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Feather name="search" size={20} color={cores.gray500} style={styles.searchIcon} />
            <TextInput
              placeholder="Buscar por nome ou código..."
              style={styles.input}
              value={filtro}
              onChangeText={setFiltro}
              placeholderTextColor={cores.gray500}
            />
          </View>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.cellNome}>Nome</Text>
          <Text style={styles.cellQuantidade}>Qtd</Text>
          <Text style={styles.cellValor}>Valor</Text>
          <Text style={styles.cellAcoes}>Ações</Text>
        </View>

        {carregando && !refrescando && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={cores.primary} />
            <Text style={styles.loadingTexto}>Carregando produtos...</Text>
          </View>
        )}

        <FlatList
          data={produtosPaginados}
          keyExtractor={item => (item?.id ? item.id.toString() : Math.random().toString())}
          renderItem={({ item }) => (
            <ItemProduto
              produto={item}
              onEditar={editarProduto}
              onExcluir={(id) => confirmarExclusao(id, item.nome)}
            />
          )}
          ListEmptyComponent={
            !carregando ? (
              <View style={styles.emptyContainer}>
                <Feather name="package" size={64} color={cores.gray400} />
                <Text style={styles.emptyTexto}>
                  {filtro ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                </Text>
                <Text style={styles.emptySubtexto}>
                  {filtro ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro produto'}
                </Text>
              </View>
            ) : null
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

        {totalPaginas > 1 && (
          <View style={styles.paginacao}>
            <TouchableOpacity onPress={paginaAnterior} disabled={paginaAtual == 1}>
              <Text style={[styles.paginaBotao, paginaAtual == 1 && styles.botaoDesativado]}>←</Text>
            </TouchableOpacity>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
              <TouchableOpacity key={pagina} onPress={() => setPaginaAtual(pagina)}>
                <Text style={[
                  styles.paginaNumero,
                  paginaAtual == pagina && styles.paginaAtiva
                ]}>
                  {pagina}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={proximaPagina} disabled={paginaAtual == totalPaginas}>
              <Text style={[styles.paginaBotao, paginaAtual == totalPaginas && styles.botaoDesativado]}>→</Text>
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
    backgroundColor: cores.background,
  },
  estatisticas: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
    borderColor: cores.border,
  },
  numeroEstatistica: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.text,
    marginTop: 8,
  },
  labelEstatistica: {
    fontSize: 12,
    color: cores.gray600,
    marginTop: 4,
  },
  areaAcoes: {
    gap: 16,
    marginBottom: 20,
  },
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
    elevation: 4,
  },
  textoBotaoAdicionar: {
    color: cores.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.white,
    borderWidth: 2,
    borderColor: cores.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: cores.text,
    paddingVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: cores.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  cellNome: {
    flex: 4,
    fontWeight: 'bold',
    textAlign: 'left',
    color: cores.white,
    fontSize: 14,
  },
  cellQuantidade: {
    flex: 2,
    fontWeight: 'bold',
    textAlign: 'center',
    color: cores.white,
    fontSize: 14,
  },
  cellValor: {
    flex: 3,
    fontWeight: 'bold',
    textAlign: 'right',
    color: cores.white,
    fontSize: 14,
  },
  cellAcoes: {
    flex: 3,
    fontWeight: 'bold',
    textAlign: 'center',
    color: cores.white,
    fontSize: 14,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingTexto: {
    marginTop: 16,
    fontSize: 16,
    color: cores.gray600,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
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
  paginacao: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
    gap: 10,
  },
  paginaBotao: {
    fontSize: 18,
    color: cores.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontWeight: 'bold',
  },
  botaoDesativado: {
    color: cores.gray400,
  },
  paginaNumero: {
    fontSize: 16,
    color: cores.primary,
    borderWidth: 2,
    borderColor: cores.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontWeight: '600',
  },
  paginaAtiva: {
    backgroundColor: cores.primary,
    color: cores.white,
  },
})

export default ListaProdutos