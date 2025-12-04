import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import Papa from 'papaparse'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRelatorioProdutos } from '../../../context/relatorios/RelatorioProdutosContext'
import BaseLayout from '../../shared/BaseLayout'
import cores from '../../../constants/colors'

export default function RelatorioProdutos() {
  const { resultados } = useRelatorioProdutos()

  const colunas = ['Código', 'Produto', 'Estoque', 'Valor de Custo', 'Valor de Venda', 'Valor Total']

  const parseValor = (valorFormatado) =>
    parseFloat(valorFormatado?.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0

  const totalEstoqueQuantidade = resultados.reduce((acc, item) => {
    return acc + (item.quantidadeBruta || 0)
  }, 0)

  const totalEstoqueValor = resultados.reduce((acc, item) => {
    return acc + parseValor(item.valorTotal)
  }, 0)

  const exportarCSV = async () => {
    if (!resultados || resultados.length === 0) return

    const csv = Papa.unparse(
      resultados.map((item) => ({
        Código: item.codigo,
        Produto: item.produto,
        Estoque: item.estoque,
        'Valor de Custo': item.valorCusto,
        'Valor de Venda': item.valorVenda,
        'Valor Total': item.valorTotal
      }))
    )

    const fileUri = FileSystem.documentDirectory + 'relatorio_produtos.csv'
    await FileSystem.writeAsStringAsync(fileUri, csv)
    await Sharing.shareAsync(fileUri)
  }

  return (
    <BaseLayout titulo="Relatório de Produtos">
      {resultados.length > 0 ? (
        <>
          <ScrollView horizontal>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.colCodigo]}>Código</Text>
                <Text style={[styles.headerCell, styles.colProduto]}>Produto</Text>
                <Text style={[styles.headerCell, styles.colEstoque]}>Estoque</Text>
                <Text style={[styles.headerCell, styles.colValorCusto]}>Valor de Custo</Text>
                <Text style={[styles.headerCell, styles.colValorVenda]}>Valor de Venda</Text>
                <Text style={[styles.headerCell, styles.colValorTotal]}>Valor Total</Text>
              </View>

              {(resultados || []).map((linha, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.tableRow,
                    i % 2 === 1 && styles.tableRowAlternate
                  ]}
                >
                  <Text style={[styles.cell, styles.colCodigo]} numberOfLines={1}>{linha.codigo}</Text>
                  <Text style={[styles.cell, styles.colProduto]} numberOfLines={2}>{linha.produto}</Text>
                  <Text style={[styles.cell, styles.colEstoque]} numberOfLines={1}>{linha.estoque}</Text>
                  <Text style={[styles.cell, styles.colValorCusto]} numberOfLines={1}>{linha.valorCusto}</Text>
                  <Text style={[styles.cell, styles.colValorVenda]} numberOfLines={1}>{linha.valorVenda}</Text>
                  <Text style={[styles.cell, styles.colValorTotal]} numberOfLines={1}>{linha.valorTotal}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.totalizadores}>
            <Text style={styles.totalTitulo}>Totalizadores</Text>

            <View style={styles.totalLinha}>
              <Text style={styles.totalLabel}>Quantidade total em estoque:</Text>
              <Text style={styles.totalValor}>
                {totalEstoqueQuantidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.totalLinha}>
              <Text style={styles.totalLabel}>Valor total em estoque:</Text>
              <Text style={styles.totalValor}>
                R$ {totalEstoqueValor.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.botaoExportar} onPress={exportarCSV}>
            <Text style={styles.textoBotao}>Exportar CSV</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.semDados}>
          <Text style={styles.semDadosTexto}>Nenhum dado encontrado com os filtros aplicados.</Text>
        </View>
      )}
    </BaseLayout>
  )
}

const styles = StyleSheet.create({
  table: {
    minWidth: 810, 
    borderWidth: 1,
    borderColor: cores.border || '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: cores.white
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: cores.primary,
    minHeight: 50
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: cores.border || '#ddd',
    minHeight: 45,
    backgroundColor: cores.white
  },
  tableRowAlternate: {
    backgroundColor: '#f8f9fa'
  },
  headerCell: {
    paddingVertical: 15,
    paddingHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    color: cores.white,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 11,
    color: cores.text,
    textAlign: 'center',
    justifyContent: 'center'
  },
  
  colCodigo: { width: 100, textAlign: 'center' },
  colProduto: { width: 250, textAlign: 'left', paddingHorizontal: 12 },
  colEstoque: { width: 100, textAlign: 'center' },
  colValorCusto: { width: 120, textAlign: 'right' },
  colValorVenda: { width: 120, textAlign: 'right' },
  colValorTotal: { width: 120, textAlign: 'right' },
  totalizadores: {
    marginTop: 20,
    padding: 16,
    backgroundColor: cores.background,
    borderRadius: 6,
    elevation: 1
  },
  totalTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: cores.text
  },
  totalLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  totalLabel: {
    fontSize: 14,
    color: cores.text
  },
  totalValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: cores.primary
  },
  botaoExportar: {
    marginTop: 20,
    backgroundColor: cores.success || cores.primary,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  textoBotao: {
    color: cores.white,
    fontWeight: 'bold',
    fontSize: 14
  },
  semDados: {
    marginTop: 40,
    alignItems: 'center',
    padding: 20
  },
  semDadosTexto: {
    fontSize: 16,
    color: cores.text,
    textAlign: 'center'
  }
})
