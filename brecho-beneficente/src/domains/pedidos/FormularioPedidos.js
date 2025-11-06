import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'
import { usePedidos } from '../../context/PedidosContext'
import { useProdutos } from '../../context/ProdutosContext'

const formasPagamento = [
  'Dinheiro',
  'Cartão de Débito',
  'Cartão de Crédito',
  'PIX',
  'Fiado'
]

const tiposVenda = [
  { value: 'venda', label: 'Venda' },
  { value: 'doacao', label: 'Doação' }
]

const FormularioPedido = () => {
  const router = useRouter()
  const { id, readonly } = useLocalSearchParams()
  const { adicionarPedido, editarPedido, buscarPedidoPorId } = usePedidos()
  const { produtos, carregarProdutos } = useProdutos()

  const [carregando, setCarregando] = useState(false)
  const [editando, setEditando] = useState(!!id)
  const [modoLeitura, setModoLeitura] = useState(readonly === 'true')

  // Dados do cliente
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [observacoes, setObservacoes] = useState('')

  // Dados do pedido
  const [itens, setItens] = useState([])
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro')
  const [tipoVenda, setTipoVenda] = useState('venda')

  // Estados dos modals
  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false)
  const [modalFormaPagamentoVisivel, setModalFormaPagamentoVisivel] = useState(false)
  const [modalTipoVendaVisivel, setModalTipoVendaVisivel] = useState(false)

  // Item sendo adicionado/editado
  const [itemTemporario, setItemTemporario] = useState({
    produtoId: '',
    produtoNome: '',
    quantidade: '',
    valorUnitario: '',
    editandoIndice: -1
  })

  useEffect(() => {
    // Carrega produtos quando o componente monta
    carregarProdutos()

    // Se está editando, carrega os dados do pedido
    if (id) {
      const pedidoExistente = buscarPedidoPorId(id)
      if (pedidoExistente) {
        setNomeCliente(pedidoExistente.nomeCliente || '')
        setTelefoneCliente(pedidoExistente.telefoneCliente || '')
        setObservacoes(pedidoExistente.observacoes || '')
        setItens(pedidoExistente.itens || [])
        setFormaPagamento(pedidoExistente.formaPagamento || 'Dinheiro')
        setTipoVenda(pedidoExistente.tipoVenda || 'venda')
      }
    }
  }, [id, carregarProdutos])

  const formatarTelefone = (texto) => {
    const apenasNumeros = texto.replace(/\D/g, '')
    if (apenasNumeros.length <= 11) {
      return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return texto
  }

  const formatarValor = (texto) => {
    const apenasNumeros = texto.replace(/\D/g, '')
    const valor = parseFloat(apenasNumeros) / 100
    return valor.toFixed(2)
  }

  const calcularTotal = () => {
    return itens.reduce((total, item) => {
      return total + (parseFloat(item.quantidade || 0) * parseFloat(item.valorUnitario || 0))
    }, 0)
  }

  const adicionarItem = () => {
    if (!itemTemporario.produtoId || !itemTemporario.quantidade || !itemTemporario.valorUnitario) {
      Alert.alert('Erro', 'Preencha todos os campos do item')
      return
    }

    const quantidade = parseFloat(itemTemporario.quantidade)
    if (quantidade <= 0) {
      Alert.alert('Erro', 'A quantidade deve ser maior que zero')
      return
    }

    // Busca o produto para verificar estoque
    const produto = produtos.find(p => p.id === itemTemporario.produtoId)
    if (produto && produto.quantidade < quantidade) {
      Alert.alert(
        'Atenção',
        `Estoque insuficiente! Disponível: ${produto.quantidade}, Solicitado: ${quantidade}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar Mesmo Assim',
            onPress: () => adicionarItemConfirmado(),
            style: 'destructive'
          }
        ]
      )
      return
    }

    adicionarItemConfirmado()
  }

  const adicionarItemConfirmado = () => {
    const novoItem = {
      produtoId: itemTemporario.produtoId,
      produtoNome: itemTemporario.produtoNome,
      quantidade: parseFloat(itemTemporario.quantidade),
      valorUnitario: parseFloat(itemTemporario.valorUnitario)
    }

    if (itemTemporario.editandoIndice >= 0) {
      const novosItens = [...itens]
      novosItens[itemTemporario.editandoIndice] = novoItem
      setItens(novosItens)
    } else {
      setItens([...itens, novoItem])
    }

    setItemTemporario({
      produtoId: '',
      produtoNome: '',
      quantidade: '',
      valorUnitario: '',
      editandoIndice: -1
    })
    setModalProdutoVisivel(false)
  }

  const editarItem = (indice) => {
    const item = itens[indice]
    setItemTemporario({
      produtoId: item.produtoId,
      produtoNome: item.produtoNome,
      quantidade: item.quantidade.toString(),
      valorUnitario: item.valorUnitario.toString(),
      editandoIndice: indice
    })
    setModalProdutoVisivel(true)
  }

  const removerItem = (indice) => {
    Alert.alert(
      'Remover Item',
      'Deseja remover este item do pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          onPress: () => {
            const novosItens = itens.filter((_, i) => i !== indice)
            setItens(novosItens)
          },
          style: 'destructive'
        }
      ]
    )
  }

  const validarFormulario = () => {
    if (!nomeCliente.trim()) {
      Alert.alert('Erro', 'Nome do cliente é obrigatório')
      return false
    }

    if (itens.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um item ao pedido')
      return false
    }

    // Verifica se todos os itens têm produtos válidos
    const produtoInvalido = itens.find(item => {
      const produto = produtos.find(p => p.id === item.produtoId)
      return !produto
    })

    if (produtoInvalido) {
      Alert.alert(
        'Erro',
        'Um ou mais produtos selecionados não estão mais disponíveis. Verifique os itens do pedido.'
      )
      return false
    }

    return true
  }

  const salvar = async () => {
    if (!validarFormulario()) return

    try {
      setCarregando(true)

      const dadosPedido = {
        nomeCliente: nomeCliente.trim(),
        telefoneCliente: telefoneCliente.replace(/\D/g, ''),
        observacoes: observacoes.trim(),
        itens: itens,
        formaPagamento,
        tipoVenda
      }

      if (editando) {
        await editarPedido({ ...dadosPedido, id })
        Alert.alert('Sucesso', 'Pedido atualizado com sucesso!')
      } else {
        await adicionarPedido(dadosPedido)
        Alert.alert('Sucesso', 'Pedido criado com sucesso!')
      }

      router.back()
    } catch (error) {
      // O contexto já mostra o erro
    } finally {
      setCarregando(false)
    }
  }

  const titulo = modoLeitura
    ? 'Visualizar Pedido'
    : editando
      ? 'Editar Pedido'
      : 'Novo Pedido'

  return (
    <BaseLayout titulo={titulo} scrollable>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Seção Cliente */}
          <View style={styles.secao}>
            <View style={styles.headerSecao}>
              <Text style={styles.tituloSecao}>Dados do Cliente</Text>
              {/* Futura integração com ClientesContext */}
              {!modoLeitura && (
                <TouchableOpacity
                  style={styles.botaoSelecionarCliente}
                  onPress={() => {
                    Alert.alert(
                      'Em Desenvolvimento',
                      'A seleção de clientes cadastrados será implementada em breve!'
                    )
                  }}
                >
                  <Feather name="users" size={16} color={cores.white} />
                  <Text style={styles.textoBotaoSelecionar}>Buscar</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Nome do Cliente *</Text>
            <TextInput
              style={[styles.input, modoLeitura && styles.inputDesabilitado]}
              placeholder="Digite o nome do cliente"
              value={nomeCliente}
              onChangeText={setNomeCliente}
              editable={!modoLeitura}
            />

            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={[styles.input, modoLeitura && styles.inputDesabilitado]}
              placeholder="(00) 00000-0000"
              value={telefoneCliente}
              onChangeText={(texto) => setTelefoneCliente(formatarTelefone(texto))}
              keyboardType="phone-pad"
              maxLength={15}
              editable={!modoLeitura}
            />

            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline, modoLeitura && styles.inputDesabilitado]}
              placeholder="Observações sobre o cliente ou pedido"
              value={observacoes}
              onChangeText={setObservacoes}
              multiline
              numberOfLines={3}
              editable={!modoLeitura}
            />
          </View>

          {/* Seção Itens */}
          <View style={styles.secao}>
            <View style={styles.headerSecao}>
              <Text style={styles.tituloSecao}>Itens do Pedido</Text>
              {!modoLeitura && (
                <TouchableOpacity
                  style={[
                    styles.botaoAdicionarItem,
                    produtos.length === 0 && styles.botaoDesabilitado
                  ]}
                  onPress={() => {
                    if (produtos.length === 0) {
                      Alert.alert(
                        'Sem Produtos',
                        'Cadastre produtos primeiro antes de criar pedidos.',
                        [
                          { text: 'OK', style: 'default' },
                          {
                            text: 'Ir para Produtos',
                            onPress: () => router.push('/produtos'),
                            style: 'default'
                          }
                        ]
                      )
                      return
                    }
                    setModalProdutoVisivel(true)
                  }}
                >
                  <Feather name="plus" size={16} color={cores.white} />
                  <Text style={styles.textoBotaoAdicionarItem}>Item</Text>
                </TouchableOpacity>
              )}
            </View>

            {itens.length === 0 ? (
              <View style={styles.emptyItens}>
                <Feather name="package" size={48} color={cores.gray400} />
                <Text style={styles.emptyText}>Nenhum item adicionado</Text>
                {!modoLeitura && (
                  <Text style={styles.emptySubtext}>Toque em "Item" para adicionar</Text>
                )}
              </View>
            ) : (
              <>
                {itens.map((item, indice) => (
                  <View key={indice} style={styles.itemCard}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemNome}>{item.produtoNome}</Text>
                      <Text style={styles.itemDetalhes}>
                        Qtd: {item.quantidade} | Valor: R$ {item.valorUnitario.toFixed(2)}
                      </Text>
                      <Text style={styles.itemTotal}>
                        Total: R$ {(item.quantidade * item.valorUnitario).toFixed(2)}
                      </Text>
                    </View>
                    {!modoLeitura && (
                      <View style={styles.itemAcoes}>
                        <TouchableOpacity
                          style={[styles.botaoAcao, { backgroundColor: cores.primary }]}
                          onPress={() => editarItem(indice)}
                        >
                          <Feather name="edit" size={16} color={cores.white} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.botaoAcao, { backgroundColor: cores.error }]}
                          onPress={() => removerItem(indice)}
                        >
                          <Feather name="trash-2" size={16} color={cores.white} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}

                <View style={styles.totalPedido}>
                  <Text style={styles.labelTotal}>Total do Pedido:</Text>
                  <Text style={styles.valorTotal}>R$ {calcularTotal().toFixed(2)}</Text>
                </View>
              </>
            )}
          </View>

          {/* Seção Pagamento */}
          <View style={styles.secao}>
            <Text style={styles.tituloSecao}>Detalhes do Pedido</Text>

            <Text style={styles.label}>Tipo</Text>
            <TouchableOpacity
              style={[styles.input, styles.picker, modoLeitura && styles.inputDesabilitado]}
              onPress={() => !modoLeitura && setModalTipoVendaVisivel(true)}
            >
              <Text style={styles.pickerText}>
                {tiposVenda.find(t => t.value === tipoVenda)?.label || 'Selecionar'}
              </Text>
              {!modoLeitura && <Feather name="chevron-down" size={20} color={cores.gray500} />}
            </TouchableOpacity>

            <Text style={styles.label}>Forma de Pagamento</Text>
            <TouchableOpacity
              style={[styles.input, styles.picker, modoLeitura && styles.inputDesabilitado]}
              onPress={() => !modoLeitura && setModalFormaPagamentoVisivel(true)}
            >
              <Text style={styles.pickerText}>{formaPagamento}</Text>
              {!modoLeitura && <Feather name="chevron-down" size={20} color={cores.gray500} />}
            </TouchableOpacity>
          </View>

          {/* Botões */}
          {!modoLeitura && (
            <View style={styles.botoes}>
              <TouchableOpacity
                style={[styles.botao, styles.botaoSalvar, carregando && styles.botaoDesabilitado]}
                onPress={salvar}
                disabled={carregando}
              >
                {carregando ? (
                  <Text style={styles.textoBotao}>Salvando...</Text>
                ) : (
                  <>
                    <Feather name="save" size={20} color={cores.white} />
                    <Text style={styles.textoBotao}>Salvar</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botao, styles.botaoCancelar]}
                onPress={() => router.back()}
              >
                <Feather name="x" size={20} color={cores.white} />
                <Text style={styles.textoBotao}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Modal Produto */}
        <Modal
          visible={modalProdutoVisivel}
          transparent
          animationType="slide"
          onRequestClose={() => setModalProdutoVisivel(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitulo}>
                  {itemTemporario.editandoIndice >= 0 ? 'Editar Item' : 'Adicionar Item'}
                </Text>
                <TouchableOpacity onPress={() => setModalProdutoVisivel(false)}>
                  <Feather name="x" size={24} color={cores.gray600} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <Text style={styles.label}>Produto *</Text>
                {produtos.length === 0 ? (
                  <View style={styles.emptyProdutos}>
                    <Feather name="package" size={32} color={cores.gray400} />
                    <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
                    <Text style={styles.emptySubtext}>Cadastre produtos primeiro</Text>
                  </View>
                ) : (
                  <FlatList
                    data={produtos}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.produtoItem,
                          itemTemporario.produtoId === item.id && styles.produtoSelecionado
                        ]}
                        onPress={() => setItemTemporario({
                          ...itemTemporario,
                          produtoId: item.id,
                          produtoNome: item.nome,
                          valorUnitario: item.valorVenda ? parseFloat(item.valorVenda).toFixed(2) : itemTemporario.valorUnitario
                        })}
                      >
                        <View style={styles.produtoInfo}>
                          <Text style={styles.produtoNome}>{item.nome}</Text>
                          <Text style={styles.produtoCodigo}>Código: {item.codigo}</Text>
                          {item.valorVenda && (
                            <Text style={styles.produtoValor}>
                              Valor sugerido: R$ {parseFloat(item.valorVenda).toFixed(2)}
                            </Text>
                          )}
                        </View>
                        <View style={styles.produtoEstoque}>
                          <Text style={styles.estoqueLabel}>Estoque:</Text>
                          <Text style={[
                            styles.estoqueValor,
                            (item.quantidade || 0) < 5 && styles.estoqueBaixo,
                            (item.quantidade || 0) === 0 && styles.estoqueZero
                          ]}>
                            {item.quantidade || 0}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    style={styles.listaProdutos}
                    showsVerticalScrollIndicator={false}
                  />
                )}

                <Text style={styles.label}>Quantidade *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={itemTemporario.quantidade}
                  onChangeText={(texto) => setItemTemporario({
                    ...itemTemporario,
                    quantidade: texto
                  })}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Valor Unitário *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={itemTemporario.valorUnitario}
                  onChangeText={(texto) => setItemTemporario({
                    ...itemTemporario,
                    valorUnitario: formatarValor(texto)
                  })}
                  keyboardType="numeric"
                />

                <View style={styles.botoesModal}>
                  <TouchableOpacity
                    style={[styles.botao, styles.botaoSalvar]}
                    onPress={adicionarItem}
                  >
                    <Text style={styles.textoBotao}>
                      {itemTemporario.editandoIndice >= 0 ? 'Atualizar' : 'Adicionar'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.botao, styles.botaoCancelar]}
                    onPress={() => setModalProdutoVisivel(false)}
                  >
                    <Text style={styles.textoBotao}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal Forma de Pagamento */}
        <Modal
          visible={modalFormaPagamentoVisivel}
          transparent
          animationType="slide"
          onRequestClose={() => setModalFormaPagamentoVisivel(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitulo}>Forma de Pagamento</Text>
              {formasPagamento.map((forma, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => {
                    setFormaPagamento(forma)
                    setModalFormaPagamentoVisivel(false)
                  }}
                >
                  <Text style={styles.modalItemText}>{forma}</Text>
                  {formaPagamento === forma && (
                    <Feather name="check" size={20} color={cores.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* Modal Tipo de Venda */}
        <Modal
          visible={modalTipoVendaVisivel}
          transparent
          animationType="slide"
          onRequestClose={() => setModalTipoVendaVisivel(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitulo}>Tipo</Text>
              {tiposVenda.map((tipo) => (
                <TouchableOpacity
                  key={tipo.value}
                  style={styles.modalItem}
                  onPress={() => {
                    setTipoVenda(tipo.value)
                    setModalTipoVendaVisivel(false)
                  }}
                >
                  <Text style={styles.modalItemText}>{tipo.label}</Text>
                  {tipoVenda === tipo.value && (
                    <Feather name="check" size={20} color={cores.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </BaseLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  secao: {
    backgroundColor: cores.white,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.text,
    marginBottom: 16,
  },
  headerSecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: cores.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: cores.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: cores.text,
    backgroundColor: cores.white,
    marginBottom: 16,
  },
  inputDesabilitado: {
    backgroundColor: cores.gray100,
    color: cores.gray600,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: cores.text,
  },
  botaoAdicionarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textoBotaoAdicionarItem: {
    color: cores.white,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  botaoSelecionarCliente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  textoBotaoSelecionar: {
    color: cores.white,
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 12,
  },
  emptyItens: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: cores.gray600,
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: cores.gray500,
    marginTop: 4,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: cores.gray100,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.text,
    marginBottom: 4,
  },
  itemDetalhes: {
    fontSize: 14,
    color: cores.gray600,
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: cores.primary,
  },
  itemAcoes: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoAcao: {
    padding: 8,
    borderRadius: 6,
  },
  totalPedido: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: cores.divider,
    marginTop: 16,
  },
  labelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.text,
  },
  valorTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: cores.primary,
  },
  botoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  botao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 2,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botaoSalvar: {
    backgroundColor: cores.success,
  },
  botaoCancelar: {
    backgroundColor: cores.error,
  },
  botaoDesabilitado: {
    backgroundColor: cores.gray400,
  },
  textoBotao: {
    color: cores.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: cores.overlay,
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: cores.white,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: cores.divider,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.text,
  },
  modalContent: {
    padding: 20,
  },
  listaProdutos: {
    maxHeight: 200,
    marginBottom: 16,
  },
  emptyProdutos: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  produtoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: cores.border,
    borderRadius: 8,
    marginBottom: 8,
  },
  produtoSelecionado: {
    borderColor: cores.primary,
    backgroundColor: cores.primaryLight,
  },
  produtoInfo: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: '500',
    color: cores.text,
  },
  produtoCodigo: {
    fontSize: 12,
    color: cores.gray600,
    marginTop: 2,
  },
  produtoValor: {
    fontSize: 12,
    color: cores.secondary,
    marginTop: 2,
    fontWeight: '500',
  },
  produtoEstoque: {
    alignItems: 'center',
    marginLeft: 12,
  },
  estoqueLabel: {
    fontSize: 10,
    color: cores.gray500,
    textAlign: 'center',
  },
  estoqueValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.success,
    marginTop: 2,
  },
  estoqueBaixo: {
    color: cores.warning,
  },
  estoqueZero: {
    color: cores.error,
  },
  botoesModal: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: cores.divider,
  },
  modalItemText: {
    fontSize: 16,
    color: cores.text,
  },
})

export default FormularioPedido