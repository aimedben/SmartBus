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
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Users, Bus, UserCog, ClipboardList, Plus, Eye, Trash2, Edit } from 'lucide-react-native';
import { colors } from '@/constants/Colors';
import { 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  updateDoc 
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import DashboardHeader from '@/components/DashboardHeader';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

interface Driver {
  uid: string;
  fullName: string;
  email: string;
  contact: string;
  role: string;
  createdAt: any;
  expoPushToken?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showDriverListModal, setShowDriverListModal] = useState(false);
  const [showEditDriverModal, setShowEditDriverModal] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    buses: 0,
    trips: 0,
    drivers: 0
  });

  useEffect(() => {
    fetchAdminName();
    fetchStats();
  }, []);

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
        }
      } catch (error) {
        console.error('Error fetching admin name:', error);
      }
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch drivers count
      const driversQuery = query(collection(db, 'Drivers'));
      const driversSnapshot = await getDocs(driversQuery);
      
      // Fetch users count
      const usersQuery = query(collection(db, 'Users'));
      const usersSnapshot = await getDocs(usersQuery);

      setStats({
        users: usersSnapshot.size,
        buses: 12, // Static for now, you can make this dynamic
        trips: 45, // Static for now, you can make this dynamic
        drivers: driversSnapshot.size
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'Drivers'));
      const querySnapshot = await getDocs(q);
      const driversData: Driver[] = [];
      
      querySnapshot.forEach((doc) => {
        driversData.push({ uid: doc.id, ...doc.data() } as Driver);
      });
      
      setDrivers(driversData);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      Alert.alert('Error', 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = async () => {
    // Validation
    if (!name || !email || !contact || !password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();

      // Create authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Request permissions
      const [notificationPermission, locationPermission] = await Promise.all([
        Notifications.requestPermissionsAsync(),
        Location.requestForegroundPermissionsAsync()
      ]);

      // Prepare driver data
      const driverData: any = {
        uid: user.uid,
        fullName: name,
        email,
        contact,
        role: 'driver',
        createdAt: new Date()
      };

      // Add optional data if permissions granted
      if (notificationPermission.status === 'granted') {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        driverData.expoPushToken = tokenData.data;
      }

      if (locationPermission.status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        driverData.location = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
      }

      // Write to Firestore
      await Promise.all([
        setDoc(doc(db, 'Users', user.uid), driverData),
        setDoc(doc(db, 'Drivers', user.uid), driverData)
      ]);

      Alert.alert('Success', 'Driver added successfully');
      resetForm();
      setShowAddDriverModal(false);
      fetchStats(); // Refresh stats
    } catch (error: any) {
      console.error("Complete error:", error);
      
      let errorMessage = "An error occurred";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email is already in use";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email";
          break;
        case 'auth/weak-password':
          errorMessage = "Password too weak";
          break;
        case 'permission-denied':
          errorMessage = "Insufficient permissions";
          break;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDriver = async () => {
    if (!selectedDriver || !name || !email || !contact) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const updatedData = {
        fullName: name,
        email,
        contact,
        updatedAt: new Date()
      };

      // Update in both collections
      await Promise.all([
        updateDoc(doc(db, 'Users', selectedDriver.uid), updatedData),
        updateDoc(doc(db, 'Drivers', selectedDriver.uid), updatedData)
      ]);

      Alert.alert('Success', 'Driver updated successfully');
      resetForm();
      setShowEditDriverModal(false);
      fetchDrivers(); // Refresh drivers list
    } catch (error) {
      console.error('Error updating driver:', error);
      Alert.alert('Error', 'Failed to update driver');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDriver = (driver: Driver) => {
    Alert.alert(
      'Delete Driver',
      `Are you sure you want to delete ${driver.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Delete from both collections
              await Promise.all([
                deleteDoc(doc(db, 'Users', driver.uid)),
                deleteDoc(doc(db, 'Drivers', driver.uid))
              ]);
              
              Alert.alert('Success', 'Driver deleted successfully');
              fetchDrivers(); // Refresh drivers list
              fetchStats(); // Refresh stats
            } catch (error) {
              console.error('Error deleting driver:', error);
              Alert.alert('Error', 'Failed to delete driver');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const openEditModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setName(driver.fullName);
    setEmail(driver.email);
    setContact(driver.contact);
    setShowEditDriverModal(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setContact('');
    setPassword('');
    setSelectedDriver(null);
  };

  const renderDriverItem = ({ item }: { item: Driver }) => (
    <View style={styles.driverItem}>
      <View style={styles.driverInfo}>
        <Text style={styles.driverName}>{item.fullName}</Text>
        <Text style={styles.driverEmail}>{item.email}</Text>
        <Text style={styles.driverContact}>{item.contact}</Text>
      </View>
      <View style={styles.driverActions}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.editBtn]} 
          onPress={() => openEditModal(item)}
        >
          <Edit size={16} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]} 
          onPress={() => handleDeleteDriver(item)}
        >
          <Trash2 size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <DashboardHeader userName={adminName || 'Admin'} userRole="admin" />

      <View style={styles.grid}>
        <DashboardCard 
          icon={<Users size={28} color={colors.primary} />} 
          label="Users" 
          count={stats.users.toString()} 
        />
        <DashboardCard 
          icon={<Bus size={28} color={colors.success} />} 
          label="Buses" 
          count={stats.buses.toString()} 
        />
        <DashboardCard 
          icon={<ClipboardList size={28} color={colors.warning} />} 
          label="Trips" 
          count={stats.trips.toString()} 
        />
        <DashboardCard 
          icon={<UserCog size={28} color={colors.secondary} />} 
          label="Drivers" 
          count={stats.drivers.toString()} 
        />
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

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            fetchDrivers();
            setShowDriverListModal(true);
          }}
        >
          <Eye size={20} color={colors.white} />
          <Text style={styles.actionText}>View Drivers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Plus size={20} color={colors.white} />
          <Text style={styles.actionText}>Create Trip</Text>
        </TouchableOpacity>
      </View>

      {/* Add Driver Modal */}
      <Modal visible={showAddDriverModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Driver</Text>

            <TextInput
              placeholder="Full Name"
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
              placeholder="Password (min 6 characters)"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
            />

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    resetForm();
                    setShowAddDriverModal(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.addButton]}
                  onPress={handleAddDriver}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Driver Modal */}
      <Modal visible={showEditDriverModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Driver</Text>

            <TextInput
              placeholder="Full Name"
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

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    resetForm();
                    setShowEditDriverModal(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.addButton]}
                  onPress={handleEditDriver}
                >
                  <Text style={styles.addButtonText}>Update</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Drivers List Modal */}
      <Modal visible={showDriverListModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.listModalContainer]}>
            <Text style={styles.modalTitle}>Drivers List</Text>
            
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <FlatList
                data={drivers}
                renderItem={renderDriverItem}
                keyExtractor={(item) => item.uid}
                style={styles.driversList}
                showsVerticalScrollIndicator={false}
              />
            )}
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton, { marginTop: 16 }]}
              onPress={() => setShowDriverListModal(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
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
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  listModalContainer: {
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 12,
    textAlign: 'center',
    color: colors.textDark,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.textDark,
    fontFamily: 'Poppins-Medium',
  },
  addButtonText: {
    color: colors.white,
    fontFamily: 'Poppins-Medium',
  },
  driversList: {
    maxHeight: 400,
  },
  driverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textDark,
  },
  driverEmail: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.textLight,
  },
  driverContact: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: colors.textLight,
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 6,
  },
  editBtn: {
    backgroundColor: colors.primary,
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
  },
});