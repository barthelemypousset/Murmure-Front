import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';

const InfoBubble = ({ message, visible, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 1. Log à chaque rendu du composant
  // console.log(`[InfoBubble] Rendu du composant. Visible: ${visible}, Message: "${message}"`);

  useEffect(() => {
    // console.log(`[InfoBubble] useEffect déclenché. État visible: ${visible}`);

    if (visible) {
      // console.log('[InfoBubble] 🟢 Condition TRUE : Démarrage animation apparition');

      // Animation d'apparition
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }).start();

      // Auto-fermeture après 4 secondes
      console.log('[InfoBubble] ⏳ Démarrage du Timer (200s)');
      const timer = setTimeout(() => {
        onClose();
      }, 200000); // 200 secondes nombre qui peut etre modifie pour la duree de l'infobulle

      // Fonction de nettoyage
      return () => {
        clearTimeout(timer);
      };
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [visible]); // Dépendances du useEffect

  // LOGIQUE CRITIQUE ICI
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.infoBubbleContainer}>
      <View style={styles.infoBubble}>
        <Text allowFontScaling={false} style={styles.infoBubbleText}>
          {message}
        </Text>

        {/* Bouton de fermeture */}
        <TouchableOpacity
          onPress={() => {
            onClose();
          }}
          style={styles.closeButton}
        >
          <Text style={styles.infoBubbleClose}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoBubbleContainer: {
    position: 'absolute',
    padding:10,
    zIndex: 1000,
    width: '100%', // Prend 100% de la largeur disponible dans le parent (qui a déjà du padding)
    alignSelf: 'center', // S'assure d'être bien centré
  },

  infoBubble: {
    backgroundColor: '#81be83ff',
    padding: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 4.65,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  infoBubbleText: {
    color: '#FFFFFF',
    fontSize: 14, // On grossit un poil sur Android si besoin
    fontSize: Platform.OS === 'android' ? 15 : 13, // On grossit un poil sur Android si besoin    fontWeight: '600',
    fontWeight: '600',
    lineHeight: 22, // Impératif pour que le texte "s'empile" pareil
    flex: 1,
    lineHeight: 20,
    paddingRight: 10,
  },

  closeButton: {
    padding: 5,
    marginTop: -5,
  },

  infoBubbleClose: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    opacity: 0.9,
  },
});

export default InfoBubble;
