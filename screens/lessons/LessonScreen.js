import { BACKEND_ADDRESS } from '../../config';

import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';

import ConfirmModal from '../../components/ConfirmModal';
import Button from '../../components/Button';
import ParrotChatBtn from '../../components/ParrotChatBtn'; // Bouton perroquet pour chat

import { useSelector, useDispatch } from 'react-redux';

import { updateUserProgress } from '../../reducers/userConnection';

export default function LessonScreen({ navigation, route }) {
  const dispatch = useDispatch();

  const insets = useSafeAreaInsets(); //used to get screen SafeArea dimensions

  const { userToken, userProgress } = useSelector(
    (state) => state.userConnection || {}
  );

  const [contentToDisplay, setContentToDisplay] = useState('lesson');
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizQuestionChoice, setQuizQuestionChoice] = useState([]);

  const [showExitPopup, setShowExitPopup] = useState(false); // popup sortie
  const [exitBehavior, setExitBehavior] = useState();
  const [showSignupModal, setShowSignupModal] = useState(false); // popup inscription

  const chapters = useSelector((state) => state.chapters);

  // Use React navigation parameters. Default to 0 if route parameter not specified
  const chapterIndex = route?.params?.lessonNumber ?? 0;
  const chapter = chapters[chapterIndex] ? chapters[chapterIndex] : chapters[0];

  function DisplayContent(type) {
    const isFlashcard = type === 'flashcard';
    const title = isFlashcard ? chapter.flashcard.title : chapter.title;
    const logo = chapter.logo;
    const contentArray = isFlashcard
      ? [
          chapter.flashcard.definition,
          chapter.flashcard.why,
          chapter.flashcard.keyConcept,
          chapter.flashcard.exemple,
          chapter.flashcard.exercice,
        ]
      : [chapter.content];

    return (
      <>
        <View style={styles.title}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.titleLogo}>{logo}</Text>
        </View>
        <View style={styles.scrollContainer}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {contentArray.map((text, i) => (
              <Text style={styles.contentText} key={i}>
                {text}
              </Text>
            ))}
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

  function DisplayQuiz() {
    function handleQuestionChoice(qIndex, choice) {
      const updatedChoices = [...quizQuestionChoice];
      updatedChoices[qIndex] = choice;
      setQuizQuestionChoice(updatedChoices);
      updatedChoices.length >= chapter.quiz.questions.length
        ? setContentToDisplay('quizResult')
        : setQuizQuestionIndex(quizQuestionIndex + 1);
    }

    const quizButtons = chapter.quiz.questions[quizQuestionIndex].answers.map((e, i) => {
      return <Button key={i} onPress={() => handleQuestionChoice(quizQuestionIndex, i)} type="question" label={e} />;
    });

    return (
      <>
        <View style={styles.title}>
          <Text style={styles.titleQuestion}>{chapter.quiz.questions[quizQuestionIndex].question}</Text>
        </View>
        <View style={styles.questionContainer}>{quizButtons}</View>
      </>
    );
  }

  function DisplayQuizResult() {
    function findMode(arr) {
      const counts = {};
      for (const element of arr) {
        counts[element] = (counts[element] || 0) + 1;
      }

      // create an object with frequency of answer selection
      const counts2 = arr.reduce((acc, val) => ((acc[val] = (acc[val] || 0) + 1), acc), {});

      // get the most frequent value of each key
      const maxFrequency = Math.max(...Object.values(counts));

      // return the objects with the most frequency
      const modes = Object.keys(counts)
        .filter((element) => counts[element] === maxFrequency)
        .map((element) => parseInt(element));

      // Return 1 if there is no clear mode (aka a tie)
      return modes.length === 1 ? modes[0] : 1;
    }

    const result = chapter.quiz.results[findMode(quizQuestionChoice)];

    return (
      <>
        <View style={styles.title}>
          <Text style={styles.titleText}>Resultat du quiz</Text>
        </View>
        <Text style={styles.contentText}>{result}</Text>
      </>
    );
  }

  async function handleNextButton() {
    switch (contentToDisplay) {
      case 'lesson':
        setContentToDisplay('quiz');
        break;
      case 'quizResult':
        setContentToDisplay('flashcard');
        break;
      case 'flashcard':
        if (userProgress === 0 && chapter.index === 1 && !userToken) {
          setShowSignupModal(true);
          return;
        }

        if (userToken) {
          try {
            const response = await fetch(`${BACKEND_ADDRESS}/users/progress`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`,
              },
              body: JSON.stringify({
                progressNb: chapter.index,
              }),
            });
            const data = await response.json();
            if (data.result) {
              dispatch(updateUserProgress(chapter.index));
              console.log('progressNb updated to:', chapter.index);
            } else {
              console.log('Error updating progressNb:', data.error);
            }
          } catch (error) {
            console.log('Fetch error updating progressNb:', error);
          }
        }
        navigation.goBack();
        break;
    }
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
      <View style={[styles.contentContainer, { marginTop: Math.max(insets.top + 120, 20) }]}>
        {(() => {
          switch (contentToDisplay) {
            case 'lesson':
              return DisplayContent('lesson');
            case 'quiz':
              return DisplayQuiz();
            case 'quizResult':
              return DisplayQuizResult();
            case 'flashcard':
              return DisplayContent('flashcard');
          }
        })()}
      </View>

      {/* buttonContainer: marginBottom dynamic en fonction de l'inset.bottom */}
      <View style={[styles.buttonContainer, { marginBottom: 20 + insets.bottom }]}>
        <Button
          style={{ width: 110 }}
          onPress={() => {
            setExitBehavior(() => () => navigation.goBack());
            setShowExitPopup(true);
          }}
          type="primary"
          label="Quitter"
        />
        {contentToDisplay !== 'quiz' ? (
          <Button style={{ width: 110 }} onPress={() => handleNextButton()} type="primary" label="Suivant" />
        ) : (
          <Button style={{ backgroundColor: '', width: 110 }} />
        )}
      </View>

      <ConfirmModal
        visible={showExitPopup}
        message="Voulez-vous quitter la leçon ?"
        onCancel={() => setShowExitPopup(false)}
        onConfirm={() => exitBehavior()}
        confirmText="Quitter"
        cancelText="Rester"
      />

      <ConfirmModal
        visible={showSignupModal}
        message="Vous avez terminé le premier chapitre ! Inscrivez-vous pour continuer l'aventure : "
        onConfirm={() => {
          setShowSignupModal(false);
          navigation.navigate('SignUp', { initialProgressNb: 1 });
        }}
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
  // style for Quiz inside of contentContainer
  titleQuestion: {
    fontSize: 18,
    fontWeight: '600',
  },
  questionContainer: {
    fontSize: 14,
    lineHeight: 28,
  },
});
