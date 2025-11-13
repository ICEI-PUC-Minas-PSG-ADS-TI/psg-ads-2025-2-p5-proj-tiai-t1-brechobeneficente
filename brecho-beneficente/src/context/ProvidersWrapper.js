import { AuthProvider } from './AuthContext'
import { ClientesProvider } from './ClientesContext'
import { EstoqueProvider } from './EstoqueContext'
import { FormasPagamentoProvider } from './FormasPagamentoContext'
import { PedidosProvider } from './PedidosContext'
import { ProdutosProvider } from './ProdutosContext'
import { DoacoesProvider } from './DoacoesContext'
import { RelatorioClientesProvider } from './relatorios/RelatorioClientesContext'
import { RelatorioProdutosProvider } from './relatorios/RelatorioProdutosContext'
import { RelatorioVendasProvider } from './relatorios/RelatorioVendasContext'

export default function ProvidersWrapper({ children }) {
  return (
    <AuthProvider>
      <ProdutosProvider>
        <RelatorioProdutosProvider>
          <PedidosProvider>
            <DoacoesProvider>  
              <ClientesProvider>
                <FormasPagamentoProvider>
                  <EstoqueProvider>
                    <RelatorioVendasProvider>
                      <RelatorioClientesProvider>
                        {children}
                      </RelatorioClientesProvider>
                    </RelatorioVendasProvider>
                  </EstoqueProvider>
                </FormasPagamentoProvider>
              </ClientesProvider>
            </DoacoesProvider>
          </PedidosProvider>
        </RelatorioProdutosProvider>
      </ProdutosProvider>
    </AuthProvider>
  )
}