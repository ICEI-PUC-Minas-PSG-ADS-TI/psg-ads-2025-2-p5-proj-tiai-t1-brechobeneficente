import { Feather } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import cores from '../../constants/colors'

const Doacoes = ({ doacao = {}, onEditar, onExcluir }) => {
  const {
    id,
    nomeDoador = '-',
    itens = [],
    valorEstimado = 0,
    criadoEm,
  } = doacao

  const formatarMoeda = (valor) => {
    const numero = Number(valor)
    return isNaN(numero)
      ? 'R$ 0,00'
      : numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const formatarData = (timestamp) => {
    if (!timestamp) return '-'
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return data.toLocaleDateString('pt-BR')
  }

  return (
    <View style={styles.container}>
      <View style={styles.conteudoPrincipal}>
        <View style={styles.infoContainer}>
          <Text style={styles.nome} numberOfLines={1} ellipsizeMode="tail">
            {nomeDoador}
          </Text>
          <Text style={styles.itens}>
            Itens: {itens.length}
          </Text>
          <Text style={styles.data}>
            Data: {formatarData(criadoEm)}
          </Text>
        </View>

        <View style={styles.valoresContainer}>
          <Text style={styles.valor}>
            {formatarMoeda(valorEstimado)}
          </Text>
        </View>
      </View>

      <View style={styles.acoesContainer}>
        <TouchableOpacity
          style={styles.botaoEditar}
          onPress={() => onEditar?.(doacao)}
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
  itens: {
    fontSize: 13,
    color: cores.gray700,
    marginBottom: 2,
  },
  data: {
    fontSize: 12,
    color: cores.gray600,
  },
  valoresContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
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

export default Doacoes
