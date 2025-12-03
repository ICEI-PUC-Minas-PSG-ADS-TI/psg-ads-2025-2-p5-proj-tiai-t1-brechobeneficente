import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { Feather } from '@expo/vector-icons'
import cores from '../../constants/colors'

const ItemDoacao = ({ doacao = {}, onEditar, onExcluir }) => {
  const {
    id,
    nomeDoador = '-',
    item = '-',
    quantidade = 0,
    valor = 0,
    imagem = null,
  } = doacao

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

  const getCorQuantidade = () => {
    if (quantidade === 0) return cores.error
    if (quantidade <= 2) return cores.warning || '#f39c12'
    return cores.success || '#27ae60'
  }

  return (
    <View style={styles.container}>
      <View style={styles.conteudoPrincipal}>
        {imagem ? (
          <Image source={{ uri: imagem }} style={styles.imagemDoacao} />
        ) : (
          <View style={[styles.imagemDoacao, styles.imagemPlaceholder]}>
            <Feather name="image" size={24} color={cores.gray400} />
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.nome}>{nomeDoador}</Text>
          <Text style={styles.item}>Item: {item}</Text>
        </View>

        <View style={styles.valoresContainer}>
          <View style={styles.quantidadeContainer}>
            <View style={[styles.indicadorQtd, { backgroundColor: getCorQuantidade() }]} />
            <Text style={styles.quantidade}>{formatarNumero(quantidade)} un.</Text>
          </View>
          <Text style={styles.valor}>{formatarMoeda(valor)}</Text>
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
  imagemDoacao: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: cores.gray100,
  },
  imagemPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  nome: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.text,
    marginBottom: 4,
  },
  item: {
    fontSize: 13,
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
  indicadorQtd: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  quantidade: {
    fontSize: 13,
    color: cores.gray700,
    fontWeight: '500',
  },
  valor: {
    fontSize: 15,
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

export default ItemDoacao
