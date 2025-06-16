import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, router } from 'expo-router';
import { colors } from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';

import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { ArrowLeft } from 'lucide-react-native';


const db = getFirestore();
const auth = getAuth();

export default function EditProfile() {
  const { currentData } = useLocalSearchParams();
  const parsedData = currentData ? JSON.parse(currentData as string) : {};

  const [formData, setFormData] = useState({
    fullName: parsedData.fullName || '',
    email: parsedData.email || '',
    contact: parsedData.contact || '',
    profileImage: parsedData.profileImage || '',
    role: parsedData.role || '',
  });

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission requise', "L'accès à la galerie est refusé");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      setFormData({ ...formData, profileImage: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    try {
      const userDocRef = doc(db, 'Users', user.uid);

      await updateDoc(userDocRef, {
        fullName: formData.fullName,
        email: formData.email,
        contact: formData.contact,
        profileImage: formData.profileImage,
        // On peut aussi mettre à jour le role ici si besoin,
        // mais souvent le role n’est pas modifiable par l’utilisateur.
      });

      Alert.alert('Succès', 'Profil mis à jour avec succès');
      router.back();
    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error);
      Alert.alert('Erreur', "La mise à jour a échoué. Veuillez réessayer.");
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Modifier le profil" />

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
  <ArrowLeft size={24} color={colors.primary} />
</TouchableOpacity>

      <View style={styles.imageSection}>
        <TouchableOpacity onPress={handleImagePick}>
          <Image
            source={
              formData.profileImage
                ? { uri: formData.profileImage }
                : require('../../assets/images/bus.png')
            }
            style={styles.profileImage}
          />
          <Text style={styles.editPhotoText}>Choisir une photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom complet</Text>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            placeholder="Votre nom"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Votre email"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact</Text>
          <TextInput
            style={styles.input}
            value={formData.contact}
            onChangeText={(text) => setFormData({ ...formData, contact: text })}
            placeholder="Numéro de téléphone"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  imageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  editPhotoText: {
    marginTop: 8,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
  position: 'absolute',
  top: 50,
  left: 20,
  zIndex: 10,
},
backText: {
  fontSize: 28,
  color: colors.primary,
},

});
