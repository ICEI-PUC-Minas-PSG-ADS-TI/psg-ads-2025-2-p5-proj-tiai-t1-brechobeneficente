import React from 'react';
import { RelatorioClientesProvider } from './RelatorioClientesContext';
import { RelatorioProdutosProvider } from './RelatorioProdutosContext';
import { RelatorioVendasProvider } from './RelatorioVendasContext';
import { RelatorioDoacoesProvider } from './RelatorioDoacoesContext';

export function RelatoriosProvider({ children }) {
    return (
        <RelatorioClientesProvider>
            <RelatorioProdutosProvider>
                <RelatorioVendasProvider>
                    <RelatorioDoacoesProvider>
                        {children}
                    </RelatorioDoacoesProvider>
                </RelatorioVendasProvider>
            </RelatorioProdutosProvider>
        </RelatorioClientesProvider>
    );
}