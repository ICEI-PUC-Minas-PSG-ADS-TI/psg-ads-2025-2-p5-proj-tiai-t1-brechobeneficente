import { createContext, useContext, useState } from 'react'

const FormasPagamentoContext = createContext()

export const FormasPagamentoProvider = ({ children }) => {
  const [formasPagamento] = useState([
    { id: 1, nome: 'Dinheiro' },
    { id: 2, nome: 'PIX' },
    { id: 3, nome: 'Cartão Débito' },
    { id: 4, nome: 'Cartão Crédito' }
  ])

  return (
    <FormasPagamentoContext.Provider value={{
      formasPagamento
    }}>
      {children}
    </FormasPagamentoContext.Provider>
  )
}

export const useFormasPagamento = () => {
  const context = useContext(FormasPagamentoContext)
  if (!context) {
    throw new Error('useFormasPagamento deve ser usado dentro de FormasPagamentoProvider')
  }
  return context
}

export { FormasPagamentoContext }