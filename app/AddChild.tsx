import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  setDoc,
} from 'firebase/firestore';
import { app } from '@/firebaseConfig';

const AddChild = () => {
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState<Date>(new Date()); // Initialize with current date
  const [showPicker, setShowPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios'); // Hide picker on Android after selection
    if (event.type === 'set' && selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir les champs prénom et nom');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    setIsSubmitting(true);

    try {
      // Add child to Students collection
      const childRef = await addDoc(collection(db, 'Students'), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate: birthDate.toISOString().split('T')[0], // Format YYYY-MM-DD
        parentId: user.uid,
        createdAt: new Date().toISOString(),
      });

      // Update or create parent document in Parents collection
      const parentRef = doc(db, 'Parents', user.uid);
      await setDoc(
        parentRef,
        {
          children: arrayUnion(childRef.id),
          updatedAt: new Date().toISOString(),
        },
        { merge: true } // Merge to avoid overwriting existing data
      );

      Alert.alert('Succès', "L'enfant a été ajouté avec succès");
      // Reset form
      setFirstName('');
      setLastName('');
      setBirthDate(new Date());
      router.back();
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
      Alert.alert('Erreur', "Une erreur est survenue lors de l'ajout");
    } finally {
      setIsSubmitting(false);
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
        placeholderTextColor="#999"
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={lastName}
        onChangeText={setLastName}
        placeholderTextColor="#999"
        autoCapitalize="words"
      />

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.dateInput}
      >
        <Text style={{ color: birthDate ? '#000' : '#999' }}>
          {formatDate(birthDate)}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        style={[styles.button, isSubmitting && styles.disabledButton]}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddChild;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F4F6FA',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    justifyContent: 'center',
    height: 50,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#A0C4FF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});