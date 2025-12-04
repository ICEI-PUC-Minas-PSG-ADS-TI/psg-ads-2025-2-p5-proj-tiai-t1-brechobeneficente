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
                {colunas.map((col, index) => (
                  <Text key={index} style={styles.headerCell}>{col}</Text>
                ))}
              </View>

              {(resultados || []).map((linha, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.cell}>{linha.codigo}</Text>
                  <Text style={styles.cell}>{linha.nome}</Text>
                  <Text style={styles.cell}>{linha.documento || '-'}</Text>
                  <Text style={styles.cell}>{linha.telefone || '-'}</Text>
                  <Text style={styles.cell}>{linha.endereco || '-'}</Text>
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
    minWidth: 700,
    borderWidth: 1,
    borderColor: cores.border || '#ccc',
    borderRadius: 6,
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: cores.primary
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: cores.border || '#ddd'
  },
  headerCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    color: cores.white
  },
  cell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 12,
    textAlign: 'center',
    color: cores.text
  },
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
  },
  semDados: {
    padding: 20,
    alignItems: 'center',
    marginTop: 40
  },
  semDadosTexto: {
    fontSize: 16,
    color: '#888'
  }
})
