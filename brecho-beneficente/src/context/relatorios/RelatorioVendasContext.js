import { createContext, useContext, useEffect, useState } from 'react'
import { PedidosContext } from '../PedidosContext'

const RelatorioVendasContext = createContext()

export const RelatorioVendasProvider = ({ children }) => {
  const [filtros, setFiltros] = useState({
    cliente: '',
    produto: '',
    formaPagamento: '',
    valorMin: '',
    valorMax: ''
  })

  const [resultados, setResultados] = useState([])
  const { pedidos } = useContext(PedidosContext)

  const aplicarFiltros = (novosFiltros = filtros) => {
    const filtrosAtivos = {
      ...filtros,
      ...novosFiltros
    }
    
    setFiltros(filtrosAtivos)

    const vendasExpandidas = []
    
    pedidos.forEach(pedido => {
      if (!pedido.itens || pedido.itens.length === 0) {
        vendasExpandidas.push({
          pedidoId: pedido.id,
          cliente: pedido.nomeCliente || 'N/A',
          produto: 'Sem produtos',
          quantidade: 0,
          valorUnitario: 0,
          valorTotal: pedido.total || 0,
          formaPagamento: pedido.formaPagamento || 'N/A',
          data: pedido.criadoEm,
          status: pedido.status || 'pendente'
        })
      } else {
        pedido.itens.forEach(item => {
          const quantidade = parseFloat(item.quantidade) || 0
          const valorUnitario = parseFloat(item.valorUnitario) || 0
          
          vendasExpandidas.push({
            pedidoId: pedido.id,
            cliente: pedido.nomeCliente || 'N/A',
            produto: item.produtoNome || item.nomeProduto || item.nome || 'Produto N/A',
            quantidade: quantidade,
            valorUnitario: valorUnitario,
            valorTotal: quantidade * valorUnitario,
            formaPagamento: pedido.formaPagamento || 'N/A',
            data: pedido.criadoEm,
            status: pedido.status || 'pendente'
          })
        })
      }
    })

    const vendasFiltradas = vendasExpandidas.filter(venda => {
      const clienteOK = !filtrosAtivos.cliente || venda.cliente.toLowerCase().includes(filtrosAtivos.cliente.toLowerCase())
      const produtoOK = !filtrosAtivos.produto || venda.produto.toLowerCase().includes(filtrosAtivos.produto.toLowerCase())
      const formaPagamentoOK = !filtrosAtivos.formaPagamento || venda.formaPagamento.toLowerCase().includes(filtrosAtivos.formaPagamento.toLowerCase())
      
      const valorMinOK = !filtrosAtivos.valorMin || venda.valorTotal >= parseFloat(filtrosAtivos.valorMin)
      const valorMaxOK = !filtrosAtivos.valorMax || venda.valorTotal <= parseFloat(filtrosAtivos.valorMax)

      return clienteOK && produtoOK && formaPagamentoOK && valorMinOK && valorMaxOK
    })

    const resultadosFormatados = vendasFiltradas.map((venda, i) => {
      const quantidade = isNaN(venda.quantidade) ? 0 : Number(venda.quantidade)
      
      return {
        codigo: String(venda.pedidoId || i + 1).padStart(3, '0'),
        cliente: venda.cliente,
        produto: venda.produto,
        quantidade: Math.floor(quantidade).toString(),
        valorProduto: `R$ ${venda.valorUnitario.toFixed(2)}`,
        valorTotal: `R$ ${venda.valorTotal.toFixed(2)}`,
        formaPagamento: venda.formaPagamento,
        data: venda.data?.toDate ? 
          venda.data.toDate().toLocaleDateString('pt-BR') : 
          (venda.data instanceof Date ? venda.data.toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'))
      }
    })

    setResultados(resultadosFormatados)
  }

  useEffect(() => {
    aplicarFiltros(filtros)
  }, [pedidos])

  return (
    <RelatorioVendasContext.Provider
      value={{
        filtros,
        aplicarFiltros,
        resultados
      }}
    >
      {children}
    </RelatorioVendasContext.Provider>
  )
}

export const useRelatorioVendas = () => useContext(RelatorioVendasContext)