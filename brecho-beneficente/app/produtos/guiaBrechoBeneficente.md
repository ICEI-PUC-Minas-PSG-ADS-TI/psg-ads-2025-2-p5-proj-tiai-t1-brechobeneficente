📋 Guia de Fluxo de Desenvolvimento - Brechó Beneficente
🏗️ Arquitetura MVVM - Padrão de Desenvolvimento
📁 Estrutura Base do Projeto:

src/
├── constants/
│   └── colors.js                    # Tema ecológico centralizado
├── context/                         # ViewModels (Lógica de negócio)
│   ├── AuthContext.js
│   ├── ProdutosContext.js
│   └── [NovoContext].js
├── domains/                         # Views (Interface do usuário)
│   ├── shared/                      # Componentes reutilizáveis
│   │   ├── BaseLayout.js
│   │   ├── Topo.js
│   │   └── AutoCompleteInput.js
│   ├── produtos/                    # Domínio específico
│   │   ├── ListaProdutos.js
│   │   ├── FormularioProduto.js
│   │   └── ItemProduto.js
│   └── [novoDominio]/              # Novo domínio
│       ├── Lista[Dominio].js
│       ├── Formulario[Dominio].js
│       └── Item[Dominio].js
└── firebase/
    └── config.js                    # Model (Configuração Firebase)

app/                                 # Roteamento (Expo Router)
├── _layout.tsx                      # Layout principal
├── index.tsx                        # Página inicial
├── login.tsx                        # Página de login
└── [novoDominio]/                   # Rotas do domínio
    ├── index.tsx                    # Lista
    └── form.tsx                     # Formulário

🔄 FLUXO DE DESENVOLVIMENTO (Passo a Passo)
🎯 PASSO 1: Criar Componentes no Domínio
Localização: src/domains/[nomeDominio]/

1.1 - Lista[Dominio].js (Componente Principal)

import React, { useContext, useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { VendasContext } from '../../context/VendasContext'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'
import ItemVenda from './ItemVenda'

const ListaVendas = () => {
  const { vendas, carregando, carregarVendas, excluirVenda } = useContext(VendasContext)
  
  useEffect(() => {
    carregarVendas()
  }, [])

  return (
    <BaseLayout titulo="Vendas" scrollable={false}>
      {/* Implementar lista com tema ecológico */}
    </BaseLayout>
  )
}

export default ListaVendas

1.2 - Formulario[Dominio].js (Cadastro/Edição)

import React, { useState, useContext } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { VendasContext } from '../../context/VendasContext'
import cores from '../../constants/colors'
import BaseLayout from '../shared/BaseLayout'

export default function FormularioVenda() {
  const { adicionarVenda, editarVenda } = useContext(VendasContext)
  
  // Estados do formulário
  // Validações
  // Handlers de submit
  
  return (
    <BaseLayout titulo="Nova Venda" scrollable={true}>
      {/* Implementar formulário com tema ecológico */}
    </BaseLayout>
  )
}

1.3 - Item[Dominio].js (Card do Item)

import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import cores from '../../constants/colors'

const ItemVenda = ({ venda, onEditar, onExcluir }) => {
  return (
    <View style={styles.card}>
      {/* Layout do card com tema ecológico */}
    </View>
  )
}

export default ItemVenda

🎯 PASSO 2: Criar Context (ViewModel)
Localização: src/context/[Dominio]Context.js


import React, { createContext, useState, useCallback } from 'react'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  doc,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../firebase/config'

// 1. Definir valores padrão
const VendasContextDefaultValues = {
  vendas: [],
  carregando: false,
  erro: null,
  carregarVendas: async () => {},
  adicionarVenda: async () => {},
  editarVenda: async () => {},
  excluirVenda: async () => {},
  // Funções auxiliares específicas do domínio
  calcularTotalVendas: () => 0,
  obterVendasPorPeriodo: () => []
}

// 2. Criar contexto
export const VendasContext = createContext(VendasContextDefaultValues)

// 3. Provider com lógica de negócio
export const VendasProvider = ({ children }) => {
  const [vendas, setVendas] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  // 4. Implementar operações CRUD
  const carregarVendas = useCallback(async () => {
    setCarregando(true)
    try {
      const snapshot = await getDocs(collection(db, 'vendas'))
      const vendasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setVendas(vendasData)
      setErro(null)
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
      setErro('Erro ao carregar vendas')
    } finally {
      setCarregando(false)
    }
  }, [])

  const adicionarVenda = useCallback(async (dadosVenda) => {
    // Validações
    if (!dadosVenda.cliente || !dadosVenda.valor) {
      throw new Error('Dados obrigatórios não informados')
    }

    setCarregando(true)
    try {
      const vendaCompleta = {
        ...dadosVenda,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      }
      
      await addDoc(collection(db, 'vendas'), vendaCompleta)
      await carregarVendas() // Recarregar lista
      
    } catch (error) {
      console.error('Erro ao adicionar venda:', error)
      throw error
    } finally {
      setCarregando(false)
    }
  }, [carregarVendas])

  // Implementar demais operações...

  // 5. Funções auxiliares específicas do domínio
  const calcularTotalVendas = useCallback(() => {
    return vendas.reduce((total, venda) => total + (venda.valor || 0), 0)
  }, [vendas])

  return (
    <VendasContext.Provider value={{
      vendas,
      carregando,
      erro,
      carregarVendas,
      adicionarVenda,
      editarVenda,
      excluirVenda,
      calcularTotalVendas,
      obterVendasPorPeriodo
    }}>
      {children}
    </VendasContext.Provider>
  )
}

🎯 PASSO 3: Integrar Context no App
Localização: _layout.tsx

import ProvidersWrapper from '../src/context/ProvidersWrapper'

// Adicionar o novo Provider no ProvidersWrapper
export default function ProvidersWrapper({ children }) {
  return (
    <AuthProvider>
      <ProdutosProvider>
        <VendasProvider>          {/* ← Novo Context aqui */}
          <ClientesProvider>
            {children}
          </ClientesProvider>
        </VendasProvider>
      </ProdutosProvider>
    </AuthProvider>
  )
}

🎯 PASSO 4: Criar Rotas no App
Localização: app/[nomeDominio]/

4.1 - index.tsx (Rota da Lista)
import ListaVendas from '../../src/domains/vendas/ListaVendas'

export default function VendasScreen() {
  return <ListaVendas />
}

4.2 - form.tsx (Rota do Formulário)
import FormularioVenda from '../../src/domains/vendas/FormularioVenda'

export default function FormularioVendaScreen() {
  return <FormularioVenda />
}

🎯 PASSO 5: Integrar Firebase
Coleção no Firestore: [nomeDominio] (ex: vendas, clientes, doacoes)

Estrutura padrão de documento:
{
  // Campos específicos do domínio
  cliente: "Nome do Cliente",
  valor: 150.00,
  produtos: ["id1", "id2"],
  
  // Campos padrão (sempre incluir)
  criadoEm: serverTimestamp(),
  atualizadoEm: serverTimestamp(),
  ativo: true
}

🛠️ CHECKLIST DE DESENVOLVIMENTO
✅ Para cada novo domínio, verificar:
📁 Componentes criados em src/domains/[dominio]/

 Lista[Dominio].js
 Formulario[Dominio].js
 Item[Dominio].js
🔧 Context criado em src/context/[Dominio]Context.js

 Estados básicos (dados, carregando, erro)
 Operações CRUD completas
 Validações implementadas
 Funções auxiliares específicas
🔥 Firebase configurado

 Coleção criada no Firestore
 Importações do Firebase corretas
 Timestamps automáticos
🚦 Rotas criadas em app/[dominio]/

 index.tsx (lista)
 form.tsx (formulário)
🔗 Integração no App

 Provider adicionado ao ProvidersWrapper
 Menu atualizado no BaseLayout
 Navegação funcionando

 🎨 PADRÕES DE DESIGN A SEGUIR
Cores do Tema Ecológico:
import cores from '../../constants/colors'

// Primary: cores.primary (#637E3E)
// Secondary: cores.secondary (#7A9E56)
// Background: cores.background (#F9F5EC)
// Text: cores.text (#2F3A25)

Componentes Padrão:
BaseLayout para estrutura básica
AutoCompleteInput para campos de busca
Feather Icons para ícones consistentes
Cards com sombras para itens de lista
Feedback visual para loading e erros