import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView ,Alert} from 'react-native';
import { router } from 'expo-router';
import { Lock, Mail, User, Eye, EyeOff, ChevronLeft } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';
import { getAuth } from 'firebase/auth';
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      try {
        const utilisateurRef = collection(db, "Users");
        const q = query(utilisateurRef, where("uid", "==", currentUser.uid));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();  
          setFullName(data.fullName || "");
          
          setProfileImage(data.profileImage || null);
        }
      } catch (error) {
        console.error("Erreur chargement profil :", error);
      }
    };

    fetchProfile();
  }, []);
  const handleNext = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Champs requis", "Veuillez remplir tous les champs.");
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }
  
    try {
      setLoading(true);
      const auth = getAuth();
  
      // Étape 1 : Créer le compte dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Étape 2 : Enregistrer les infos dans Firestore
      const utilisateurRef = collection(db, "Users");
      await addDoc(utilisateurRef, {
        uid: user.uid,
        email: user.email,
        fullName: name,
        profileImage: profileImage,
        createdAt: new Date(),
      });
  
      Alert.alert("Succès", "Compte créé avec succès !");
      router.push("/(auth)/user-type"); // ou autre écran approprié
    } catch (error: any) {
      console.error("Erreur d'inscription :", error);
      Alert.alert("Erreur", error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };
  

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission requise", "L'accès à la caméra est nécessaire !");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };
  
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 24 }} /> {/* Empty view for alignment */}
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/logo-transparent.png' )}
              style={styles.logo}
            />
          </View>
          
          <Text style={styles.subtitle}>
            Join Smart Bus to make school transportation safer
          </Text>
          
          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.inputContainer}>
            <User size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={colors.textLight}
              value={name}
              onChangeText={setName}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Mail size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textLight}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 
                <EyeOff size={20} color={colors.textLight} /> : 
                <Eye size={20} color={colors.textLight} />
              }
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textLight}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? 
                <EyeOff size={20} color={colors.textLight} /> : 
                <Eye size={20} color={colors.textLight} />
              }
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.textDark,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignSelf: 'center',
    marginVertical: 24,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 15,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 15,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.textDark,
  },
  eyeIcon: {
    padding: 8,
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  registerButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.white,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textLight,
  },
  loginLink: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.primary,
  },
});