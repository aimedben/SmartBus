import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors } from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
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
    role: parsedData.role || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Récupérer les données de l'utilisateur
          const userDocRef = doc(db, 'Users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            
            // Déterminer la collection du rôle
            let roleCollection = '';
            if (userData.role === 'parent') roleCollection = 'Parents';
            else if (userData.role === 'driver') roleCollection = 'Drivers';
            else if (userData.role === 'admin') roleCollection = 'Admins';
            
            // Récupérer les données du rôle si elles existent
            let roleData = {};
            if (roleCollection) {
              const roleDocRef = doc(db, roleCollection, user.uid);
              const roleDocSnap = await getDoc(roleDocRef);
              if (roleDocSnap.exists()) {
                roleData = roleDocSnap.data();
              }
            }

            setFormData({
              role: userData.role || '',
              fullName: userData.fullName || roleData.fullName || '',
              email: userData.email || roleData.email || '',
              contact: userData.contact || roleData.contact || '',
            });
          }
        } catch (error) {
          console.error('Erreur:', error);
          Alert.alert('Erreur', 'Impossible de charger les données');
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }

    const user = auth.currentUser;
    if (!user?.uid) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    if (!formData.role) {
      Alert.alert('Erreur', 'Rôle non défini');
      return;
    }

    setIsSaving(true);

    try {
      const updateData = {
        fullName: formData.fullName,
        contact: formData.contact,
        updatedAt: new Date().toISOString(),
      };

      // 1. Mise à jour dans la collection Users
      const userDocRef = doc(db, 'Users', user.uid);
      await updateDoc(userDocRef, updateData);

      // 2. Déterminer la collection du rôle
      let roleCollection = '';
      if (formData.role === 'parent') roleCollection = 'Parents';
      else if (formData.role === 'driver') roleCollection = 'Drivers';
      else if (formData.role === 'admin') roleCollection = 'Admins';

      // 3. Mise à jour dans la collection du rôle
      if (roleCollection) {
        const roleDocRef = doc(db, roleCollection, user.uid);
        await updateDoc(roleDocRef, updateData);
      }

      Alert.alert('Succès', 'Profil mis à jour');
      router.back();
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
      Alert.alert('Erreur', 'Échec de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Modifier le profil" />

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft size={24} color={colors.primary} />
      </TouchableOpacity>

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
            style={[styles.input, styles.disabledInput]}
            value={formData.email}
            editable={false}
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

        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.disabledButton]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  formContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
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
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#888',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    backgroundColor: '#ccc',
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
});