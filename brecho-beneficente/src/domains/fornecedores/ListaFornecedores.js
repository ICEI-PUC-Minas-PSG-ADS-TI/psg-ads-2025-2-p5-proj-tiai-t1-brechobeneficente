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
import { FornecedoresContext } from '../../context/FornecedoresContext'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'
import ItemFornecedor from './ItemFornecedor'

const itensPorPagina = 5

const ListaFornecedores = () => {
  const {
    fornecedores,
    excluirFornecedor,
    carregarFornecedores,
    carregando,
    totalFornecedores
  } = useContext(FornecedoresContext)

  const [filtro, setFiltro] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [refrescando, setRefrescando] = useState(false)
  const router = useRouter()

  const editarFornecedor = (fornecedor) => {
    try {
      if (!fornecedor || typeof fornecedor !== 'object') return

      const json = JSON.stringify({
        id: fornecedor.id || '',
        nome: fornecedor.nome || '',
        documento: fornecedor.documento || '',
        telefone: fornecedor.telefone || '',
        endereco: fornecedor.endereco || ''
      })

      router.push({ pathname: '/fornecedores/form', params: { fornecedor: json } })
    } catch (error) {
      console.error('Erro ao preparar fornecedor para edição:', error)
      Alert.alert('Erro', 'Erro ao abrir formulário de edição')
    }
  }

  const confirmarExclusao = (fornecedor) => {
    const nomeExibicao = fornecedor.nome || 'fornecedor sem nome'

    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir "${nomeExibicao}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => excluirFornecedor(fornecedor.id)
        }
      ]
    )
  }

  const atualizarLista = async () => {
    try {
      setRefrescando(true)
      await carregarFornecedores()
    } catch (error) {
      console.error('Erro ao atualizar lista:', error)
    } finally {
      setRefrescando(false)
    }
  }

  const formatarDocumento = (documento) => {
    if (!documento) return ''
    
    if (documento.length === 11) {
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    if (documento.length === 14) {
      return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return documento
  }

  const formatarTelefone = (telefone) => {
    if (!telefone) return ''
    
    if (telefone.length === 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return telefone
  }

  const fornecedoresFiltrados = fornecedores.filter(fornecedor => {
    const termo = filtro.toLowerCase().trim()
    if (!termo) return true

    const nome = (fornecedor.nome || '').toLowerCase()
    const documento = (fornecedor.documento || '').toLowerCase()
    const telefone = (fornecedor.telefone || '').toLowerCase()
    const email = (fornecedor.email || '').toLowerCase()
    const categoria = (fornecedor.categoria || '').toLowerCase()

    return nome.includes(termo) ||
           documento.includes(termo) ||
           telefone.includes(termo) ||
           email.includes(termo) ||
           categoria.includes(termo)
  })

  const totalItens = fornecedoresFiltrados.length
  const totalPaginas = Math.ceil(totalItens / itensPorPagina)
  const inicio = (paginaAtual - 1) * itensPorPagina
  const fornecedoresPaginados = fornecedoresFiltrados.slice(inicio, inicio + itensPorPagina)

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1)
    }
  }

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1)
    }
  }

  const aplicarFiltro = (texto) => {
    setFiltro(texto)
    setPaginaAtual(1)
  }

  const renderItem = ({ item }) => (
    <ItemFornecedor
      fornecedor={item}
      onEditar={editarFornecedor}
      onExcluir={confirmarExclusao}
      formatarDocumento={formatarDocumento}
      formatarTelefone={formatarTelefone}
    />
  )

  if (carregando && fornecedores.length === 0) {
    return (
      <BaseLayout titulo="Fornecedores" scrollable={false}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={cores.primary} />
          <Text style={styles.loadingText}>Carregando fornecedores...</Text>
        </View>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout titulo="Fornecedores" scrollable={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.buscaContainer}>
            <Feather name="search" size={20} color={cores.primary} style={styles.iconeBusca} />
            <TextInput
              style={styles.campoBusca}
              placeholder="Buscar por nome, documento, telefone..."
              value={filtro}
              onChangeText={aplicarFiltro}
            />
          </View>

          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={() => router.push('/fornecedores/form')}
          >
            <Feather name="plus" size={20} color={cores.white} />
            <Text style={styles.textoBotao}>Novo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTexto}>
            {totalItens} {totalItens === 1 ? 'fornecedor encontrado' : 'fornecedores encontrados'}
          </Text>
        </View>

        {fornecedoresPaginados.length === 0 ? (
          <View style={styles.vazio}>
            <Feather name="users" size={64} color={cores.primary} />
            <Text style={styles.textoVazio}>
              {filtro ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
            </Text>
            {!filtro && (
              <TouchableOpacity
                style={styles.botaoVazio}
                onPress={() => router.push('/fornecedores/form')}
              >
                <Text style={styles.textoBotaoVazio}>Cadastrar primeiro fornecedor</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={fornecedoresPaginados}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.lista}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={atualizarLista}
                colors={[cores.primary]}
              />
            }
          />
        )}

        {totalPaginas > 1 && (
          <View style={styles.paginacao}>
            <TouchableOpacity
              style={[styles.botaoPagina, paginaAtual === 1 && styles.botaoDesabilitado]}
              onPress={paginaAnterior}
              disabled={paginaAtual === 1}
            >
              <Feather name="chevron-left" size={20} color={paginaAtual === 1 ? cores.text : cores.primary} />
            </TouchableOpacity>

            <Text style={styles.textoPagina}>
              Página {paginaAtual} de {totalPaginas}
            </Text>

            <TouchableOpacity
              style={[styles.botaoPagina, paginaAtual === totalPaginas && styles.botaoDesabilitado]}
              onPress={proximaPagina}
              disabled={paginaAtual === totalPaginas}
            >
              <Feather name="chevron-right" size={20} color={paginaAtual === totalPaginas ? cores.text : cores.primary} />
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
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: cores.text,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  buscaContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: cores.border,
  },
  iconeBusca: {
    marginRight: 8,
  },
  campoBusca: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: cores.text,
  },
  botaoAdicionar: {
    backgroundColor: cores.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  textoBotao: {
    color: cores.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoTexto: {
    fontSize: 14,
    color: cores.text,
    opacity: 0.8,
  },
  lista: {
    flex: 1,
  },
  vazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  textoVazio: {
    fontSize: 18,
    color: cores.text,
    marginTop: 16,
    marginBottom: 24,
  },
  botaoVazio: {
    backgroundColor: cores.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  textoBotaoVazio: {
    color: cores.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  paginacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: cores.border,
  },
  botaoPagina: {
    padding: 8,
  },
  botaoDesabilitado: {
    opacity: 0.3,
  },
  textoPagina: {
    fontSize: 14,
    color: cores.text,
  },
})

export default ListaFornecedores