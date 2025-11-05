import { Feather } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import cores from '../../constants/colors'

const ItemProduto = ({ produto = {}, onEditar, onExcluir }) => {
  const { nome = '-', codigo = '-', quantidade = 0, valorVenda = 0, id } = produto

  const formatarNumero = (valor) => {
    const numero = Number(valor)
    return isNaN(numero) ? '0' : numero.toLocaleString('pt-BR')
  }

  const formatarMoeda = (valor) => {
    const numero = Number(valor)
    return isNaN(numero)
      ? 'R$ 0,00'
      : numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const getStatusEstoque = () => {
    if (quantidade === 0) return 'sem-estoque'
    if (quantidade <= 5) return 'estoque-baixo'
    return 'normal'
  }

  const getCorEstoque = () => {
    const status = getStatusEstoque()
    switch (status) {
      case 'sem-estoque': return cores.error
      case 'estoque-baixo': return cores.warning || '#f39c12'
      default: return cores.success || '#27ae60'
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.conteudoPrincipal}>
        <View style={styles.infoContainer}>
          <Text style={styles.nome} numberOfLines={1} ellipsizeMode="tail">
            {nome}
          </Text>
          <Text style={styles.codigo}>Código: {codigo}</Text>
        </View>

        <View style={styles.valoresContainer}>
          <View style={styles.quantidadeContainer}>
            <View style={[styles.indicadorEstoque, { backgroundColor: getCorEstoque() }]} />
            <Text style={styles.quantidade}>
              {formatarNumero(quantidade)} un.
            </Text>
          </View>
          <Text style={styles.valor}>
            {formatarMoeda(valorVenda)}
          </Text>
        </View>
      </View>

      <View style={styles.acoesContainer}>
        <TouchableOpacity
          style={styles.botaoEditar}
          onPress={() => onEditar?.(produto)}
          activeOpacity={0.7}
        >
          <Feather name="edit-2" size={16} color={cores.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoExcluir}
          onPress={() => onExcluir?.(id)}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={16} color={cores.white} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: cores.white,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: cores.border,
  },
  conteudoPrincipal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoContainer: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: '600',
    color: cores.text,
    marginBottom: 4,
  },
  codigo: {
    fontSize: 12,
    color: cores.gray600,
  },
  valoresContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  quantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  indicadorEstoque: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  quantidade: {
    fontSize: 14,
    color: cores.gray700,
    fontWeight: '500',
  },
  valor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.primary,
  },
  acoesContainer: {
    flexDirection: 'row',
    marginLeft: 12,
    gap: 8,
  },
  botaoEditar: {
    backgroundColor: cores.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  botaoExcluir: {
    backgroundColor: cores.error,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
})

export default ItemProduto