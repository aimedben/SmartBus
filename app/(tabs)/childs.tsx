import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  Share, // <-- Import depuis react-native
} from 'react-native';
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
import { app } from '@/firebaseConfig';

const AllChildrenList = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  const db = getFirestore(app);
  const auth = getAuth(app);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchChildren = async () => {
      if (!user) {
        console.warn('Aucun utilisateur connecté.');
        setLoading(false);
        return;
      }

      try {
        const childrenRef = collection(db, 'students');
        const q = query(childrenRef, where('parentId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const kids = [];

        for (const docSnap of querySnapshot.docs) {
          const childData = docSnap.data();
          const parentRef = doc(db, 'parents', childData.parentId);
          const parentSnap = await getDoc(parentRef);

          kids.push({
            id: docSnap.id,
            ...childData,
            parentName: parentSnap.exists() ? parentSnap.data().Name : 'Inconnu',
          });
        }

        setChildren(kids);
      } catch (error) {
        console.error('Erreur lors de la récupération des enfants :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [user]);

  const handleShareQRCode = async () => {
    if (!selectedChild) return;

    try {
      const message = `ID: ${selectedChild.id}\nNom: ${selectedChild.firstName} ${selectedChild.lastName}\nParent: ${selectedChild.parentName}`;
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Erreur lors du partage :', error);
    }
  };

  const handleImagePick = async (child) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', 'Autorisez l’accès à la galerie.');
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
        const childRef = doc(db, 'students', child.id);
        await updateDoc(childRef, { photoUrl: selectedImage });

        setChildren((prev) =>
          prev.map((c) =>
            c.id === child.id ? { ...c, photoUrl: selectedImage } : c
          )
        );
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la photo :", error);
      }
    }
  };

  const handleQRCodePress = (child) => {
    setSelectedChild(child);
  };

  const closeQRCodeModal = () => {
    setSelectedChild(null);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (children.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Aucun enfant trouvé dans la base de données.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <Text style={styles.pageTitle}>My Children</Text>
      <FlatList
        data={children}
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
              <Text style={styles.detail}>👨‍👩‍👧 Parent : {item.parentName}</Text>
            </View>

            <TouchableOpacity onPress={() => handleQRCodePress(item)}>
              <Ionicons name="qr-code-outline" size={28} color="#6200ee" />
            </TouchableOpacity>
          </View>
        )}
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
                  value={`ID: ${selectedChild.id}\nNom: ${selectedChild.firstName} ${selectedChild.lastName}\nParent: ${selectedChild.parentName}`}
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

export default AllChildrenList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  pageTitle: {
  margin: 50,
  fontSize: 28,
  fontWeight: 'bold',
  marginBottom: 20,
  color: '#333',
  textAlign: 'center',
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
    color: '#333',
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
