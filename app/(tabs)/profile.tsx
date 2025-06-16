import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../firebaseConfig'; // 🔁 adapte le chemin
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/constants/Colors';
import { LogOut } from 'lucide-react-native';



const Profile = ({ navigation }: any) => {
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const db = getFirestore(app);
  const auth = getAuth(app);
  const { userRole, uid, signOut } = useAuth();

  useEffect(() => {
  const fetchDriverData = async () => {
    const user = auth.currentUser;

    if (!user) {
      console.log('Utilisateur non connecté');
      setLoading(false);
      return;
    }

    try {
      // Récupérer le rôle depuis le contexte ou depuis une collection centrale "users"
      let role = userRole;

      // Si userRole n'est pas défini, on peut récupérer le rôle depuis une collection "users"
      if (!role) {
        const usersRef = collection(db, 'Users');
        const qUser = query(usersRef, where('uid', '==', user.uid));
        const userSnapshot = await getDocs(qUser);
        if (!userSnapshot.empty) {
          role = userSnapshot.docs[0].data().role;
        }
      }

      let collectionName = '';
      if (role === 'admin') {
        collectionName = 'Admins';
      } else if (role === 'parent') {
        collectionName = 'Parents';
      } else {
        collectionName = 'Users'; // Par défaut ou autres rôles
      }

      const roleRef = collection(db, collectionName);
      const q = query(roleRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setDriver(data);
      } else {
        console.log(`Aucun profil trouvé dans ${collectionName}`);
      }
    } catch (error) {
      console.error('Erreur récupération :', error);
    } finally {
      setLoading(false);
    }
  };

  fetchDriverData();
}, []);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Déconnecté', 'Vous avez été déconnecté.');
      // navigation.replace('Login');
    } catch (error) {
      console.error('Erreur de déconnexion :', error);
    }
  };

  const handleEdit = () => {
    // Redirige vers l'écran d'édition avec les infos à pré-remplir
    navigation.navigate('EditProfile', { userData: driver });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ee" style={{ flex: 1 }} />;
  }

  if (!driver) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Aucun profil trouvé.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: driver.profileImage }} style={styles.image} />
        <Text style={styles.name}>{driver.fullName}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{driver.email}</Text>
        <Text style={styles.label}>Contact</Text>
        <Text style={styles.value}>{driver.Contact}</Text>
        <Text style={styles.label}>Rôle</Text>
        <Text style={styles.value}>{driver.role}</Text>

        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editText}>✏️ Modifier les informations</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <LogOut size={20} color={colors.white} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Smart Bus v1.0.0</Text>
        </View>

      </View>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#888',
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    alignSelf: 'flex-start',
    color: '#444',
  },
  editButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  editText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  versionContainer: { alignItems: 'center', paddingVertical: 18 },
  versionText: { fontSize: 14, color: colors.textLight }
});
