import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import Papa from 'papaparse'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRelatorioDoacao } from '../../../context/relatorios/RelatorioDoacoesContext'
import BaseLayout from '../../shared/BaseLayout'
import cores from '../../../constants/colors'

export default function RelatorioDoacao() {
  const { resultados } = useRelatorioDoacao()
  const colunas = ['Código', 'Categoria', 'Tipo', 'Status', 'Valor', 'Data']

  const exportarCSV = async () => {
    if (!resultados || resultados.length === 0) return

    const csv = Papa.unparse(
      resultados.map((doacao) => ({
        Código: doacao.codigo,
        Categoria: doacao.categoria,
        Tipo: doacao.tipo,
        Status: doacao.status,
        Valor: doacao.valor,
        Data: doacao.data
      }))
    )

    const fileUri = FileSystem.documentDirectory + 'relatorio_doacoes.csv'
    await FileSystem.writeAsStringAsync(fileUri, csv)
    await Sharing.shareAsync(fileUri)
  }

  const calcularValorTotal = () => {
    return resultados.reduce((total, doacao) => {
      const valor = parseFloat(doacao.valor.replace('R$ ', '').replace(',', '.')) || 0
      return total + valor
    }, 0)
  }

  const contarPorStatus = () => {
    const contadores = {}
    resultados.forEach(doacao => {
      contadores[doacao.status] = (contadores[doacao.status] || 0) + 1
    })
    return contadores
  }

  const statusContadores = contarPorStatus()

  return (
    <BaseLayout titulo="Relatório de Doações">
      {resultados.length > 0 ? (
        <>
          <ScrollView horizontal>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.colCodigo]}>Código</Text>
                <Text style={[styles.headerCell, styles.colCategoria]}>Categoria</Text>
                <Text style={[styles.headerCell, styles.colStatus]}>Status</Text>
                <Text style={[styles.headerCell, styles.colTipo]}>Tipo</Text>
                <Text style={[styles.headerCell, styles.colValor]}>Valor</Text>
                <Text style={[styles.headerCell, styles.colData]}>Data</Text>
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
                  <Text style={[styles.cell, styles.colCategoria]} numberOfLines={2}>{linha.categoria}</Text>
                  <Text style={[styles.cell, styles.colStatus]} numberOfLines={1}>{linha.status}</Text>
                  <Text style={[styles.cell, styles.colTipo]} numberOfLines={1}>{linha.tipo}</Text>
                  <Text style={[styles.cell, styles.colValor]} numberOfLines={1}>{linha.valor}</Text>
                  <Text style={[styles.cell, styles.colData]} numberOfLines={1}>{linha.data}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.totalizadores}>
            <Text style={styles.totalTitulo}>Totalizadores</Text>
            <View style={styles.totalLinha}>
              <Text style={styles.totalLabel}>Total de doações:</Text>
              <Text style={styles.totalValor}>{resultados.length}</Text>
            </View>
            <View style={styles.totalLinha}>
              <Text style={styles.totalLabel}>Valor total:</Text>
              <Text style={styles.totalValor}>R$ {calcularValorTotal().toFixed(2)}</Text>
            </View>
            {Object.entries(statusContadores).map(([status, count]) => (
              <View key={status} style={styles.totalLinha}>
                <Text style={styles.totalLabel}>{status}:</Text>
                <Text style={styles.totalValor}>{count}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.botaoExportar} onPress={exportarCSV}>
            <Text style={styles.textoBotao}>Exportar CSV</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.semDados}>
          <Text style={styles.semDadosTexto}>Nenhum dado encontrado para os filtros aplicados.</Text>
        </View>
      )}
    </BaseLayout>
  )
}

const styles = StyleSheet.create({
  table: {
    minWidth: 710, // Soma das larguras das colunas (100+150+120+120+120+100)
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
  // Larguras específicas para cada coluna
  colCodigo: { width: 100, textAlign: 'center' },
  colCategoria: { width: 150, textAlign: 'left', paddingHorizontal: 12 },
  colStatus: { width: 120, textAlign: 'center' },
  colTipo: { width: 120, textAlign: 'center' },
  colValor: { width: 120, textAlign: 'right' },
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
    padding: 20,
    alignItems: 'center',
    marginTop: 40
  },
  semDadosTexto: {
    fontSize: 16,
    color: cores.text,
    textAlign: 'center'
  }
})