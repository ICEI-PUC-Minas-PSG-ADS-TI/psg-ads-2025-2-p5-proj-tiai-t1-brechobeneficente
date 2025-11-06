import { StyleSheet, Text, View } from 'react-native'

const cores = {
    'Em aberto': '#6c757d',
    'Em andamento': '#ffc107',
    'Concluída': '#28a745',
    'Cancelada': '#dc3545',
    'Fiado': '#653c8c'
}

const StatusPedidos = ({ status }) => {
    const cor = cores[status] || '#6c757d'

    return (
        <View style={[styles.badge, { backgroundColor: cor }]}>
            <Text style={styles.texto}>{status}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'center',
        maxWidth: '100%'
    },
    texto: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        flexShrink: 1,
        textAlign: 'center'
    }
})

export default StatusPedidos