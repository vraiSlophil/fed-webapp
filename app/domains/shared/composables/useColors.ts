export function useColors() {
    function getLuminance(hex: string): number {
        // Convertir le hex en RGB
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        // Calcul de la luminosité selon la formule W3C
        const a = [r, g, b].map((v) => {
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });

        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    // Fonction pour déterminer la couleur du texte avec le bon contraste
    function getTextColor(backgroundColor: string): string {
        return getLuminance(backgroundColor) > 0.5 ? '#000000' : '#ffffff';
    }

    return {
        getLuminance,
        getTextColor,
    };
}
