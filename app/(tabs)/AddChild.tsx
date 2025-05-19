import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { app } from '@/firebaseConfig'; // ajuste ce chemin selon ton projet

const AddChild = () => {
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const handleSubmit = async () => {
    if (!firstName || !lastName || !birthDate) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    try {
      // Ajouter l'enfant dans "students"
      const childRef = await addDoc(collection(db, 'students'), {
        firstName,
        lastName,
        birthDate,
        parentId: user.uid,
      });

      // Mettre à jour le parent dans "parents"
      const parentRef = doc(db, 'parents', user.uid);
await setDoc(parentRef, {
  children: arrayUnion(childRef.id),
}, { merge: true });


      Alert.alert('Succès', 'L\'enfant a été ajouté avec succès');
      router.back();
    } catch (error) {
      console.error('Erreur lors de l\'ajout :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un enfant</Text>

      <TextInput
        style={styles.input}
        placeholder="Prénom"
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={lastName}
        onChangeText={setLastName}
      />

      <TextInput
        style={styles.input}
        placeholder="Date de naissance (JJ/MM/AAAA)"
        value={birthDate}
        onChangeText={setBirthDate}
      />

      <View style={styles.button}>
        <Button title="Ajouter" onPress={handleSubmit} />
      </View>
    </View>
  );
};

export default AddChild;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  button: {
    marginTop: 16,
  },
});
