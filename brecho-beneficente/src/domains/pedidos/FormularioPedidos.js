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
import { useClientes } from '../../context/ClientesContext'
import AutoCompleteInput from '../shared/AutoCompleteInput'

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
  const { clientes, carregarClientes } = useClientes()

  const [carregando, setCarregando] = useState(false)
  const [editando, setEditando] = useState(!!id)
  const [modoLeitura, setModoLeitura] = useState(readonly === 'true')

  const [clienteId, setClienteId] = useState(null)
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [enderecoCliente, setEnderecoCliente] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const [itens, setItens] = useState([])
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro')
  const [tipoVenda, setTipoVenda] = useState('venda')

  const [modalProdutoVisivel, setModalProdutoVisivel] = useState(false)
  const [modalFormaPagamentoVisivel, setModalFormaPagamentoVisivel] = useState(false)
  const [modalTipoVendaVisivel, setModalTipoVendaVisivel] = useState(false)


  const [itemTemporario, setItemTemporario] = useState({
    produtoId: '',
    produtoNome: '',
    quantidade: '',
    valorUnitario: '',
    editandoIndice: -1
  })

  useEffect(() => {

    carregarProdutos()
    carregarClientes()


    if (id) {
      const pedidoExistente = buscarPedidoPorId(id)
      if (pedidoExistente) {
        setClienteId(pedidoExistente.clienteId || null)
        setNomeCliente(pedidoExistente.nomeCliente || '')
        setTelefoneCliente(pedidoExistente.telefoneCliente || '')
        setEnderecoCliente(pedidoExistente.enderecoCliente || '')
        setObservacoes(pedidoExistente.observacoes || '')
        setItens(pedidoExistente.itens || [])
        setFormaPagamento(pedidoExistente.formaPagamento || 'Dinheiro')
        setTipoVenda(pedidoExistente.tipoVenda || 'venda')
      }
    }
  }, [id, carregarProdutos, carregarClientes])

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
    if (!itemTemporario.produtoId) {
      Alert.alert('Erro', 'Selecione um produto cadastrado')
      return
    }

    if (!itemTemporario.quantidade || !itemTemporario.valorUnitario) {
      Alert.alert('Erro', 'Preencha quantidade e valor unitário')
      return
    }

    const quantidade = parseFloat(itemTemporario.quantidade)
    const valor = parseFloat(itemTemporario.valorUnitario)

    if (quantidade <= 0) {
      Alert.alert('Erro', 'A quantidade deve ser maior que zero')
      return
    }

    if (valor <= 0) {
      Alert.alert('Erro', 'O valor unitário deve ser maior que zero')
      return
    }


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
    if (!clienteId) {
      Alert.alert('Erro', 'Selecione um cliente cadastrado')
      return false
    }

    if (itens.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um item ao pedido')
      return false
    }


    for (const item of itens) {
      if (!item.produtoId) {
        Alert.alert('Erro', 'Todos os itens devem ter um produto selecionado')
        return false
      }

      const produto = produtos.find(p => p.id === item.produtoId)
      if (!produto) {
        Alert.alert('Erro', `O produto "${item.produtoNome}" não está mais disponível. Remova este item do pedido.`)
        return false
      }
    }

    return true
  }

  const salvar = async () => {
    if (!validarFormulario()) return

    try {
      setCarregando(true)

      const dadosPedido = {
        clienteId: clienteId,
        nomeCliente: nomeCliente.trim(),
        telefoneCliente: telefoneCliente.replace(/\D/g, ''),
        enderecoCliente: enderecoCliente.trim(),
        observacoes: observacoes.trim(),
        itens: itens,
        formaPagamento,
        tipoVenda
      }

      if (editando) {
        // Preservar dados importantes do pedido original
        const pedidoOriginal = buscarPedidoPorId(id)
        const dadosCompletos = {
          ...dadosPedido,
          id,
          status: pedidoOriginal?.status || 'pendente',
          criadoEm: pedidoOriginal?.criadoEm || new Date(),
          dataFinalizacao: pedidoOriginal?.dataFinalizacao,
          dataCancelamento: pedidoOriginal?.dataCancelamento
        }
        await editarPedido(dadosCompletos)
        Alert.alert('Sucesso', 'Pedido atualizado com sucesso!')
      } else {
        await adicionarPedido(dadosPedido)
        Alert.alert('Sucesso', 'Pedido criado com sucesso!')
      }

      router.back()
    } catch (error) {

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

          <View style={styles.secao}>
            <View style={styles.headerSecao}>
              <Text style={styles.tituloSecao}>Cliente</Text>
              {!modoLeitura && (
                <TouchableOpacity
                  style={styles.botaoSelecionarCliente}
                  onPress={() => router.push('/clientes/form')}
                >
                  <Feather name="user-plus" size={16} color={cores.white} />
                  <Text style={styles.textoBotaoSelecionar}>Cadastrar</Text>
                </TouchableOpacity>
              )}
            </View>

            {!modoLeitura ? (
              <>
                <View style={{ zIndex: 10, position: 'relative' }}>
                  <AutoCompleteInput
                    label="Selecionar cliente"
                    placeholder="Busque o cliente pelo nome"
                    dados={clientes}
                    campoChave="id"
                    campoLabel="nome"
                    valorInicial={nomeCliente}
                    onSelecionar={(cliente) => {
                      setClienteId(cliente.id)
                      setNomeCliente(cliente.nome || '')
                      setTelefoneCliente(cliente.telefone || '')
                      setEnderecoCliente(cliente.endereco || '')
                    }}
                    onChangeText={(texto) => {

                      if (!clientes.find(c => c.nome === texto)) {
                        setClienteId(null)
                        setNomeCliente(texto)
                        setTelefoneCliente('')
                        setEnderecoCliente('')
                      }
                    }}
                    obrigatorio
                    icone="search"
                    maxSugestoes={5}
                  />

                </View>

                {clienteId && (
                  <View style={styles.clienteSelecionadoInfo}>
                    <View style={styles.infoRow}>
                      <Feather name="user" size={16} color={cores.primary} />
                      <Text style={styles.infoLabel}>Nome:</Text>
                      <Text style={styles.infoValor}>{nomeCliente}</Text>
                    </View>
                    {telefoneCliente && (
                      <View style={styles.infoRow}>
                        <Feather name="phone" size={16} color={cores.primary} />
                        <Text style={styles.infoLabel}>Telefone:</Text>
                        <Text style={styles.infoValor}>{telefoneCliente}</Text>
                      </View>
                    )}
                    {enderecoCliente && (
                      <View style={styles.infoRow}>
                        <Feather name="map-pin" size={16} color={cores.primary} />
                        <Text style={styles.infoLabel}>Endereço:</Text>
                        <Text style={styles.infoValor}>{enderecoCliente}</Text>
                      </View>
                    )}
                  </View>
                )}

                {!clienteId && clientes.length === 0 && (
                  <View style={styles.estadoVazio}>
                    <Feather name="users" size={32} color={cores.gray400} />
                    <Text style={styles.textoVazio}>Nenhum cliente cadastrado</Text>
                    <TouchableOpacity
                      style={styles.botaoAcao}
                      onPress={() => router.push('/clientes/form')}
                    >
                      <Text style={styles.textoBotaoAcao}>Cadastrar primeiro cliente</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.clienteSelecionadoInfo}>
                <View style={styles.infoRow}>
                  <Feather name="user" size={16} color={cores.primary} />
                  <Text style={styles.infoLabel}>Nome:</Text>
                  <Text style={styles.infoValor}>{nomeCliente}</Text>
                </View>
                {telefoneCliente && (
                  <View style={styles.infoRow}>
                    <Feather name="phone" size={16} color={cores.primary} />
                    <Text style={styles.infoLabel}>Telefone:</Text>
                    <Text style={styles.infoValor}>{telefoneCliente}</Text>
                  </View>
                )}
                {enderecoCliente && (
                  <View style={styles.infoRow}>
                    <Feather name="map-pin" size={16} color={cores.primary} />
                    <Text style={styles.infoLabel}>Endereço:</Text>
                    <Text style={styles.infoValor}>{enderecoCliente}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.secao}>
            <View style={styles.headerSecao}>
              <Text style={styles.tituloSecao}>Itens do pedido</Text>
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
                  <Text style={styles.labelTotal}>Total do pedido:</Text>
                  <Text style={styles.valorTotal}>R$ {calcularTotal().toFixed(2)}</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.secao}>
            <Text style={styles.tituloSecao}>Detalhes do pedido</Text>

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

          <View style={styles.secao}>
            <Text style={styles.label}>Observações do Pedido</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline, modoLeitura && styles.inputDesabilitado]}
              placeholder="Observações gerais sobre o pedido (opcional)"
              value={observacoes}
              onChangeText={setObservacoes}
              multiline
              numberOfLines={3}
              editable={!modoLeitura}
            />
          </View>

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
                {produtos.length === 0 ? (
                  <View style={styles.emptyProdutos}>
                    <Feather name="package" size={32} color={cores.gray400} />
                    <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
                    <Text style={styles.emptySubtext}>Cadastre produtos primeiro</Text>
                    <TouchableOpacity
                      style={styles.botaoAdicionarProduto}
                      onPress={() => {
                        setModalProdutoVisivel(false)
                        router.push('/produtos/form')
                      }}
                    >
                      <Text style={styles.textoBotaoAdicionarProduto}>Cadastrar Produto</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <AutoCompleteInput
                      label="Produto"
                      placeholder="Busque o produto pelo nome"
                      dados={produtos}
                      campoChave="id"
                      campoLabel="nome"
                      valorInicial={itemTemporario.produtoNome}
                      onSelecionar={(produto) => {
                        setItemTemporario({
                          ...itemTemporario,
                          produtoId: produto.id,
                          produtoNome: produto.nome,
                          valorUnitario: produto.valorVenda ? parseFloat(produto.valorVenda).toFixed(2) : ''
                        })
                      }}
                      onChangeText={(texto) => {

                        if (!produtos.find(p => p.nome === texto)) {
                          setItemTemporario({
                            ...itemTemporario,
                            produtoId: '',
                            produtoNome: texto,
                            valorUnitario: ''
                          })
                        }
                      }}
                      obrigatorio
                      icone="search"
                      maxSugestoes={5}
                    />

                    {itemTemporario.produtoId && (
                      <View style={styles.produtoSelecionadoInfo}>
                        {(() => {
                          const produto = produtos.find(p => p.id === itemTemporario.produtoId)
                          return produto ? (
                            <>
                              <Text style={styles.produtoCodigo}>Código: {produto.codigo}</Text>
                              {produto.valorVenda && (
                                <Text style={styles.produtoValor}>
                                  Valor sugerido: R$ {parseFloat(produto.valorVenda).toFixed(2)}
                                </Text>
                              )}
                              <Text style={[
                                styles.estoqueInfo,
                                (produto.quantidade || 0) < 5 && styles.estoqueBaixo,
                                (produto.quantidade || 0) === 0 && styles.estoqueZero
                              ]}>
                                Estoque: {produto.quantidade || 0} unidades
                              </Text>
                            </>
                          ) : null
                        })()}
                      </View>
                    )}
                  </>
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



        <Modal
          visible={modalFormaPagamentoVisivel}
          transparent
          animationType="slide"
          onRequestClose={() => setModalFormaPagamentoVisivel(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainerCompacto}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitulo}>Forma de pagamento</Text>
                <TouchableOpacity onPress={() => setModalFormaPagamentoVisivel(false)}>
                  <Feather name="x" size={24} color={cores.gray600} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContentCompacto}>
                {formasPagamento.map((forma, index) => {
                  const getIconeFormaPagamento = (forma) => {
                    switch (forma.toLowerCase()) {
                      case 'dinheiro': return 'dollar-sign'
                      case 'cartão de débito': return 'credit-card'
                      case 'cartão de crédito': return 'credit-card'
                      case 'pix': return 'smartphone'
                      case 'fiado': return 'clock'
                      default: return 'dollar-sign'
                    }
                  }
                  
                  const isSelected = formaPagamento === forma
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.modalItemModerno,
                        isSelected && styles.modalItemSelecionado
                      ]}
                      onPress={() => {
                        setFormaPagamento(forma)
                        setModalFormaPagamentoVisivel(false)
                      }}
                      activeOpacity={0.7}
                    >
                      <Feather 
                        name={getIconeFormaPagamento(forma)} 
                        size={20} 
                        color={isSelected ? cores.white : cores.primary} 
                      />
                      <Text style={[
                        styles.modalItemTextModerno,
                        isSelected && styles.modalItemTextSelecionado
                      ]}>
                        {forma}
                      </Text>
                      {isSelected && (
                        <Feather name="check" size={18} color={cores.white} />
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={modalTipoVendaVisivel}
          transparent
          animationType="slide"
          onRequestClose={() => setModalTipoVendaVisivel(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainerCompacto}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitulo}>Tipo da Venda</Text>
                <TouchableOpacity onPress={() => setModalTipoVendaVisivel(false)}>
                  <Feather name="x" size={24} color={cores.gray600} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContentCompacto}>
                {tiposVenda.map((tipo) => {
                  const getIconeTipoVenda = (value) => {
                    switch (value) {
                      case 'venda': return 'shopping-bag'
                      case 'doacao': return 'heart'
                      default: return 'shopping-bag'
                    }
                  }
                  
                  const getCorTipo = (value) => {
                    switch (value) {
                      case 'venda': return cores.primary
                      case 'doacao': return cores.secondary
                      default: return cores.primary
                    }
                  }
                  
                  const isSelected = tipoVenda === tipo.value
                  
                  return (
                    <TouchableOpacity
                      key={tipo.value}
                      style={[
                        styles.modalItemModerno,
                        isSelected && styles.modalItemSelecionado
                      ]}
                      onPress={() => {
                        setTipoVenda(tipo.value)
                        setModalTipoVendaVisivel(false)
                      }}
                      activeOpacity={0.7}
                    >
                      <Feather 
                        name={getIconeTipoVenda(tipo.value)} 
                        size={20} 
                        color={isSelected ? cores.white : getCorTipo(tipo.value)} 
                      />
                      <Text style={[
                        styles.modalItemTextModerno,
                        isSelected && styles.modalItemTextSelecionado
                      ]}>
                        {tipo.label}
                      </Text>
                      {isSelected && (
                        <Feather name="check" size={18} color={cores.white} />
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>
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
    flex: 1,
  },
  placeholderText: {
    color: cores.gray500,
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
    maxHeight: '75%',
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
  modalContainerCompacto: {
    backgroundColor: cores.white,
    borderRadius: 16,
    maxHeight: '50%',
    elevation: 5,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalContentCompacto: {
    padding: 20,
    paddingTop: 0,
  },
  modalItemModerno: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: cores.gray100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 1,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modalItemSelecionado: {
    backgroundColor: cores.primary,
    borderColor: cores.primaryDark,
    elevation: 3,
    shadowColor: cores.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalItemTextModerno: {
    fontSize: 16,
    fontWeight: '500',
    color: cores.text,
    marginLeft: 12,
    flex: 1,
  },
  modalItemTextSelecionado: {
    color: cores.white,
    fontWeight: 'bold',
  },
  botaoAdicionarProduto: {
    backgroundColor: cores.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  textoBotaoAdicionarProduto: {
    color: cores.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  produtoSelecionadoInfo: {
    backgroundColor: cores.primaryLight,
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: cores.primary,
  },
  estoqueInfo: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    color: cores.success,
  },
  clienteSelecionadoInfo: {
    backgroundColor: cores.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: cores.border,
    shadowColor: cores.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.text,
    marginLeft: 8,
    marginRight: 8,
    minWidth: 70,
  },
  infoValor: {
    fontSize: 14,
    color: cores.gray700,
    flex: 1,
  },
  estadoVazio: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  textoVazio: {
    fontSize: 16,
    color: cores.gray600,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  botaoAcao: {
    backgroundColor: cores.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoBotaoAcao: {
    color: cores.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  avisoSelecao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: cores.warning + '40',
  },
})

export default FormularioPedido