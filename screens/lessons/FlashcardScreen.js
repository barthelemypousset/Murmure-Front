import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';

import ParrotChatBtn from '../../components/ParrotChatBtn'; // Bouton perroquet pour chat
import ConfirmModal from '../../components/ConfirmModal';
import Button from '../../components/Button';
import { useSelector } from 'react-redux';

export default function FlashcardScreen({ navigation }) {
  const insets = useSafeAreaInsets(); //used to get screen SafeArea dimensions

  const { userToken, userProgress } = useSelector((state) => state.userConnection || {});
  const chapters = useSelector((state) => state.chapters);

  const [contentToDisplay, setContentToDisplay] = useState('list');
  const [chapterIndex, setChapterIndex] = useState(0);

  const [showFlashcardLockedModal, setShowFlashcardLockedModal] = useState(false);

  function DisplayList() {
    const flashcardButtons = chapters.map((chap, i) => {
      {
        if (i <= userProgress - 1) {
          return (
            <Button
              key={i}
              onPress={() => {
                setChapterIndex(i);
                setContentToDisplay('flashcard');
              }}
              type="question"
              label={chap.title}
              style={{ alignItems: 'flexStart' }}
            />
          );
        } else {
          return (
            <Button
              disabled
              key={i}
              type="question"
              label={chap.title}
              onPress={() => {
                setShowFlashcardLockedModal(true);
              }}
              style={{ backgroundColor: '#739C9A', alignItems: 'flexStart' }}
            />
          );
        }
      }
    });

    return (
      <>
        <View style={styles.title}>
          <Text style={styles.titleList}>Flashcards 📖</Text>
        </View>
        <View style={styles.listContainer}>{flashcardButtons}</View>
      </>
    );
  }

  function DisplayFlashcard() {
    const chapter = chapters[chapterIndex];
    return (
      <>
        <View style={styles.title}>
          <Text style={styles.titleText}>{chapter.flashcard.title}</Text>
          <Text style={styles.titleLogo}>{chapter.logo}</Text>
        </View>
        <View style={styles.scrollContainer}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.contentText}>
              {chapter.flashcard.definition}
              {chapter.flashcard.why}
              {chapter.flashcard.keyConcept}
              {chapter.flashcard.exemple}
              {chapter.flashcard.exercice}
            </Text>
          </ScrollView>

          {/* Masque de dégradé Top */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)']}
            style={styles.maskTop}
            pointerEvents="none" // Important pour permettre de scroller en dessous du masque
          />

          {/* Masque de dégradé Bottom */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']}
            style={styles.maskBottom}
            pointerEvents="none" // Important pour permettre de scroller en dessous du masque
          />
        </View>
      </>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Coco */}
      <ParrotChatBtn
        onPress={() => {
          navigation.navigate('Chat');
        }}
        size={130}
        style={[
          styles.coco,
          {
            transform: [{ scaleX: -1 }],
            top: Math.max(insets.top, 20),
          },
        ]}
      />

      {/* contentContainer: Top + marginTop dynamic en fonction de l'inset.top */}
      <View style={[styles.contentContainer, { marginTop: Math.max(insets.top + 120, 140) }]}>
        {(() => {
          switch (contentToDisplay) {
            case 'list':
              return DisplayList();
            case 'flashcard':
              return DisplayFlashcard();
          }
        })()}
      </View>

      {/* buttonContainer: marginBottom dynamic en fonction de l'inset.bottom */}
      <View style={[styles.buttonContainer, { marginBottom: 20 + insets.bottom }]}>
        {contentToDisplay === 'list' ? (
          <Button style={{ width: 110 }} onPress={() => navigation.goBack()} type="primary" label="Quitter" />
        ) : (
          <Button style={{ width: 110 }} onPress={() => setContentToDisplay('list')} type="primary" label="Retour" />
        )}

        <Button style={{ backgroundColor: '', width: 110 }} />
      </View>

      <ConfirmModal
        visible={showFlashcardLockedModal}
        message={`Vous n'avez pas encore debloquée cette flashcard`}
        onConfirm={() => setShowFlashcardLockedModal(false)}
        singleButton={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // style for the global screen, coco positioning, contentContainer, buttons
  mainContainer: {
    flex: 1,
    backgroundColor: '#CFE5CF',
    position: 'relative', //needed for "coco position:absolute" to work
  },
  coco: {
    position: 'absolute', //needed to put coco where we want in the main container. Defaut position behavior top: 0
    right: '10%', //place it 10% to the right of the screen
    zIndex: 2, // This define the priority of the image (2 > 1 so image is in front of contentContainer)
  },
  contentContainer: {
    flex: 1, // Donne tout la hauteur restante au contenu (apres le marginTop ici et le margin du buttonContainer )
    marginTop: 140,
    marginBottom: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    padding: 20,
    zIndex: 1,
  },
  buttonContainer: {
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  // style for Lesson/Result/Flashcard inside of contentContainer
  title: {
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '600',
  },
  titleLogo: {
    fontSize: 34,
  },
  contentText: {
    fontSize: 18,
    color: '#666',
    lineHeight: 28,
  },
  scrollContainer: {
    flex: 1,
    position: 'relative', // Nécessaire pour positionner les masques en absolu
  },
  scrollContent: {
    paddingTop: 20, // Donne un peu d'espace en haut et en bas du contenu
    paddingBottom: 30, // Donne un peu d'espace en haut et en bas du contenu
  },
  maskTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30, // Hauteur du dégradé (à ajuster)
    zIndex: 1, // S'assure qu'il est au-dessus du contenu
  },
  maskBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30, // Hauteur du dégradé (peut être différente)
    zIndex: 1,
  },
  // style for List inside of contentContainer
  titleList: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContainer: {
    fontSize: 14,
    lineHeight: 28,
  },
});
