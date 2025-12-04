import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import Papa from 'papaparse'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useRelatorioVendas } from '../../../context/relatorios/RelatorioVendasContext'
import BaseLayout from '../../shared/BaseLayout'
import cores from '../../../constants/colors'

export default function RelatorioVendas() {
  const { resultados } = useRelatorioVendas()

  const formatar = (valor) =>
    `R$ ${valor.toFixed(2).replace('.', ',')}`

  const totais = (resultados || []).reduce((acc, item) => {
    
    const valorStr = item.valorTotal || '0'
    const valor = parseFloat(valorStr.replace('R$', '').replace(',', '.').trim()) || 0
    acc.geral += valor

    const forma = item.formaPagamento || 'Outros'
    if (forma !== 'Outros') {
      if (!acc[forma]) acc[forma] = 0
      acc[forma] += valor
    }

    return acc
  }, { geral: 0 })

  const colunas = [
    'Código',
    'Cliente',
    'Produto',
    'Qtd.',
    'Vr.Produto',
    'Vr.Total',
    'Forma de pagamento',
    'Data'
  ]

  const exportarCSV = async () => {
    if (!resultados || resultados.length === 0) return

    const csv = Papa.unparse(
      resultados.map(venda => ({
        Código: venda.codigo,
        Cliente: venda.cliente,
        Produto: venda.produto,
        Quantidade: venda.quantidade,
        'Valor Produto': venda.valorProduto,
        'Valor Total': venda.valorTotal,
        'Forma de Pagamento': venda.formaPagamento,
        Data: venda.data
      }))
    )

    const fileUri = FileSystem.documentDirectory + 'relatorio_vendas.csv'
    await FileSystem.writeAsStringAsync(fileUri, csv)
    await Sharing.shareAsync(fileUri)
  }

  return (
    <BaseLayout titulo="Relatório de Vendas">
      <ScrollView horizontal>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.colCodigo]}>Código</Text>
            <Text style={[styles.headerCell, styles.colCliente]}>Cliente</Text>
            <Text style={[styles.headerCell, styles.colProduto]}>Produto</Text>
            <Text style={[styles.headerCell, styles.colQuantidade]}>Qtd.</Text>
            <Text style={[styles.headerCell, styles.colValorProduto]}>Vr.Produto</Text>
            <Text style={[styles.headerCell, styles.colValorTotal]}>Vr.Total</Text>
            <Text style={[styles.headerCell, styles.colFormaPagamento]}>Forma Pagto</Text>
            <Text style={[styles.headerCell, styles.colData]}>Data</Text>
          </View>

          {(resultados || []).map((venda, index) => (
            <View 
              key={index} 
              style={[
                styles.tableRow,
                index % 2 === 1 && styles.tableRowAlternate
              ]}
            >
              <Text style={[styles.cell, styles.colCodigo]} numberOfLines={1}>{venda.codigo}</Text>
              <Text style={[styles.cell, styles.colCliente]} numberOfLines={2}>{venda.cliente}</Text>
              <Text style={[styles.cell, styles.colProduto]} numberOfLines={2}>{venda.produto}</Text>
              <Text style={[styles.cell, styles.colQuantidade]} numberOfLines={1}>{venda.quantidade}</Text>
              <Text style={[styles.cell, styles.colValorProduto]} numberOfLines={1}>{venda.valorProduto}</Text>
              <Text style={[styles.cell, styles.colValorTotal]} numberOfLines={1}>{venda.valorTotal}</Text>
              <Text style={[styles.cell, styles.colFormaPagamento]} numberOfLines={2}>{venda.formaPagamento}</Text>
              <Text style={[styles.cell, styles.colData]} numberOfLines={1}>{venda.data}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.totalizadores}>
        <Text style={styles.totalTitulo}>Totalizadores</Text>

        <View style={styles.totalLinha}>
          <Text style={styles.totalLabel}>Total geral:</Text>
          <Text style={styles.totalValor}>{formatar(totais.geral)}</Text>
        </View>

        {Object.entries(totais)
          .filter(([key]) => key !== 'geral')
          .map(([forma, valor], index) => (
            <View key={index} style={styles.totalLinha}>
              <Text style={styles.totalLabel}>
                Total {forma.charAt(0).toUpperCase() + forma.slice(1)}:
              </Text>
              <Text style={styles.totalValor}>{formatar(valor)}</Text>
            </View>
          ))}
      </View>

      <TouchableOpacity style={styles.botaoExportar} onPress={exportarCSV}>
        <Text style={styles.textoBotao}>Exportar CSV</Text>
      </TouchableOpacity>
    </BaseLayout>
  )
}

const styles = StyleSheet.create({
  table: {
    minWidth: 1170, 
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
  
  colCodigo: { width: 80, textAlign: 'center' },
  colCliente: { width: 180, textAlign: 'left', paddingHorizontal: 12 },
  colProduto: { width: 200, textAlign: 'left', paddingHorizontal: 12 },
  colQuantidade: { width: 70, textAlign: 'center' },
  colValorProduto: { width: 100, textAlign: 'right' },
  colValorTotal: { width: 100, textAlign: 'right' },
  colFormaPagamento: { width: 140, textAlign: 'center' },
  colData: { width: 100, textAlign: 'center' },
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
    marginBottom: 10
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
    color: cores.text
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
  }
})
