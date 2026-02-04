import { BACKEND_ADDRESS } from '../../config';

import { View, Text, StyleSheet, ImageBackground, Pressable } from 'react-native';

import Button from '../../components/Button';
import ChapterButton from '../../components/ChapterButton';
import ParrotChatBtn from '../../components/ParrotChatBtn';
import ConfirmModal from '../../components/ConfirmModal';
import { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { Ionicons } from '@expo/vector-icons';
import useResponsiveImagePosition from '../../hooks/useResponsiveImagePosition';

export default function MapScreen({ navigation }) {
  const TOTAL_LESSONS = 6;
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [showNotConnectedModal, setShowNotConnectedModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showMessageBubble, setShowMessageBubble] = useState(true);

  const dispatch = useDispatch();

  // Utilisation du hook pour positionner les boutons de chapitre de façon responsive
  const backgroundImage = require('../../assets/map.png');
  const { getPos, scale, originalW, originalH } = useResponsiveImagePosition(backgroundImage);

  // Positions des chapitres en pourcentages de l'image originale
  const posChapitre1 = getPos(originalW * 0.40, originalH * 0.87);
  const posChapitre2 = getPos(originalW * 0.13, originalH * 0.76);
  const posChapitre3 = getPos(originalW * 0.70, originalH * 0.65);
  const posChapitre4 = getPos(originalW * 0.2, originalH * 0.6);
  const posChapitre5 = getPos(originalW * 0.34, originalH * 0.47);
  const posChapitre6 = getPos(originalW * 0.60, originalH * 0.35);

  // Récupérer le progressNb et le statut de connexion de l'utilisateur depuis Redux
  const userProgressNb = useSelector((state) => state.userConnection?.userProgress || 0);
  const isConnected = useSelector((state) => state.userConnection?.isConnected || false);

  // Fonction pour valider l'accès à un chapitre
  const handleChapterPress = (chapterNumber, lessonNumber) => {
    // Chapitre 1 est toujours accessible
    if (chapterNumber === 1) {
      navigation.navigate('Lesson', { lessonNumber });
      return;
    }

    // Pour les chapitres > 1, vérifier d'abord si l'utilisateur est connecté
    if (!isConnected) {
      setShowNotConnectedModal(true);
      return;
    }

    // Si connecté, vérifier si le chapitre précédent a été validé
    if (userProgressNb >= chapterNumber - 1) {
      navigation.navigate('Lesson', { lessonNumber });
    } else {
      setShowLockedModal(true);
    }
  };

  useEffect(() => {
    if (userProgressNb === 0) {
      setShowWelcomeModal(true);
    }
  }, []);

  return (
    <ImageBackground style={styles.background} source={require('../../assets/map.png')} resizeMode="cover">
      {showMessageBubble && (
        <View style={styles.header}>
          <View style={styles.messageBubble}>
            <Pressable style={styles.closeButton} onPress={() => setShowMessageBubble(false)}>
              <Ionicons name="close" size={20} color="#224C4A" />
            </Pressable>

            <Text style={styles.messageText}>Bonne aventure ! Je suis disponible pour chatter à tout moment.</Text>
            <View style={styles.bubblePic} />
          </View>
        </View>
      )}

      <ParrotChatBtn onPress={() => navigation.navigate('Chat')} style={styles.perroquet} />

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${(userProgressNb / TOTAL_LESSONS) * 100}%` }]} />
        </View>

        <Text style={styles.progressText}>
          Étape {userProgressNb} / {TOTAL_LESSONS}
        </Text>
      </View>

      <View style={styles.container}>
        <ChapterButton
          chapterNumber={6}
          progressNb={userProgressNb}
          onPress={() => handleChapterPress(6, 5)}
          style={posChapitre6}
        />

        <ChapterButton
          chapterNumber={5}
          progressNb={userProgressNb}
          onPress={() => handleChapterPress(5, 4)}
          style={posChapitre5}
        />

        <ChapterButton
          chapterNumber={4}
          progressNb={userProgressNb}
          onPress={() => handleChapterPress(4, 3)}
          style={posChapitre4}
        />

        <ChapterButton
          chapterNumber={3}
          progressNb={userProgressNb}
          onPress={() => handleChapterPress(3, 2)}
          style={posChapitre3}
        />

        <ChapterButton
          chapterNumber={2}
          progressNb={userProgressNb}
          onPress={() => handleChapterPress(2, 1)}
          style={posChapitre2}
        />

        <ChapterButton
          chapterNumber={1}
          progressNb={userProgressNb}
          onPress={() => handleChapterPress(1, 0)}
          style={posChapitre1}
        />

        <View style={styles.navigationContainer} pointerEvents="box-none">
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#224c4aff" />
            <Text style={styles.backButtonText}>Retour</Text>
          </Pressable>
        </View>
      </View>

      <ConfirmModal
        visible={showLockedModal}
        message="Un pas après l'autre, validez d'abord le chapitre précédent."
        onConfirm={() => setShowLockedModal(false)}
        singleButton={true}
      />

      <ConfirmModal
        visible={showNotConnectedModal}
        message="Il faut un compte pour accéder à ce chapitre."
        onConfirm={() => setShowNotConnectedModal(false)}
        singleButton={true}
      />

      <ConfirmModal
        visible={showWelcomeModal}
        message="Bienvenue dans la Forêt ! Allume successivement les feux pour parcourir le chemin :)"
        onConfirm={() => setShowWelcomeModal(false)}
        singleButton={true}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // header perroquet
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 5,
  },
  messageBubble: {
    backgroundColor: '#D8F0E4',
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 18,
    width: '70%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4,
  },
  messageText: {
    fontSize: 15.5,
    lineHeight: 21,
    fontWeight: '500',
    color: '#224C4A',
    paddingRight: 30, // Espace pour la croix
  },
  bubblePic: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#D8F0E4',
    top: 30,
    right: -6,
    transform: [{ rotate: '45deg' }],
  },
  perroquet: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scaleX: -1 }], //perroquet retourné miroir
    zIndex: 10,
  },

  container: {
    flex: 1,
    // backgroundColor: "#fff", //
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  progressContainer: {
    position: 'absolute',
    top: 130,
    width: '80%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
  },

  progressBackground: {
    height: 10,
    backgroundColor: '#E2E2E2',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#507C79',
    borderRadius: 10,
  },
  progressText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    color: '#433C35',
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  navigationContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    zIndex: 10,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#d8f0e4bc',
  },

  backButtonText: {
    color: '#224c4aff',
    fontSize: 16,
    fontWeight: '600',
  },
});
