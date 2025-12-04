import { createContext, useContext, useState } from 'react'
import { ProdutosContext } from '../ProdutosContext'

const RelatorioProdutosContext = createContext()

export const RelatorioProdutosProvider = ({ children }) => {
  const [filtros, setFiltros] = useState({ nome: '', codigo: '' })
  const [resultados, setResultados] = useState([])

  const { produtos } = useContext(ProdutosContext)

  const aplicarFiltros = (novosFiltros = filtros) => {
    const nomeFiltro = novosFiltros?.nome?.toLowerCase() || ''
    const codigoFiltro = novosFiltros?.codigo || ''
    setFiltros({ nome: nomeFiltro, codigo: codigoFiltro })

    const produtosFiltrados = produtos.filter(produto => {
      const nomeOk = nomeFiltro == '' || produto.nome.toLowerCase().includes(nomeFiltro)
      const codigoOk = codigoFiltro == '' || String(produto.codigo || '').includes(codigoFiltro)
      return nomeOk && codigoOk
    })

    const resultadosFormatados = produtosFiltrados.map((p, i) => {
      const quantidade = Number(p.quantidade || 0)
      const valorCusto = Number(p.valorCusto || 0)
      const valorVenda = Number(p.valorVenda || 0)
      const valorTotal = quantidade * valorVenda

      return {
        codigo: String(p.codigo || i + 1).padStart(3, '0'),
        produto: p.nome,
        quantidadeBruta: quantidade,
        estoque: quantidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        valorCusto: valorCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        valorVenda: valorVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        valorTotal: valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      }
    })

    setResultados(resultadosFormatados)
  }

  return (
    <RelatorioProdutosContext.Provider
      value={{ filtros, setFiltros, resultados, aplicarFiltros }}
    >
      {children}
    </RelatorioProdutosContext.Provider>
  )
}

export const useRelatorioProdutos = () => useContext(RelatorioProdutosContext)