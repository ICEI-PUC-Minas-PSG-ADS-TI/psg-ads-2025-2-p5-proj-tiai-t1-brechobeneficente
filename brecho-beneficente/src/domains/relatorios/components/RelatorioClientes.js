import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import Papa from 'papaparse'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRelatorioClientes } from '../../../context/relatorios/RelatorioClientesContext'
import BaseLayout from '../../shared/BaseLayout'
import cores from '../../../constants/colors'

export default function RelatorioClientes() {
  const { resultados } = useRelatorioClientes()
  const colunas = ['Código', 'Nome', 'Documento', 'Telefone', 'Endereço']

  const exportarCSV = async () => {
    if (!resultados || resultados.length === 0) return

    const csv = Papa.unparse(
      resultados.map((cliente) => ({
        Código: cliente.codigo,
        Nome: cliente.nome,
        Documento: cliente.documento || '',
        Telefone: cliente.telefone || '',
        Endereço: cliente.endereco || ''
      }))
    )

    const fileUri = FileSystem.documentDirectory + 'relatorio_clientes.csv'
    await FileSystem.writeAsStringAsync(fileUri, csv)
    await Sharing.shareAsync(fileUri)
  }

  return (
    <BaseLayout titulo="Relatório de Clientes">
      {resultados.length > 0 ? (
        <>
          <ScrollView horizontal>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.colCodigo]}>Código</Text>
                <Text style={[styles.headerCell, styles.colNome]}>Nome</Text>
                <Text style={[styles.headerCell, styles.colDocumento]}>Documento</Text>
                <Text style={[styles.headerCell, styles.colTelefone]}>Telefone</Text>
                <Text style={[styles.headerCell, styles.colEndereco]}>Endereço</Text>
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
                  <Text style={[styles.cell, styles.colNome]} numberOfLines={2}>{linha.nome}</Text>
                  <Text style={[styles.cell, styles.colDocumento]} numberOfLines={1}>{linha.documento || '-'}</Text>
                  <Text style={[styles.cell, styles.colTelefone]} numberOfLines={1}>{linha.telefone || '-'}</Text>
                  <Text style={[styles.cell, styles.colEndereco]} numberOfLines={3}>{linha.endereco || '-'}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.totalizadores}>
            <Text style={styles.totalTitulo}>Totalizadores</Text>
            <View style={styles.totalLinha}>
              <Text style={styles.totalLabel}>Clientes cadastrados:</Text>
              <Text style={styles.totalValor}>{resultados.length}</Text>
            </View>
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
    minWidth: 950, // Soma das larguras das colunas
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
  colNome: { width: 200, textAlign: 'left', paddingHorizontal: 12 },
  colDocumento: { width: 150, textAlign: 'center' },
  colTelefone: { width: 150, textAlign: 'center' },
  colEndereco: { width: 350, textAlign: 'left', paddingHorizontal: 12 },
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
