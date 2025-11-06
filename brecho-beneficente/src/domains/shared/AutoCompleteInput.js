import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import cores from '../../constants/colors'

const AutoCompleteInput = ({
  label,
  placeholder,
  dados = [],
  campoChave = 'id',
  campoLabel = 'nome',
  valorInicial = '',
  onSelecionar = () => { },
  onChangeText = () => { },
  erro,
  desabilitarSugestoes = false,
  obrigatorio = false,
  icone = null
}) => {
  const [valor, setValor] = useState(valorInicial || '')
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [focado, setFocado] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateYAnim = useRef(new Animated.Value(-10)).current

  const filtrados = dados.filter(item =>
    typeof valor == 'string' &&
    item[campoLabel]?.toLowerCase().includes(valor.toLowerCase())
  )

  const animarSugestoes = (exibir) => {
    Animated.timing(fadeAnim, {
      toValue: exibir ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start()

    Animated.timing(translateYAnim, {
      toValue: exibir ? 0 : -10,
      duration: 200,
      useNativeDriver: true
    }).start()
  }

  const selecionarItem = (item) => {
    setValor(item[campoLabel])
    setMostrarSugestoes(false)
    animarSugestoes(false)
    Keyboard.dismiss()
    onSelecionar(item)
  }

  const handleChange = (text) => {
    setValor(text)
    onChangeText(text)

    if (!desabilitarSugestoes && !mostrarSugestoes) {
      setMostrarSugestoes(true)
      animarSugestoes(true)
    }
  }

  useEffect(() => {
    if (valorInicial) setValor(valorInicial)
  }, [valorInicial])

  return (
    <TouchableWithoutFeedback onPress={() => {
      setMostrarSugestoes(false)
      setFocado(false)
      Keyboard.dismiss()
    }}>
      <View style={styles.wrapper}>
        {label && (
          <Text style={styles.label}>
            {label}
            {obrigatorio && <Text style={styles.obrigatorio}> *</Text>}
          </Text>
        )}

        <View style={[
          styles.inputContainer,
          focado && styles.inputContainerFocado,
          erro && styles.inputContainerErro
        ]}>
          {icone && (
            <Feather
              name={icone}
              size={20}
              color={erro ? cores.error : focado ? cores.primary : cores.gray500}
              style={styles.icone}
            />
          )}

          <TextInput
            style={[styles.input, icone && styles.inputComIcone]}
            placeholder={placeholder}
            placeholderTextColor={cores.gray500}
            value={valor}
            onFocus={() => {
              setFocado(true)
              if (!desabilitarSugestoes) {
                setMostrarSugestoes(true)
                animarSugestoes(true)
              }
            }}
            onBlur={() => {
              setFocado(false)
            }}
            onChangeText={handleChange}
            autoCapitalize="none"
          />
        </View>

        {erro && (
          <View style={styles.erroContainer}>
            <Feather name="alert-circle" size={14} color={cores.error} />
            <Text style={styles.erroTexto}>{erro}</Text>
          </View>
        )}

        {!desabilitarSugestoes && mostrarSugestoes && (
          <Animated.View
            style={[
              styles.sugestoes,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateYAnim }]
              }
            ]}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={styles.scrollSugestoes}
              showsVerticalScrollIndicator={false}
            >
              {filtrados.length > 0 ? (
                filtrados.slice(0, 10).map((item, index) => (
                  <TouchableOpacity
                    key={item[campoChave]}
                    style={[
                      styles.itemSugestao,
                      index == filtrados.length - 1 && styles.ultimoItem
                    ]}
                    onPress={() => selecionarItem(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemConteudo}>
                      <Text style={styles.itemLabel}>{item[campoLabel]}</Text>
                      <Text style={styles.itemId}>{item[campoChave]}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={cores.gray400} />
                  </TouchableOpacity>
                ))
              ) : valor.length > 0 ? (
                <View style={styles.vazioContainer}>
                  <Feather name="search" size={20} color={cores.gray400} />
                  <Text style={styles.vazio}>Nenhum item encontrado</Text>
                </View>
              ) : (
                <View style={styles.vazioContainer}>
                  <Feather name="type" size={20} color={cores.gray400} />
                  <Text style={styles.vazio}>Digite para buscar...</Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: cores.text,
    marginBottom: 8,
  },
  obrigatorio: {
    color: cores.error,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: cores.border,
    borderRadius: 12,
    backgroundColor: cores.white,
    paddingHorizontal: 16,
    paddingVertical: 2,
    minHeight: 50,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputContainerFocado: {
    borderColor: cores.primary,
    backgroundColor: cores.white,
    shadowOpacity: 0.15,
    elevation: 3,
  },
  inputContainerErro: {
    borderColor: cores.error,
    backgroundColor: cores.white,
  },
  icone: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: cores.text,
    paddingVertical: 12,
  },
  inputComIcone: {
    paddingLeft: 0,
  },
  erroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  erroTexto: {
    color: cores.error,
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  sugestoes: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: cores.white,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: cores.border,
    overflow: 'hidden',
  },
  scrollSugestoes: {
    maxHeight: 240,
  },
  itemSugestao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: cores.divider,
    backgroundColor: cores.white,
  },
  ultimoItem: {
    borderBottomWidth: 0,
  },
  itemConteudo: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 15,
    color: cores.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemId: {
    fontSize: 12,
    color: cores.gray600,
  },
  vazioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  vazio: {
    color: cores.gray600,
    fontSize: 14,
    marginLeft: 8,
    fontStyle: 'italic',
  }
})

export default AutoCompleteInput