/**
 * Paleta de cores do Brechó Beneficente
 * Tema ecológico e sustentável
 * Gerei pela IA com base em temas de sustentabilidade (validar depois)
 */

export const cores = {
    // Cores principais do tema
    background: '#F9F5EC',    // Bege claro - fundo principal
    primary: '#637E3E',       // Verde escuro - cor principal
    secondary: '#7A9E56',     // Verde médio - cor secundária  
    accent: '#A87246',        // Marrom - cor de destaque
    text: '#2F3A25',          // Verde muito escuro - texto principal
    white: '#FEFCF8',         // Branco levemente amarelado

    // Variações para diferentes estados
    primaryLight: '#8BAE5F',   // Verde claro para hover/disabled
    primaryDark: '#4A5E2E',    // Verde ainda mais escuro

    // Cores funcionais
    success: '#637E3E',        // Mesma cor primary para consistência
    warning: '#D4A574',        // Tom mais claro do accent
    error: '#C85C5C',          // Vermelho suave
    info: '#7A9E56',           // Mesma cor secondary

    // Tons de cinza ecológicos
    gray100: '#F5F3F0',
    gray200: '#E8E4DD',
    gray300: '#D3CFC5',
    gray400: '#B8B3A6',
    gray500: '#9C9688',
    gray600: '#7D7869',
    gray700: '#5F5A4B',
    gray800: '#423E32',
    gray900: '#2A2620',

    // Cores para bordas e divisores
    border: '#D3CFC5',
    divider: '#E8E4DD',

    // Cores com transparência
    overlay: 'rgba(47, 58, 37, 0.4)',      // Overlay escuro
    shadowColor: 'rgba(47, 58, 37, 0.2)',   // Sombras
    backdrop: 'rgba(249, 245, 236, 0.95)',  // Backdrop modal
}

// Exportação para compatibilidade com React Native theme system
export const Colors = {
    light: {
        text: cores.text,
        background: cores.background,
        tint: cores.primary,
        icon: cores.gray600,
        tabIconDefault: cores.gray500,
        tabIconSelected: cores.primary,
        border: cores.border,
        card: cores.white,
        primary: cores.primary,
        notification: cores.accent,
    },
    dark: {
        // Caso queira implementar tema escuro no futuro
        text: cores.white,
        background: cores.gray900,
        tint: cores.secondary,
        icon: cores.gray400,
        tabIconDefault: cores.gray500,
        tabIconSelected: cores.secondary,
        border: cores.gray700,
        card: cores.gray800,
        primary: cores.secondary,
        notification: cores.accent,
    },
}

// Utilitários para cores
export const getColorWithOpacity = (color, opacity) => {
    // Remove o # se presente
    const cleanColor = color.replace('#', '')

    // Converte hex para RGB
    const r = parseInt(cleanColor.substr(0, 2), 16)
    const g = parseInt(cleanColor.substr(2, 2), 16)
    const b = parseInt(cleanColor.substr(4, 2), 16)

    return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export default cores