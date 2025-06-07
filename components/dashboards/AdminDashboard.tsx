import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import {
  Users,
  Bus,
  UserCog,
  ClipboardList,
  Plus,
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { getAuth } from 'firebase/auth';
import DashboardHeader from '@/components/DashboardHeader';

const AdminDashboard: React.FC = () => {
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const fetchAdminName = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        try {
          const q = query(collection(db, 'Users'), where('uid', '==', user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data();
            setAdminName(docData.fullName);
          } else {
            console.warn('Utilisateur non trouvé dans Firestore.');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du nom :', error);
        }
      }
    };

    fetchAdminName();
  }, []);

  const handleAddDriver = async () => {
    try {
      if (!name || !email || !contact || !location) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
        return;
      }

      await addDoc(collection(db, 'Drivers'), {
        fullName: name,
        email,
        contact,
        location,
        role: 'driver',
        createdAt: new Date(),
      });

      Alert.alert('Succès', 'Chauffeur ajouté avec succès.');
      setShowAddDriverModal(false);
      setName('');
      setEmail('');
      setContact('');
      setLocation('');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <DashboardHeader userName={adminName || 'Admin'} userRole="admin" />

      {/* <Text style={styles.title}>Admin Dashboard</Text> */}

      <View style={styles.grid}>
        <DashboardCard icon={<Users size={28} color={colors.primary} />} label="Users" count="134" />
        <DashboardCard icon={<Bus size={28} color={colors.success} />} label="Buses" count="12" />
        <DashboardCard icon={<ClipboardList size={28} color={colors.warning} />} label="Trips" count="45" />
        <DashboardCard icon={<UserCog size={28} color={colors.secondary} />} label="Drivers" count="7" />
      </View>

      <Text style={styles.subtitle}>Quick Actions</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Plus size={20} color={colors.white} />
          <Text style={styles.actionText}>Add User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowAddDriverModal(true)}
        >
          <Plus size={20} color={colors.white} />
          <Text style={styles.actionText}>Add Driver</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Plus size={20} color={colors.white} />
          <Text style={styles.actionText}>Create Trip</Text>
        </TouchableOpacity>
      </View>

      {/* Modal pour ajouter un chauffeur */}
      <Modal visible={showAddDriverModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Ajouter un chauffeur</Text>

            <TextInput
              placeholder="Nom complet"
              value={name}
              onChangeText={setName}
              style={styles.input}
              autoCapitalize="words"
            />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              placeholder="Contact"
              value={contact}
              onChangeText={setContact}
              style={styles.input}
              keyboardType="phone-pad"
            />
            <TextInput
              placeholder="Localisation"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
            />

            <Button title="Ajouter" onPress={handleAddDriver} />
            <Button title="Annuler" onPress={() => setShowAddDriverModal(false)} color="gray" />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AdminDashboard;

const DashboardCard = ({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: string;
}) => (
  <View style={styles.card}>
    {icon}
    <Text style={styles.cardCount}>{count}</Text>
    <Text style={styles.cardLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    color: colors.textDark,
    marginBottom: 16,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  card: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
  },
  cardCount: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textDark,
    marginVertical: 8,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.textLight,
  },
  subtitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.textDark,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  actions: {
    paddingHorizontal: 16,
    flexDirection: 'column',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  actionText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  })
 
