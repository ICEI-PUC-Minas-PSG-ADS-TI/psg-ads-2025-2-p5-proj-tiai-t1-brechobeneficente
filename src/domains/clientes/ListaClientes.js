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
import { ClientesContext } from '../../context/ClientesContext'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'
import ItemCliente from './ItemCliente'

const itensPorPagina = 5

const ListaClientes = () => {
  const {
    clientes,
    excluirCliente,
    carregarClientes,
    carregando,
    totalClientes
  } = useContext(ClientesContext)

  const [filtro, setFiltro] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [refrescando, setRefrescando] = useState(false)
  const router = useRouter()

  const editarCliente = (cliente) => {
    try {
      if (!cliente || typeof cliente !== 'object') return

      const json = JSON.stringify({
        id: cliente.id || '',
        nome: cliente.nome || '',
        documento: cliente.documento || '',
        telefone: cliente.telefone || '',
        endereco: cliente.endereco || ''
      })

      router.push({ pathname: '/clientes/form', params: { cliente: json } })
    } catch (error) {
      console.error('Erro ao preparar cliente para edição:', error)
      Alert.alert('Erro', 'Não foi possível editar o cliente')
    }
  }

  const confirmarExclusao = (id, nome) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o cliente "${nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => handleExcluirCliente(id)
        }
      ]
    )
  }

  const handleExcluirCliente = async (id) => {
    try {
      await excluirCliente(id)
      Alert.alert('Sucesso', 'Cliente excluído com sucesso!')
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o cliente.')
    }
  }

  const handleRefresh = async () => {
    setRefrescando(true)
    try {
      await carregarClientes()
    } finally {
      setRefrescando(false)
    }
  }

  const clientesFiltrados = clientes.filter(c =>
    (c.nome?.toLowerCase() || '').includes(filtro.toLowerCase())
  )

  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina)
  const clientesPaginados = clientesFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  )

  const paginaAnterior = () => {
    if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1)
  }

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1)
  }

  return (
    <BaseLayout titulo="Clientes">
      <View style={styles.container}>

        {/* Bloco de total de clientes */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalTexto}>
            Total de Clientes: {totalClientes}
          </Text>
        </View>

        {/* Botão Adicionar + Busca */}
        <View style={styles.areaAcoes}>
          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={() => router.push('/clientes/form')}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color={cores.white} />
            <Text style={styles.textoBotaoAdicionar}>Adicionar Cliente</Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Feather name="search" size={20} color={cores.gray500} style={styles.searchIcon} />
            <TextInput
              placeholder="Buscar por nome..."
              style={styles.input}
              value={filtro}
              onChangeText={setFiltro}
              placeholderTextColor={cores.gray500}
            />
          </View>
        </View>

        {/* Cabeçalho da tabela */}
        <View style={styles.headerRow}>
          <Text style={styles.cellNome}>Nome</Text>
          <Text style={styles.cellDocumento}>Documento</Text>
          <Text style={styles.cellAcoes}>Ações</Text>
        </View>

        {/* Loading */}
        {carregando && !refrescando && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={cores.primary} />
            <Text style={styles.loadingTexto}>Carregando clientes...</Text>
          </View>
        )}

        {/* Lista */}
        <FlatList
          data={clientesPaginados}
          keyExtractor={item => (item?.id ? item.id.toString() : Math.random().toString())}
          renderItem={({ item }) => (
            <ItemCliente
              cliente={item}
              onEditar={editarCliente}
              onExcluir={(id) => confirmarExclusao(id, item.nome)}
            />
          )}
          ListEmptyComponent={
            !carregando ? (
              <View style={styles.emptyContainer}>
                <Feather name="users" size={64} color={cores.gray400} />
                <Text style={styles.emptyTexto}>
                  {filtro ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                </Text>
                <Text style={styles.emptySubtexto}>
                  {filtro ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro cliente'}
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

        {/* Paginação */}
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
  totalContainer: {
    backgroundColor: cores.white,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: cores.border,
  },
  totalTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: cores.text,
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
    flex: 3,
    fontWeight: 'bold',
    textAlign: 'left',
    color: cores.white,
    fontSize: 14,
  },
  cellDocumento: {
    flex: 3,
    fontWeight: 'bold',
    textAlign: 'center',
    color: cores.white,
    fontSize: 14,
  },
  cellAcoes: {
    flex: 2,
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

export default ListaClientes
