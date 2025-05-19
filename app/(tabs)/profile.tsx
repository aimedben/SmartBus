import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/constants/colors';
import { LogOut } from 'lucide-react-native';
import ScreenHeader from '@/components/ScreenHeader';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { userRole, uid, signOut } = useAuth();
  const [userData, setUserData] = useState({
    nom: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);

  const getUserRoleTitle = () => {
    switch (userRole) {
      case 'parent': return 'Parent';
      case 'driver': return 'Chauffeur';
      case 'admin': return 'Administrateur';
      case 'student': return 'Étudiant';
      default: return 'Utilisateur';
    }
  };

  const fetchUserData = async () => {
    try {
      if (!uid) {
        console.warn('UID manquant, impossible de récupérer les données utilisateur.');
        return;
      }

      const userRef = doc(db, 'parents', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        console.log('Données utilisateur récupérées :', data);
        setUserData({
          nom: data.fullName || '',
          email: data.email || '',
          phone: data.contact || ''
        });
      } else {
        console.warn(`Aucun utilisateur trouvé avec l'UID : ${uid}`);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
      Alert.alert('Erreur', 'Impossible de récupérer les informations du profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (updatedData: any) => {
    try {
      if (!uid) return;
      const userRef = doc(db, 'Users', uid);
      await updateDoc(userRef, updatedData);
      setUserData(prev => ({ ...prev, ...updatedData }));
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error);
      Alert.alert('Erreur', 'Échec de la mise à jour du profil');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [uid]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profil" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <Image 
            source={require('../../assets/images/imgprofile.png')} 
            style={styles.profileImage} 
          />
          <Text style={styles.profileName}>{userData.nom || 'Utilisateur'}</Text>
          <Text style={styles.profileRole}>{getUserRoleTitle()}</Text>

          <TouchableOpacity 
            style={styles.editProfileButton} 
            onPress={() => router.push({
              pathname: '/EditProfile',
              params: {
                currentData: JSON.stringify(userData),
                onSave: handleSaveProfile
              }
            })}
          >
            <Text style={styles.editProfileButtonText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email :</Text>
            <Text style={styles.infoValue}>{userData.email || 'Non renseigné'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Téléphone :</Text>
            <Text style={styles.infoValue}>{userData.phone || 'Non renseigné'}</Text>
          </View>
        </View>

        {userRole === 'parent' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/childs')}
            >
              <Text style={styles.actionButtonText}>Voir mes enfants</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/AddChild')}
            >
              <Text style={styles.actionButtonText}>Ajouter un enfant</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Smart Bus v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: { alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: colors.border },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  profileName: { fontSize: 24, fontWeight: '600', color: colors.textDark },
  profileRole: { fontSize: 16, color: colors.textLight, marginBottom: 12 },
  editProfileButton: { backgroundColor: colors.primaryLight, padding: 12, borderRadius: 8, marginTop: 8 },
  editProfileButtonText: { color: colors.primary, fontWeight: '600' },
  infoContainer: { padding: 20 },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { fontWeight: '600', color: colors.textDark },
  infoValue: { color: colors.textLight },
  actionsContainer: { paddingHorizontal: 20, marginTop: 10 },
  actionButton: { backgroundColor: colors.primaryLight, padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  actionButtonText: { color: colors.primary, fontWeight: '600' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, margin: 20, borderWidth: 1, borderColor: colors.errorLight, borderRadius: 8 },
  logoutText: { color: colors.error, marginLeft: 10, fontWeight: '600' },
  versionContainer: { alignItems: 'center', paddingVertical: 16 },
  versionText: { fontSize: 14, color: colors.textLight }
});
