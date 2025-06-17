import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Share,
} from 'react-native';
import { colors } from '@/constants/Colors';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useRouter } from 'expo-router';
import { app } from '@/firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  parentName: string;
  photoUrl?: string;
  parentId: string;
}

const ParentDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);

  const db = getFirestore(app);
  const auth = getAuth(app);
  const user = auth.currentUser;
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchChildren = async () => {
        if (!user) {
          console.warn('Aucun utilisateur connecté.');
          setLoading(false);
          return;
        }

        setLoading(true);

        try {
          const childrenRef = collection(db, 'Students');
          const q = query(childrenRef, where('parentId', '==', user.uid));
          const querySnapshot = await getDocs(q);

          const kids: Student[] = [];

          for (const docSnap of querySnapshot.docs) {
            const childData = docSnap.data();
            const parentRef = doc(db, 'Parents', childData.parentId);
            const parentSnap = await getDoc(parentRef);

            kids.push({
              id: docSnap.id,
              ...childData,
              parentName: parentSnap.exists()
                ? parentSnap.data().fullName || 'Inconnu'
                : 'Inconnu',
            } as Student);
          }

          setStudents(kids);
        } catch (error) {
          console.error('Erreur lors de la récupération des enfants :', error);
        } finally {
          setLoading(false);
        }
      };

      fetchChildren();
    }, [user])
  );

  const handleShareQRCode = async () => {
    if (!selectedChild) return;

    try {
      const message = `ID: ${selectedChild.id}\nNom: ${selectedChild.firstName} ${selectedChild.lastName}\nParent: ${selectedChild.parentName}`;
      await Share.share({ message });
    } catch (error) {
      console.error('Erreur lors du partage :', error);
    }
  };

  const handleImagePick = async (child: Student) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', 'Autorisez l\'accès à la galerie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;

      try {
        const childRef = doc(db, 'Students', child.id);
        await updateDoc(childRef, { photoUrl: selectedImage });

        setStudents((prev) =>
          prev.map((c) =>
            c.id === child.id ? { ...c, photoUrl: selectedImage } : c
          )
        );
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la photo :", error);
      }
    }
  };

  const handleQRCodePress = (child: Student) => {
    setSelectedChild(child);
  };

  const closeQRCodeModal = () => {
    setSelectedChild(null);
  };

  // Fonction corrigée pour gérer la navigation vers AddChild
  const handleAddChild = () => {
    try {
      console.log('Navigation vers AddChild...');
      // Correction: utiliser le bon chemin selon la structure du projet
      router.push("/AddChild");
    } catch (error) {
      console.error('Erreur lors de la navigation:', error);
      // Fallbacks alternatifs
      try {
        router.navigate("/AddChild");
      } catch (navigateError) {
        try {
          // Essayer sans le groupe (tabs)
          router.push('/AddChild');
        } catch (pushError) {
          console.error('Toutes les tentatives de navigation ont échoué:', pushError);
          Alert.alert('Erreur', 'Impossible d\'ouvrir la page d\'ajout d\'enfant');
        }
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (students.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyMessage}>Aucun enfant enregistré</Text>
        <TouchableOpacity onPress={handleAddChild} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Ajouter un enfant</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Mes Enfants</Text>

      <TouchableOpacity
        onPress={handleAddChild}
        style={styles.addButton}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>+ Ajouter un enfant</Text>
      </TouchableOpacity>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.childCard}>
            <TouchableOpacity onPress={() => handleImagePick(item)}>
              <Image
                source={{ uri: item.photoUrl || 'https://via.placeholder.com/80' }}
                style={styles.childImage}
              />
            </TouchableOpacity>

            <View style={styles.childInfo}>
              <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
              <Text style={styles.detail}>🎂 {item.birthDate}</Text>
              <Text style={styles.detail}>👨‍👩‍👧 Parent : {user?.displayName || item.parentName}</Text>
            </View>

            <TouchableOpacity onPress={() => handleQRCodePress(item)}>
              <Ionicons name="qr-code-outline" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={!!selectedChild}
        animationType="slide"
        transparent={true}
        onRequestClose={closeQRCodeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedChild && (
              <>
                <Text style={styles.modalTitle}>QR Code pour {selectedChild.firstName}</Text>
                <QRCode
                  value={`ID: ${selectedChild.id}\nNom: ${selectedChild.firstName} ${selectedChild.lastName}\nParent: ${user?.displayName || selectedChild.parentName}`}
                  size={200}
                />
                <View style={styles.modalButtonsContainer}>
                  <Pressable style={styles.modalButton} onPress={closeQRCodeModal}>
                    <Text style={styles.closeButtonText}>Fermer</Text>
                  </Pressable>
                  <Pressable style={styles.modalButton} onPress={handleShareQRCode}>
                    <Text style={styles.closeButtonText}>Partager</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.textDark,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  childImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
    backgroundColor: '#ddd',
  },
  childInfo: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    color: colors.textDark,
    fontFamily: 'Poppins-SemiBold',
  },
  detail: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMessage: {
    fontSize: 18,
    color: colors.textLight,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
    maxWidth: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Poppins-SemiBold',
    color: colors.textDark,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Medium',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});

export default ParentDashboard;