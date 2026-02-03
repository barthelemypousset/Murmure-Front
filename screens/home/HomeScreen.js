import { BACKEND_ADDRESS } from '../../config';

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Animated, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import ParrotChatBtn from '../../components/ParrotChatBtn'; // Bouton perroquet pour chat
import PulsingButton from '../../components/PulsingButton';
import useResponsiveImagePosition from '../../hooks/useResponsiveImagePosition';
import InfoBubble from '../../components/InfoBulleHome';
export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const backgroundImage = require('../../assets/homescreenCadre.png');

  const { getPos, scale, originalW, originalH } = useResponsiveImagePosition(backgroundImage); // Utilisation du hook amélioré
  // getPos pour positionner, scale pour adapter les tailles

  // --- DÉFINITION DES POSITIONS EN POURCENTAGES ---

  const posEtagere = getPos(originalW * -0.2, originalH * 0.5); // PULSING BUTTON ÉTAGÈRE
  const posCarte = getPos(originalW * 0.36, originalH * 0.5); // PULSING BUTTON CARTE
  const posButton = getPos(originalW * -0.29, originalH * -0.007); // POSITION BOUTON MON COMPTE

  // POSITION PERROQUET
  const parrotPosY = Platform.OS === 'ios' ? 0.11 : 0.14;
  const parrotPosX = Platform.OS === 'ios' ? 0.43 : 0.42;
  const posPerroquet = getPos(originalW * parrotPosX, originalH * parrotPosY);

  const { isConnected, username } = useSelector((state) => state.userConnection); // Récupérer le statut de connexion depuis Redux

  const [infoBubble, setInfoBubble] = useState({ visible: false, message: '' }); // integration de l'infobulle

  // DEBUG: Afficher les valeurs des insets  ===>  a regarder dans la console pour connaitre les valeurs exactes et ajuster le positionnement
  console.log(`[SafeArea] top: ${insets.top}, bottom: ${insets.bottom}, left: ${insets.left}, right: ${insets.right}`);

  // Modèle iPhone	       \\ insets.top	  \\ Calcul	          \\Position finale
  // Votre iPhone (X-14)	 \\ 47px	        \\max(47-16, 10)	    \\31px ✅
  // iPhone 14 Pro+	       \\ 59px	        \\max(59-16, 10)	    \\43px ✅             NE PAS SUPPRIMER SVP
  // iPhone SE/8	         \\ 20px	        \\max(20-16, 10)	    \\10px ✅

  /// FORMULE : Math.max(insets.top - 16, 10)
  /// EX: style={[styles.compteButton, { top: Math.max(insets.top - 16, 10), right: 50 }]}

  useEffect(() => {
    // Chargement des chapitres depuis le backend
    fetch(`${BACKEND_ADDRESS}/chapters/`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.chapters && data.chapters.length > 0) {
          console.log('✅ Data received from backend');
          dispatch(setAllChapters(data.chapters)); // Met à jour le store Redux avec les chapitres reçus
        } else {
          console.log('⚠️ Backend empty, loading chaptersSafe');
        }
      })
      .catch((err) => {
        // Gérer les erreurs de fetch
        console.log('❌ Fetch error, loading chaptersSafe', err);
      });
  }, []);

  useEffect(() => {
    checkVisitCount(); // Appel initial pour vérifier le statut de visite
  }, [isConnected]); // Dépendance sur isConnected pour réagir aux changements de statut

  const checkVisitCount = () => {
    if (!isConnected) {
      setInfoBubble({
        visible: true,
        message:
          "✨ Bienvenue sur Murmure! ✨\n\nSouhaitez vous me parler ou commencer votre parcours?\nJe vous invite à cliquer sur l'étagère ou la porte vers le jardin.\n\n À très vite ! 😊",
      });
    } else {
      setInfoBubble({
        visible: true,
        message: `✨ Ravi de vous revoir ${username}! ✨\n\nPrêt à continuer?\n\nSouhaitez-vous continuer vers votre parcours ou initier une séance de relaxation?\n\nOu peut-être préférez-vous me parler?`,
      });
    }
  };

  const closeInfoBubble = () => {
    setInfoBubble({ visible: false, message: '' });
  };

  return (
    <ImageBackground style={styles.background} source={require('../../assets/homescreenCadre.png')} resizeMode="cover">
      <View style={[styles.mainContainer, { top: Math.max(insets.top - 16, 20) }]}>

        {/* InfoBulle */}
        <InfoBubble message={infoBubble.message} visible={infoBubble.visible} onClose={closeInfoBubble} />

        {/* Mon Compte */}
        <Button
          label={isConnected ? 'Mon compte' : 'Se Connecter'} // Texte dynamique basé sur le redux
          type="primary"
          style={[styles.compteButton, { left: 10, top: 20 }]} // Position adaptative : 31px sur notch, min 10px sur anciens iPhone
          onPress={() => {
            navigation.navigate('Compte');
          }}
        />

        {/* Perroquet */}
        <ParrotChatBtn
          onPress={() => {
            navigation.navigate('Chat');
          }}
          style={[
            { right: 40, top: 230 },
            {
              width: 100 * scale,
              height: 100 * scale,
              transform: [{ scaleX: -1 }], // Miroir horizontal
            },
          ]}
        />

        {/* Pulsing etagere */}
        <PulsingButton
          color="#ebaa20ff" // Jaune doux
          style={{ left: 40, top: 450 }}
          buttonScale={scale}
          onPress={() => {
            navigation.navigate('Shelves');
          }}
          children="Etagère"
        />

        {/* Pulsing Map */}
        <PulsingButton
          color="#2aa148ff" // Vert doux
          style={{ right: 60, top: 450 }}
          buttonScale={scale}
          onPress={() => {
            navigation.navigate('Map');
          }}
          children="Carte"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    // justifyContent: 'flex-end',
    // alignItems: 'center',
  },

  mainContainer: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    borderColor: 'red',
    borderWidth: 3,
  },

  compteButton: {
    zIndex: 100,
    width: 170, // Largeur fixe pour éviter le décalage lors du changement de texte
  },

  infoBubble: {
    paddingVertical: 70,
    paddingHorizontal: 20,
  },
});
