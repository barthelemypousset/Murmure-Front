import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Pressable,
 } from "react-native";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import { Ionicons } from "@expo/vector-icons";
// Doc audio: https://docs.expo.dev/versions/latest/sdk/av/

import { BACKEND_ADDRESS } from "../../config";

export default function MeditationPlayer({ route, navigation }) {
  // Params passés par l'écran MeditationHomeScreen
  const { theme, mode, duration } = route.params;

  // states définis
  const [audioUrl, setAudioUrl] = useState("");
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  // states en lien avec la barre de progression Meditations Guidees
  const [position, setPosition] = useState(0); // en ms
  const [durationMs, setDurationMs] = useState(1); // en ms (éviter division par 0)
  const [showExitPopup, setShowExitPopup] = useState(false); // popup sortie

  // state de congrats
  const [showCongrats, setShowCongrats] = useState(false);

  // states du player solo
  const [ecouleSolo, setEcouleSolo] = useState(0); //valeur incrémentée par le setInterval
  const totalSoloDuration = duration * 60; //secondes totales (car en min)
  const progressSolo = ecouleSolo / totalSoloDuration;
  const [isSoloPlaying, setIsSoloPlaying] = useState(false);

  // states du player meditation guidée
  const [errorNotFound, setErrorNotFound] = useState(false);
  // const safeNav = useNavigation(navigation);
  
  const [hasStarted, setHasStarted] = useState(false);


  // UseEffect du player méditation guidée, fetch au lancement du screen
  useEffect(() => {
    if (mode !== "guidee") {
      setLoading(false);
      return;
    }

    // requeter les meditation avec un query parameter
    fetch(`${BACKEND_ADDRESS}/meditations/player?theme=${theme}&mode=${mode}&duration=${duration}`)
      .then((res) => res.json())
      .then(async (data) => {
   
        if (!data.audioUrl) {
          // si aucune méditation trouvée
          setLoading(false);
          setErrorNotFound(true);
          return;
        }
        // Si tout est ok, on met à jour le state avec l'url renvoyé par le backend
        setAudioUrl(data.audioUrl);

        //Gestion du mode silencieux:
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // charger le son
        const { sound: newSound } = await Audio.Sound.createAsync(
          //createAsync()télécharge le fichier url et renvoie l'objet sound
          { uri: data.audioUrl },
          { shouldPlay: false }, //lancement de la lecture
          (status) => {
            // console.log("status audio :", status); //status: callback appelée en permanence
            if (status.isLoaded) {
              setPosition(status.positionMillis);
              setDurationMs(status.durationMillis);
              // setIsPlaying(status.isPlaying);
            }
            // pour modale de félicitations
            if (status.didJustFinish) {
              setShowCongrats(true);
              setIsPlaying(false);
            }
          }
        );
        await newSound.setVolumeAsync(1.0); // Volume à 100%
        setSound(newSound);
        setIsPlaying(false);
        setLoading(false);
      });
  }, []);

  // UseEffect du mode solo (timer qui défile)
  useEffect(() => {
    let interval;

    if (mode === "solo" && isSoloPlaying) {
      interval = setInterval(() => {
        setEcouleSolo((prev) => {
          if (prev >= totalSoloDuration) {
            clearInterval(interval);
            setIsSoloPlaying(false);
            setShowCongrats(true); //Affichera la modal congratulations
            return totalSoloDuration; //ecouleSolo à la valeur max
          }
          return prev + 1;
        });
      }, 1000); //tts les 1 sec
    }

    return () => clearInterval(interval);
  }, [isSoloPlaying, mode]);

  // MEDITATIONS GUIDEES
  // calcul de la progression en fonction du status (sound)
  const progress = position / durationMs; // entre 0 et 1

  //calcul temps restant et ecoule
  const ecoule = position / 1000; // en secondes
  const total = durationMs / 1000;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  // Nettoyage du son
  useEffect(() => {
    return () => {
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, [sound]);

  //PlayPause btn
  const togglePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      setIsPlaying(false);
      await sound.pauseAsync(); //met en pause
    } else {
      setHasStarted(true);
      setIsPlaying(true);
      const status = await sound.playAsync(); //await lancement du player
      if (status.positionMillis === 0) {
        //vérif supplémentaire
        await sound.playAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  // Au stop, on retourne sur précédent
  const stopMeditation = async () => {
    // sécurité nettoyage du son quand on quitte la page
    if (sound) {
      await sound.stopAsync(); //arrêt et revient à zéro
      await sound.unloadAsync(); //libérer la mémoire (destruction du playser)
    }
    setShowExitPopup(false);
    navigation.goBack();
  };

  // MEDITATION SOLO
  //Démarrage du solo
  const startSolo = () => {
    setHasStarted(true);
    setEcouleSolo(0);
    setIsSoloPlaying(true);
  };

  // Stop méditation solo
  const stopMeditationSolo = () => {
    setIsSoloPlaying(false);
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={require('../../assets/meditation/meditationBkg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Loader activityIndicator pour mes méditations guidées */}
      {loading && mode === 'guidee' && (
        <ActivityIndicator size="large" color="#fff" /> //chargement
      )}

      {/* Player pour méditations guidées */}
      {mode === 'guidee' && !loading && (
        <View style={styles.playerContainer}>
          <Text style={styles.title}>Méditation {theme}</Text>
          <Text style={styles.subtitle}>
            {duration} minutes - {mode}
          </Text>

          {/* Barre de progression */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
            {/* Time restant et écoulé + formattage*/}
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(ecoule)}</Text>
              <Text style={styles.timeText}>{formatTime(total)}</Text>
            </View>
          </View>
          {/* Bouton Play/Pause */}
          <Pressable style={styles.playPause} onPress={togglePlayPause}>
            {isPlaying ? (
              <Ionicons name="pause-circle" size={80} color="#eaeaeaff" />
            ) : (
              <Ionicons name="play-circle" size={80} color="#eaeaeaff" />
            )}
          </Pressable>
        </View>
      )}

      {/* Player pour méditations solo */}
      {mode === 'solo' && (
        <View style={styles.playerContainer}>
          <Text style={styles.title}>Méditation solo</Text>
          <Text style={styles.subtitle}>{duration} minutes</Text>

          {/* Timer */}
          <Text style={styles.timerSoloText}>{formatTime(totalSoloDuration - ecouleSolo)}</Text>

          {/* Progressbar Solo */}
          <View style={styles.progressSoloContainer}>
            <View style={[styles.progressSoloBar, { width: `${progressSolo * 100}%` }]} />
          </View>

          {!isPlaying ? (
            <Pressable style={styles.playPause} onPress={isSoloPlaying ? () => setIsSoloPlaying(false) : startSolo}>
              {isSoloPlaying ? (
                <Ionicons name="pause-circle" size={80} color="#eaeaeaff" />
              ) : (
                <Ionicons name="play-circle" size={80} color="#eaeaeaff" />
              )}
            </Pressable>
          ) : (
            <Pressable style={styles.playPause} onPress={() => setIsPlaying(false)}>
              <Text style={styles.playPauseText}>Pause</Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.navigationContainer}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (hasStarted) {
              setShowExitPopup(true);
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#224c4aff" />
          <Text style={styles.backButtonText}>Retour</Text>
        </Pressable>
      </View>

      {/* Modale aucune méditation guidée avec ces choix trouvée */}
      <ConfirmModal
        visible={errorNotFound}
        message="Aucune méditation disponible pour ce choix."
        singleButton={true} //1 seul bouton
        onConfirm={() => {
          setErrorNotFound(false);
          navigation.goBack();
        }}
      />

      {/* Modale confirmation voulez vous arrêter? */}
      <ConfirmModal
        visible={showExitPopup}
        message="Voulez-vous arrêter la méditation ?"
        onCancel={() => setShowExitPopup(false)}
        onConfirm={mode === 'solo' ? stopMeditationSolo : stopMeditation}
      />

      {/* Modale de congratulations 1 seul bouton à la fin de la méditation */}
      <ConfirmModal
        visible={showCongrats}
        message="Bravo ! Tu as terminé ta méditation"
        singleButton={true} //1 seul bouton
        onConfirm={() => {
          setShowCongrats(false);
          navigation.navigate('Shelves');
        }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    width: '100%',
    height: '100%',
  },

  playerContainer: {
    alignItems: 'center',
    gap: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
  },

  subtitle: {
    fontSize: 18,
    color: '#EEE',
  },
  // Progressbar et durée
  progressContainer: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
  },

  progressBarBackground: {
    height: 8,
    backgroundColor: '#ffffff55',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
  },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  timeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  // Meditation solo

  progressSoloContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#ffffff55',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 30,
  },
  timerSoloText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 40,
    marginBottom: 20,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressSoloBar: {
    height: '100%',
    backgroundColor: '#fff',
  },

  playPauseIcon: {
    fontSize: 42,
    color: '#507C79',
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
    backgroundColor: '#d8f0e4cc',
  },

  backButtonText: {
    color: '#224c4aff',
    fontSize: 16,
    fontWeight: '600',
  },
});
