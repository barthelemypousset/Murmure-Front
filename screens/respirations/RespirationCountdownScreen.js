import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfirmModal from '../../components/ConfirmModal';
import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Asset } from 'expo-asset'; //Chargement de l'image

const COLORS = {
  dark: '#433c35ff',
};

export default function RespirationCountdownScreen({ route, navigation }) {
  const { duration } = route.params;

  const [imageLoaded, setImageLoaded] = useState(false); // state pour le chargement de l'image (trop lente sinon)
  const [isPlaying, setIsPlaying] = useState(false);

  const [ecoule, setEcoule] = useState(0); //valeur incrémentée par le setInterval
  const totalDuration = duration * 60; //secondes totales (car en min)
  const [phase, setPhase] = useState('inspire'); //phases inspire/expire

  const [showExitPopup, setShowExitPopup] = useState(false); // popup sortie

  const [showCongrats, setShowCongrats] = useState(false); // state de congrats

  const scaleAnim = useRef(new Animated.Value(1)).current; //   Animation cercle= définition du cercleAnim
  const timeoutsVibrations = useRef([]); // timeouts des haptics
  const [hasStarted, setHasStarted] = useState(false);
  // PRECHARGEMENT DE L'IMAGE BACKGROUND-----------------------------------
  useEffect(() => {
    // Fonction pour charger l'image
    const preloadImage = async () => {
      try {
        // Précharge l'image en cache
        await Asset.fromModule(
          require('../../assets/respiration/respirationBkg.png')
        ).downloadAsync();

        // Indique que l'image est chargée
        setImageLoaded(true);
      } catch (error) {
        console.log('Erreur chargement image:', error);
        // Même si erreur, affichage de l'écran
        setImageLoaded(true);
      }
    };
    preloadImage();
  }, []);

  // TIMER GLOBAL -----------------------------------
  // Timer global (idem méditation solo)
  useEffect(() => {
    let interval;

    if (isPlaying) {
      interval = setInterval(() => {
        setEcoule((prev) => {
          if (prev >= totalDuration) {
            clearInterval(interval);
            setIsPlaying(false);
            setShowCongrats(true); //Affichera la modal congratulations
            return totalDuration; //ecoule à la valeur max
          }
          return prev + 1;
        });
      }, 1000); //tts les 1 sec
    }

    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // PHASE + ANIMATION RESPIRE-----------------------------------
  // Alternance phases inspire/expire
  useEffect(() => {
    if (!isPlaying) return;
    // Démarre immédiatement l'animation et les haptics pour la phase actuelle
    animateBreathing(phase);
    startHaptics(phase);

    let cycle = setInterval(() => {
      setPhase((prev) => (prev === 'inspire' ? 'expire' : 'inspire'));
    }, 5000); //ttes les 5 secs : Inspire 5 secondes / Expire 5 secondes
    return () => clearInterval(cycle);
  }, [isPlaying]);

  // // UseEffect qui lance l'animation au changement de la phase + isPlaying
  useEffect(() => {
    if (!isPlaying) return;

    animateBreathing(phase);
    startHaptics(phase);
  }, [phase]);

  // Animation https://reactnative.dev/docs/animated
  const animateBreathing = (phase) => {
    Animated.timing(scaleAnim, {
      toValue: phase === 'inspire' ? 1.8 : 0.8, //valeur renvoyée
      duration: 5000, //ttes les 5 secs
      useNativeDriver: true,
    }).start();
  };

  // VIBRATIONS-----------------------------------
  // Haptics - Vibrations inspire/expire

  // Fonction pour démarrer les haptics selon la phase
  const startHaptics = (currentPhase) => {
    cleanVibrations(); // on nettoie avant de relancer
    // Rythme et intensité
    //  Inspiration
    const inspirePattern = [
      { delay: 0, style: Haptics.ImpactFeedbackStyle.Light },
      { delay: 100, style: Haptics.ImpactFeedbackStyle.Light },
      { delay: 200, style: Haptics.ImpactFeedbackStyle.Light },
      { delay: 300, style: Haptics.ImpactFeedbackStyle.Light },
      { delay: 400, style: Haptics.ImpactFeedbackStyle.Light },
      { delay: 600, style: Haptics.ImpactFeedbackStyle.Medium },
      { delay: 800, style: Haptics.ImpactFeedbackStyle.Medium },
      { delay: 900, style: Haptics.ImpactFeedbackStyle.Medium },
      { delay: 1200, style: Haptics.ImpactFeedbackStyle.Medium },
      { delay: 1500, style: Haptics.ImpactFeedbackStyle.Heavy },
      { delay: 1800, style: Haptics.ImpactFeedbackStyle.Heavy },
      { delay: 2200, style: Haptics.ImpactFeedbackStyle.Heavy },
      { delay: 2600, style: Haptics.ImpactFeedbackStyle.Heavy },
      { delay: 2900, style: Haptics.ImpactFeedbackStyle.Heavy },
    ];

    const expirePattern = [
      //Expiration
      { delay: 0, style: Haptics.ImpactFeedbackStyle.Heavy },
      { delay: 500, style: Haptics.ImpactFeedbackStyle.Heavy },
      { delay: 1000, style: Haptics.ImpactFeedbackStyle.Heavy },
      { delay: 1500, style: Haptics.ImpactFeedbackStyle.Medium },
      { delay: 2000, style: Haptics.ImpactFeedbackStyle.Medium },
      { delay: 2500, style: Haptics.ImpactFeedbackStyle.Medium },
      { delay: 3000, style: Haptics.ImpactFeedbackStyle.Light },
      { delay: 3500, style: Haptics.ImpactFeedbackStyle.Light },
      { delay: 4000, style: Haptics.ImpactFeedbackStyle.Light },
      { delay: 4500, style: Haptics.ImpactFeedbackStyle.Light },
    ];

    // Choix du pattern selon la phase
    const pattern = currentPhase === 'inspire' ? inspirePattern : expirePattern;

    // Lancement des haptics
    pattern.forEach((step) => {
      const id = setTimeout(() => {
        // si on a fait pause on arrête
        if (isPlaying) {
          Haptics.impactAsync(step.style);
        }
      }, step.delay);

      // chaque timeout est stocké
      timeoutsVibrations.current.push(id);
    });
  };

  // Fonction pour nettoyer les haptics
  const cleanVibrations = () => {
    // on annule chaque timeout
    timeoutsVibrations.current.forEach((id) => clearTimeout(id));

    // puis on vide
    timeoutsVibrations.current = [];
  };

  // AUTRES FONCTIONS UTILES----------------------

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function stopRespiration() {
    setIsPlaying(false);
    cleanVibrations();
    // On remet le cercle à sa taille initiale
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

  // AFFICHAGE (préalable)--------------------
  if (!imageLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  return (
    <ImageBackground
      source={require('../../assets/respiration/respirationBkg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.innerGlobal}>
        <Text style={styles.title}>Respiration</Text>
        <Text style={styles.subtitle}>{duration} minutes</Text>

        {/* Timer */}
        <Text style={styles.timer}>{formatTime(totalDuration - ecoule)}</Text>

        {/* animation*/}
        <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.phaseText}>{phase === 'inspire' ? 'Inspire' : 'Expire'}</Text>
        </Animated.View>

        {/* Progress bar */}
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${(ecoule / totalDuration) * 100}%` }]} />
        </View>

        {/* Bouton Démarrer/pause/Arrêter */}
        {!isPlaying ? (
          <Pressable
            style={styles.playBtn}
            onPress={() => {
              setHasStarted(true);
              setIsPlaying(true);
            }}
          >
            <Text style={styles.playText}>{hasStarted ? 'Reprendre' : 'Démarrer'}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.playBtn} onPress={() => stopRespiration()}>
            <Text style={styles.playText}>Arrêter</Text>
          </Pressable>
        )}

        {/* Bouton retour */}
        <View style={styles.navigationContainer}>
          <Pressable
            type="back"
            style={styles.backButton}
            onPress={() => {
              if (isPlaying || hasStarted) {
                return setShowExitPopup(true);
              }
              navigation.goBack();
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#224c4aff" />
            <Text style={styles.backButtonText}>Retour</Text>
          </Pressable>
        </View>

        {/* Modale sortie avant la fin*/}
        <ConfirmModal
          visible={showExitPopup}
          message="Arrêter la respiration ?"
          onCancel={() => setShowExitPopup(false)}
          onConfirm={() => {
            stopRespiration();
            setShowExitPopup(false);
            navigation.goBack();
          }}
        />

        {/* Modale congrats à la fin*/}
        <ConfirmModal
          visible={showCongrats}
          singleButton
          message="Bravo ! Respiration terminée"
          onConfirm={() => {
            setShowCongrats(false);
            navigation.navigate('Shelves');
          }}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },

  innerGlobal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.dark,
  },

  subtitle: {
    fontSize: 18,
    color: COLORS.dark,
  },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },

  phaseText: {
    color: COLORS.dark,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  timer: {
    color: COLORS.dark,
    fontSize: 48,
    fontWeight: '700',
    marginTop: 20,
  },

  progressBarBackground: {
    width: '80%',
    height: 8,
    backgroundColor: '#ffffff55',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 30,
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.dark,
  },

  playBtn: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 20,
  },

  playText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#224C4A',
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    zIndex: 20,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    color: '#224c4aff',
    fontSize: 16,
    fontWeight: '600',
  },
});
