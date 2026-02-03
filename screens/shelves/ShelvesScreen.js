import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Animated,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';

import React, { useEffect, useRef,useState  } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';   // Important pour le bouton retour
import useResponsiveImagePosition from '../../hooks/useResponsiveImagePosition'; // Hook de positionnement responsive
import PulsingButton from '../../components/PulsingButton'; // Bouton pulsant partagé

export default function ShelvesScreen({ navigation }) {
    const backgroundImage = require('../../assets/etagereCoco.png');
    const { getPos, scale, originalW, originalH } = useResponsiveImagePosition(backgroundImage); // Utilisation du hook amélioré
    const insets = useSafeAreaInsets(); // Pour gérer l'encoche du téléphone


    // --- DÉFINITION DES POSITIONS EN POURCENTAGES ---
    // Utilisation de pourcentages des dimensions originales pour un meilleur responsive
    const posMeditation = getPos(originalW * 0.49, originalH * 0.27);       //   50% de la largeur, 30% de la hauteur
    const posRespiration = getPos(originalW * 0.363, originalH * 0.432);    //   35% de la largeur, 45% de la hauteur
    const posChat = getPos(originalW * 0.59, originalH * 0.41);             //   60% de la largeur, 40% de la hauteur
    const posFlashcard = getPos(originalW * 0.65, originalH * 0.59);        //   65% de la largeur, 60% de la hauteur

  return (
    <ImageBackground style={styles.background} source={backgroundImage} resizeMode="cover">
      {/* --- ZONE 1 : LES BOUTONS DU DÉCOR (Position Absolue sur l'image) --- */}

      {/* Méditation */}
      <PulsingButton
        color="#f1c972ff"
        style={posMeditation}
        buttonScale={scale}
        onPress={() => navigation.navigate('MeditationHome')}
      />

      {/* Respiration */}
      <PulsingButton
        color="#93c29eff"
        style={posRespiration}
        buttonScale={scale}
        onPress={() => navigation.navigate('RespirationHome')}
      />

      {/* Chat */}
      <PulsingButton
        color="#f8f6f3ff"
        style={posChat}
        buttonScale={scale}
        onPress={() => navigation.navigate('Chat')}
      />

        {/* Flashcard */}
      <PulsingButton
        color="#776b73ff" 
        style={posFlashcard}
        buttonScale={scale}
        onPress={() => navigation.navigate('Flashcard')}
      />


      {/* --- ZONE 2 : UI FLOTTANTE (Bouton Retour) --- */}
      {/* pointerEvents="box-none" est CRUCIAL : cela permet de cliquer "à travers" 
            les zones vides de ce conteneur pour atteindre les boutons en dessous */}

      <View style={[styles.uiContainer, { paddingTop: Math.max(insets.top, 20) }]} pointerEvents="box-none">
        {/* Bouton Précédent */}
        <View style={styles.navigationContainer}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#224c4aff" />
            <Text style={styles.backButtonText}>Retour</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // Styles pour l'écran
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // Conteneur pour l'interface utilisateur (bouton retour)
  uiContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Bouton Back
  navigationContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    zIndex: 20, // Augmenté pour être au-dessus des PulsingButton (qui ont zIndex: 10)
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#f1f7f4d2',
  },

  backButtonText: {
    color: '#224c4aff',
    fontSize: 16,
    fontWeight: '600',
  },
});
