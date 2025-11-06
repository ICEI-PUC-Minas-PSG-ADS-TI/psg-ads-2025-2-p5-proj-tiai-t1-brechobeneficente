import { Feather } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import cores from '../../constants/colors'

const ItemCliente = ({ cliente = {}, onEditar, onExcluir }) => {
  const { nome = '-', documento = '-', telefone = '-', endereco = '-', id } = cliente

  return (
    <View style={styles.container}>
      {/* Área de informações principais */}
      <View style={styles.conteudoPrincipal}>
        <View style={styles.infoContainer}>
          <Text style={styles.nome} numberOfLines={1} ellipsizeMode="tail">
            {nome}
          </Text>
          <Text style={styles.documento}>Documento: {documento || '-'}</Text>

          {/* Campos opcionais (telefone e endereço) */}
          {telefone ? (
            <Text style={styles.telefone}>📞 {telefone}</Text>
          ) : null}
          {endereco ? (
            <Text style={styles.endereco} numberOfLines={1} ellipsizeMode="tail">
              📍 {endereco}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Botões de ação */}
      <View style={styles.acoesContainer}>
        <TouchableOpacity
          style={styles.botaoEditar}
          onPress={() => onEditar?.(cliente)}
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
    alignItems: 'flex-start',
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
  documento: {
    fontSize: 13,
    color: cores.gray600,
    marginBottom: 4,
  },
  telefone: {
    fontSize: 13,
    color: cores.gray700,
    marginBottom: 2,
  },
  endereco: {
    fontSize: 13,
    color: cores.gray700,
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

export default ItemCliente
