import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  Pressable
  } from "react-native";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logout, updateUsername as updateUsernameAction } from "../../reducers/userConnection";
import Button from "../../components/Button";
import ConfirmModal from "../../components/ConfirmModal";
import { BACKEND_ADDRESS } from "../../config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function CompteScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const { isConnected, username, userToken } = useSelector((state) => state.userConnection);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGoodbyeModal, setShowGoodbyeModal] = useState(false);
  const [showNameChangedModal, setShowNameChangedModal] = useState(false);
  const [showAccountDeletedModal, setShowAccountDeletedModal] = useState(false);

  const handleChangeName = () => {
    setIsEditingName(true);
    setNewUsername(username);
  };

  const handleValidateNewName = () => {
    if (!newUsername.trim()) {
      alert('Le nom ne peut pas être vide');
      return;
    }

    fetch(`${BACKEND_ADDRESS}/users/updateUsername`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ token: userToken, newUsername }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          dispatch(updateUsernameAction(newUsername));
          setIsEditingName(false);
          setShowNameChangedModal(true);
        } else {
          alert(data.error || 'Impossible de modifier le nom');
        }
      })
      .catch((error) => {
        console.error('Erreur update username:', error);
        alert('Impossible de modifier le nom');
      });
  };

  const handleNameChangedConfirm = () => {
    setShowNameChangedModal(false);
  };

  const handleLogout = () => {
    setShowGoodbyeModal(true);
  };

  const confirmLogout = () => {
    // Supprimer le token de Redux
    dispatch(logout());

    // Supprimer le token d'AsyncStorage
    AsyncStorage.removeItem('userToken')
      .then(() => {
        console.log("[Logout] ✅ Token supprimé d'AsyncStorage");
      })
      .catch((error) => {
        console.error('[Logout] ❌ Erreur suppression token:', error);
      });

    setShowGoodbyeModal(false);
    navigation.navigate('Home');
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = () => {
    fetch(`${BACKEND_ADDRESS}/users/deleteUser`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          setShowDeleteModal(false);
          setShowAccountDeletedModal(true);
        } else {
          alert(data.error || 'Impossible de supprimer le compte');
        }
      })
      .catch((error) => {
        console.error('Erreur delete user:', error);
        alert('Impossible de supprimer le compte');
      });
  };

  const handleAccountDeletedConfirm = () => {
    setShowAccountDeletedModal(false);

    // Supprimer le token de Redux
    dispatch(logout());

    // Supprimer le token d'AsyncStorage
    AsyncStorage.removeItem('userToken')
      .then(() => {
        console.log("[DeleteAccount] ✅ Token supprimé d'AsyncStorage");
      })
      .catch((error) => {
        console.error('[DeleteAccount] ❌ Erreur suppression token:', error);
      });

    navigation.navigate('Home');
  };

  if (isConnected) {
    return (
      <ImageBackground
        source={require('../../assets/paysage-bienvenue.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.title}>Gestion du compte</Text>
          <Text style={styles.welcomeText}>Bonjour {username} !</Text>

          {isEditingName ? (
            <View style={styles.editNameContainer}>
              <Text style={styles.label}>Nouveau nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre nouveau nom"
                value={newUsername}
                onChangeText={setNewUsername}
                autoCapitalize="words"
              />
              <Button label="Valider" type="primary" onPress={handleValidateNewName} style={styles.button} />
              <Button label="Annuler" type="question" onPress={() => setIsEditingName(false)} style={styles.button} />
            </View>
          ) : (
            <View style={styles.buttonsContainer}>
              <Button label="Changer mon nom" type="primary" onPress={handleChangeName} style={styles.button} />

              <Button label="Me déconnecter" type="primary" onPress={handleLogout} style={styles.button} />

              <Button
                label="Supprimer mon compte"
                type="primary"
                onPress={handleDeleteAccount}
                style={[styles.button, styles.deleteButton]}
              />
            </View>
          )}

          <View style={styles.navigationContainer}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#224c4aff" />
              <Text style={styles.backButtonText}>Retour</Text>
            </Pressable>
          </View>

          <ConfirmModal
            visible={showDeleteModal}
            message="Êtes-vous sûr de vouloir supprimer votre compte ?"
            onConfirm={() => setShowDeleteModal(false)}
            onCancel={confirmDeleteAccount}
          />

          <ConfirmModal
            visible={showGoodbyeModal}
            message={`À bientôt ${username}.`}
            onConfirm={confirmLogout}
            singleButton={true}
          />

          <ConfirmModal
            visible={showNameChangedModal}
            message={`Nouveau nom : ${username}`}
            onConfirm={handleNameChangedConfirm}
            singleButton={true}
          />

          <ConfirmModal
            visible={showAccountDeletedModal}
            message="Votre compte a été supprimé"
            onConfirm={handleAccountDeletedConfirm}
            singleButton={true}
          />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/paysage-bienvenue.png')}
      style={styles.background}
      resizeMode="cover"
    >
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Gestion du compte</Text>

          <View style={styles.buttonsContainer}>
            <Button
              label="Connexion"
              type="primary"
              onPress={() => navigation.navigate('SignIn')}
              style={styles.button}
            />

            <Button
              label="Créer un compte"
              type="primary"
              onPress={() => navigation.navigate('SignUp')}
              style={styles.button}
            />
          </View>
          {/* Bouton retour */}
          <View style={styles.navigationContainer}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#224c4aff" />
              <Text style={styles.backButtonText}>Retour</Text>
            </Pressable>
          </View>
        </View>

        <Button
          type="back"
          onPress={() => navigation.navigate("Home")}
          style={[styles.backButton, { top: insets.top + 10 }]}
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
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#224C4A',
    marginBottom: 20,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#507C79',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  button: {
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: '#F28C8C',
  },
  editNameContainer: {
    flex: 1,
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#224C4A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#507C79',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#224C4A',
    marginBottom: 20,
  },

  // Retour
  navigationContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
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
    borderWidth: 1,
    borderColor: '#224c4aae',
    backgroundColor: '#fbf3ed9e',
  },
  backButtonText: {
    color: '#224c4aff',
    fontSize: 16,
    fontWeight: '600',
  },
});
