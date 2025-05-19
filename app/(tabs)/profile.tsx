
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/constants/colors';
import {
  LogOut, Bell, Shield, CircleHelp as HelpCircle, FileText, ChevronRight, MapPin
} from 'lucide-react-native';
import ScreenHeader from '@/components/ScreenHeader';
import { db } from '../../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { router } from 'expo-router';

function calculateAge(birthDateStr: string): number {
  const [day, month, year] = birthDateStr.split('/').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

type Child = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;
  photoUrl?: string;
};

export default function ProfileScreen() {
  const { userRole, uid, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [userData, setUserData] = useState<{ nom: string }>({ nom: '' });
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const getUserRoleTitle = () => {
    switch (userRole) {
      case 'parent': return 'Parent';
      case 'driver': return 'Bus Driver';
      case 'admin': return 'Administrator';
      case 'student': return 'Student';
      default: return 'User';
    }
  };

  const fetchUserData = async () => {
    try {
      // Make sure we're using the correct collection - parents collection
      const userRef = doc(db, 'parents', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData({ nom: data.nom || data.Name || '' }); // Handle both 'nom' and 'Name' fields
      } else {
        console.warn('Utilisateur non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur :', error);
      Alert.alert('Erreur', 'Impossible de charger les informations utilisateur.');
    }
  };

  const fetchChildren = async () => {
    if (!uid) {
      console.warn('ID utilisateur non disponible');
      return;
    }

    try {
      console.log('Fetching children for parent ID:', uid); // Debug log
      
      const childrenRef = collection(db, 'students');
      const q = query(childrenRef, where('parentId', '==', uid));
      const querySnapshot = await getDocs(q);

      console.log('Query results:', querySnapshot.size); // Debug log
      
      const loadedChildren: Child[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedChildren.push({
          id: docSnap.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          birthDate: data.birthDate || '',
          age: data.birthDate ? calculateAge(data.birthDate) : 0,
          photoUrl: data.photoUrl || '',
        });
      });

      console.log('Loaded children:', loadedChildren.length); // Debug log
      setChildren(loadedChildren);
    } catch (error) {
      console.error('Erreur lors du chargement des enfants :', error);
      Alert.alert("Erreur", "Impossible de charger les enfants.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchUserData();
        if (userRole === 'parent') {
          await fetchChildren();
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (uid) {
      loadData();
    }
  }, [uid, userRole]);

  const handleAddChild = () => {
    router.push('/AddChild');
  };

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
          <Image source={require('../../assets/images/imgprofile.png')} style={styles.profileImage} />
          <Text style={styles.profileName}>{userData.nom}</Text>
          <Text style={styles.profileRole}>{getUserRoleTitle()}</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {userRole === 'parent' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mes enfants</Text>
            {children.length === 0 ? (
              <Text style={styles.noChildText}>Aucun enfant ajouté.</Text>
            ) : (
              children.map((child) => (
                <View key={child.id} style={styles.childItem}>
                  <View style={styles.childHeader}>
                    {child.photoUrl ? (
                      <Image source={{ uri: child.photoUrl }} style={styles.childImage} />
                    ) : (
                      <View style={styles.childImagePlaceholder}>
                        <Text style={styles.childImageInitial}>{child.firstName ? child.firstName[0] : '?'}</Text>
                      </View>
                    )}
                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{child.firstName} {child.lastName}</Text>
                      <Text style={styles.childAge}>Âge : {child.age} ans</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
            <TouchableOpacity style={styles.addChildButton} onPress={handleAddChild}>
              <Text style={styles.addChildText}>+ Ajouter un enfant</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Bell size={20} color={colors.primary} />
              </View>
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textLight}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <Text style={styles.settingText}>Localisation</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={locationEnabled ? colors.primary : colors.textLight}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Shield size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuText}>Confidentialité</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <HelpCircle size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuText}>Aide</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <FileText size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuText}>Conditions</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={signOut}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.errorLight }]}>
                <LogOut size={20} color={colors.error} />
              </View>
              <Text style={[styles.menuText, { color: colors.error }]}>Se déconnecter</Text>
            </View>
          </TouchableOpacity>
        </View>

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
  profileHeader: { alignItems: 'center', paddingTop: 24, paddingBottom: 32, borderBottomWidth: 1, borderBottomColor: colors.border },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  profileName: { fontSize: 24, fontWeight: '600', color: colors.textDark },
  profileRole: { fontSize: 16, color: colors.textLight },
  editProfileButton: { marginTop: 12, backgroundColor: colors.primaryLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  editProfileButtonText: { color: colors.primary },
  section: { paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: colors.textDark },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  settingText: { fontSize: 16, color: colors.textDark },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuText: { fontSize: 16, color: colors.textDark },
  logoutItem: { marginTop: 8 },
  versionContainer: { alignItems: 'center', paddingVertical: 16 },
  versionText: { fontSize: 14, color: colors.textLight },
  childItem: { 
    marginBottom: 16, 
    backgroundColor: '#FFF', 
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childImage: { 
    width: 50, 
    height: 50, 
    borderRadius: 25,
    marginRight: 12,
  },
  childImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childImageInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  childInfo: {
    flex: 1,
  },
  childName: { fontSize: 16, fontWeight: '500', color: colors.textDark },
  childAge: { fontSize: 14, color: colors.textLight },
  noChildText: { color: colors.textLight },
  addChildButton: { 
    marginTop: 12,
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addChildText: { color: colors.primary, fontWeight: '600' }
});