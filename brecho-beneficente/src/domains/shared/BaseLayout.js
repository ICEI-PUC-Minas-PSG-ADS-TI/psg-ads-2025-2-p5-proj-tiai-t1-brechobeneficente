import { useRouter } from 'expo-router'
import React, { useContext, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { AuthContext } from '../../context/AuthContext'
import cores from '../../constants/colors'
import Rodape from './Rodape'
import Topo from './Topo'

const BaseLayout = ({ children, titulo = '', scrollable = false }) => {
    const [menuAberto, setMenuAberto] = useState(false)
    const router = useRouter()
    const { isAutenticado } = useContext(AuthContext)

    const navegarPara = (item) => {
        setMenuAberto(false)
        switch (item.route) {
            case 'home': router.push('/home'); break
            case 'clientes': router.push('/clientes'); break
            case 'produtos': router.push('/produtos'); break
            case 'pedidos': router.push('/pedidos'); break
            case 'estoque': router.push('/estoque'); break
            case 'doacoes': router.push('/doacoes'); break
            case 'formas_pagamento': router.push('/formas_pagamento'); break
            case 'relatorios': router.push('/relatorios'); break
        }
    }

    const menuItens = [
        { label: 'Início', route: 'home', icon: 'home' },
        { label: 'Produtos', route: 'produtos', icon: 'package' },
        { label: 'Pedidos', route: 'pedidos', icon: 'shopping-cart' },
        { label: 'Doações', route: 'doacoes', icon: 'heart' },
        { label: 'Estoque', route: 'estoque', icon: 'archive' },
        { label: 'Clientes', route: 'clientes', icon: 'users' },
        // { label: 'Formas de Pagamento', route: 'formas_pagamento', icon: 'credit-card' },
        { label: 'Relatórios', route: 'relatorios', icon: 'bar-chart-2' }
    ]

    const Conteudo = (
        <>
            {isAutenticado && (
                <>
                    <TouchableOpacity onPress={() => setMenuAberto(!menuAberto)} style={styles.menuButton}>
                        <Feather name="menu" size={24} color={cores.primary} style={styles.menuIcon} />
                        <Text style={styles.titulo}>{titulo}</Text>
                    </TouchableOpacity>

                    {menuAberto && (
                        <View style={styles.menuOverlay}>
                            <TouchableOpacity
                                style={styles.menuBackdrop}
                                onPress={() => setMenuAberto(false)}
                            />
                            <View style={styles.menu}>
                                <View style={styles.menuHeader}>
                                    <Text style={styles.menuTitle}>Menu</Text>
                                    <TouchableOpacity onPress={() => setMenuAberto(false)}>
                                        <Feather name="x" size={20} color={cores.gray600} />
                                    </TouchableOpacity>
                                </View>

                                {menuItens.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => navegarPara(item)}
                                        style={styles.menuItemContainer}
                                    >
                                        <Feather
                                            name={item.icon}
                                            size={18}
                                            color={cores.primary}
                                            style={styles.menuItemIcon}
                                        />
                                        <Text style={styles.menuItem}>{item.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </>
            )}
            <View style={styles.contentContainer}>
                {children}
            </View>
        </>
    )

    return (
        <View style={styles.container}>
            <Topo />
            {scrollable ? (
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {Conteudo}
                </ScrollView>
            ) : (
                <View style={styles.scrollContainer}>{Conteudo}</View>
            )}
            <Rodape />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: cores.background,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: cores.background,
    },
    contentContainer: {
        flex: 1,
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 8,
    },
    menuIcon: {
        marginRight: 12,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: cores.text,
        flex: 1,
    },
    menuOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    menuBackdrop: {
        flex: 1,
        backgroundColor: cores.overlay,
    },
    menu: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: cores.white,
        borderRadius: 12,
        padding: 16,
        elevation: 8,
        shadowColor: cores.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: cores.border,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: cores.divider,
    },
    menuTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: cores.text,
    },
    menuItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginVertical: 2,
    },
    menuItemIcon: {
        marginRight: 12,
        width: 20,
    },
    menuItem: {
        fontSize: 15,
        color: cores.text,
        fontWeight: '500',
        flex: 1,
    }
})

export default BaseLayout