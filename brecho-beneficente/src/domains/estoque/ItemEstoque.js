import React from 'react'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useEstoque } from '../../context/EstoqueContext'
import cores from '../../constants/colors'

const ItemEstoque = ({ produto = {} }) => {
  const router = useRouter()
  const { calcularEstoque } = useEstoque()

  const {
    id,
    nome = '-',
    quantidade = 0
  } = produto

  const { entradas, saidas, total } = calcularEstoque(id)

  const estoqueAtual = total || Number(quantidade) || 0

  const getCorEstoque = () => {
    if (estoqueAtual === 0) return cores.error
    if (estoqueAtual <= 5) return cores.warning || '#f39c12'
    return cores.success || '#27ae60'
  }

  const abrirHistorico = () => {
    router.push({
      pathname: '/estoque/historico',
      params: { produtoId: id }
    })
  }

  const abrirEntrada = () => {
    router.push({
      pathname: '/estoque/entrada',
      params: { produtoId: id }
    })
  }

  const abrirSaida = () => {
    router.push({
      pathname: '/estoque/saida',
      params: { produtoId: id }
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.conteudoPrincipal}>
        <View style={styles.infoContainer}>
          <Text style={styles.nome}>{nome}</Text>
          <View style={styles.indicadorEstoque}>
            <View style={[styles.indicador, { backgroundColor: getCorEstoque() }]} />
            <Text style={[styles.estoqueAtual, { color: getCorEstoque() }]}>
              {estoqueAtual} un.
            </Text>
          </View>
        </View>

        <View style={styles.movimentacoesContainer}>
          <View style={styles.movimentacao}>
            <Feather name="plus-circle" size={16} color={cores.primary} />
            <Text style={styles.numeroMovimentacao}>{entradas}</Text>
          </View>

          <View style={styles.movimentacao}>
            <Feather name="minus-circle" size={16} color={cores.error} />
            <Text style={styles.numeroMovimentacao}>{saidas}</Text>
          </View>
        </View>
      </View>

      <View style={styles.acoesContainer}>
        <TouchableOpacity
          style={[styles.botaoAcao, styles.botaoEntrada]}
          onPress={abrirEntrada}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={14} color={cores.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoAcao, styles.botaoSaida]}
          onPress={abrirSaida}
          activeOpacity={0.7}
        >
          <Feather name="minus" size={14} color={cores.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoAcao, styles.botaoHistorico]}
          onPress={abrirHistorico}
          activeOpacity={0.7}
        >
          <Feather name="clock" size={14} color={cores.white} />
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
    padding: 12,
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
  },

  infoContainer: {
    flex: 1,
    marginRight: 16,
  },
  nome: {
    fontSize: 16,
    fontWeight: '600',
    color: cores.text,
    marginBottom: 4,
  },
  indicadorEstoque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicador: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  estoqueAtual: {
    fontSize: 14,
    fontWeight: '500',
  },

  movimentacoesContainer: {
    flexDirection: 'row',
    gap: 16,
    marginRight: 16,
  },
  movimentacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  numeroMovimentacao: {
    fontSize: 14,
    fontWeight: '500',
    color: cores.text,
    minWidth: 24,
    textAlign: 'center',
  },

  acoesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  botaoAcao: {
    width: 30,
    height: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  botaoEntrada: {
    backgroundColor: cores.primary,
  },
  botaoSaida: {
    backgroundColor: cores.error,
  },
  botaoHistorico: {
    backgroundColor: cores.secondary,
  },
})

export default ItemEstoque