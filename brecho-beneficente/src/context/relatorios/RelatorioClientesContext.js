import { createContext, useContext, useState } from 'react'
import { ClientesContext } from '../ClientesContext'

const RelatorioClientesContext = createContext()

export const RelatorioClientesProvider = ({ children }) => {
  const [filtros, setFiltros] = useState({
    nome: '',
    documento: '',
    telefone: '',
    endereco: ''
  })

  const [resultados, setResultados] = useState([])
  const { clientes } = useContext(ClientesContext)

  const aplicarFiltros = (novosFiltros = filtros) => {
    const filtrosAtivos = {
      ...filtros,
      ...novosFiltros
    }

    setFiltros(filtrosAtivos)

    const filtrados = clientes.filter((cliente) => {
      const matchNome = filtrosAtivos.nome.trim() == '' ||
        cliente.nome?.toLowerCase().includes(filtrosAtivos.nome.toLowerCase())

      const matchDocumento = filtrosAtivos.documento.trim() == '' ||
        cliente.documento?.toLowerCase().includes(filtrosAtivos.documento.toLowerCase())

      const matchTelefone = filtrosAtivos.telefone.trim() == '' ||
        cliente.telefone?.toLowerCase().includes(filtrosAtivos.telefone.toLowerCase())

      const matchEndereco = filtrosAtivos.endereco.trim() == '' ||
        cliente.endereco?.toLowerCase().includes(filtrosAtivos.endereco.toLowerCase())

      return matchNome && matchDocumento && matchTelefone && matchEndereco
    })

    const resultadosFormatados = filtrados.map((c, i) => ({
      codigo: String(c.id || i + 1).padStart(3, '0'),
      nome: c.nome,
      documento: c.documento || '',
      telefone: c.telefone || '',
      endereco: c.endereco || ''
    }))

    setResultados(resultadosFormatados)
  }

  return (
    <RelatorioClientesContext.Provider value={{
      filtros,
      resultados,
      aplicarFiltros
    }}>
      {children}
    </RelatorioClientesContext.Provider>
  )
}

export const useRelatorioClientes = () => useContext(RelatorioClientesContext)