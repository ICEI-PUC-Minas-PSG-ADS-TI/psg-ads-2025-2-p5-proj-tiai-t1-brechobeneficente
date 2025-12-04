import { createContext, useContext, useState } from 'react'
import { DoacoesContext } from '../DoacoesContext'

const RelatorioDoacoesContext = createContext()

export const RelatorioDoacoesProvider = ({ children }) => {
  const [filtros, setFiltros] = useState({
    categoria: '',
    status: '',
    tipo: '',
    valorMin: '',
    valorMax: ''
  })

  const [resultados, setResultados] = useState([])
  const { doacoes } = useContext(DoacoesContext)

  const aplicarFiltros = (novosFiltros = filtros) => {
    const filtrosAtivos = {
      ...filtros,
      ...novosFiltros
    }

    setFiltros(filtrosAtivos)

    const filtrados = doacoes.filter((doacao) => {
      const matchCategoria = filtrosAtivos.categoria.trim() == '' ||
        doacao.categoria?.toLowerCase().includes(filtrosAtivos.categoria.toLowerCase())

      const matchStatus = filtrosAtivos.status.trim() == '' ||
        doacao.status?.toLowerCase().includes(filtrosAtivos.status.toLowerCase())

      const matchTipo = filtrosAtivos.tipo.trim() == '' ||
        doacao.tipo?.toLowerCase().includes(filtrosAtivos.tipo.toLowerCase())

      const valorDoacao = parseFloat(doacao.valor) || 0
      const matchValorMin = filtrosAtivos.valorMin.trim() == '' ||
        valorDoacao >= parseFloat(filtrosAtivos.valorMin)

      const matchValorMax = filtrosAtivos.valorMax.trim() == '' ||
        valorDoacao <= parseFloat(filtrosAtivos.valorMax)

      return matchCategoria && matchStatus && matchTipo && matchValorMin && matchValorMax
    })

    const resultadosFormatados = filtrados.map((d, i) => ({
      codigo: String(d.id || i + 1).padStart(3, '0'),
      categoria: d.categoria || 'Não informada',
      tipo: d.tipo || 'Não informado',
      status: d.status || 'Pendente',
      valor: d.valor ? `R$ ${parseFloat(d.valor).toFixed(2)}` : 'R$ 0,00',
      data: d.criado_em?.toDate ? 
        d.criado_em.toDate().toLocaleDateString('pt-BR') : 
        new Date().toLocaleDateString('pt-BR')
    }))

    setResultados(resultadosFormatados)
  }

  return (
    <RelatorioDoacoesContext.Provider value={{
      filtros,
      resultados,
      aplicarFiltros
    }}>
      {children}
    </RelatorioDoacoesContext.Provider>
  )
}

export const useRelatorioDoacao = () => useContext(RelatorioDoacoesContext)