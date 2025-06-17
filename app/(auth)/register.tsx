import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Lock, Mail, User, Eye, EyeOff, Contact, Camera } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/Colors";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { registerForPushNotificationsAsync } from "../(tabs)/index";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("parent");
  const [contact, setContact] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [adminCode, setAdminCode] = useState("");
  const [showAdminCode, setShowAdminCode] = useState(false);

  useEffect(() => {
    const fetchPushToken = async () => {
      const token = await registerForPushNotificationsAsync();
      setPushToken(token);
    };

    fetchPushToken();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission requise", "L'accès à la caméra est nécessaire pour prendre une photo.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const validateFields = () => {
    if (!name.trim()) {
      Alert.alert("Erreur", "Nom requis");
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Erreur", "Email invalide");
      return false;
    }
    if (!contact.trim()) {
      Alert.alert("Erreur", "Téléphone requis");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Erreur", "Mot de passe trop court (6 caractères minimum)");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return false;
    }
    if (role === "admin" && adminCode !== "ADMIN123") { // Code secret pour admin
      Alert.alert("Erreur", "Code admin incorrect");
      return false;
    }
    return true;
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return null;

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.warn("Erreur GPS:", error);
      return null;
    }
  };

  const handleRegister = async () => {
    if (!validateFields()) return;

    try {
      setLoading(true);
      
      // Création du compte Firebase Auth
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Préparation des données utilisateur
      const userData: any = {
        uid: user.uid,
        fullName: name,
        email: user.email,
        contact,
        role,
        image,
        createdAt: new Date(),
        pushToken: pushToken || null,
      };

      // Ajout de la localisation pour les chauffeurs
      if (role === "driver") {
        const location = await getLocation();
        if (location) userData.location = location;
      }

      // Sauvegarde dans Firestore
      await setDoc(doc(db, "Users", user.uid), userData);

      // Sauvegarde dans la collection spécifique au rôle
      let roleCollection = "Parents";
      if (role === "driver") roleCollection = "Drivers";
      if (role === "admin") roleCollection = "Admins";
      
      await setDoc(doc(db, roleCollection, user.uid), userData);

      Alert.alert("Succès", "Compte créé avec succès !");
      router.replace(role === "admin" ? "/admin" : "/login");
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      let message = "Une erreur est survenue lors de l'inscription.";
      if (error.code === "auth/email-already-in-use") {
        message = "Cet email est déjà utilisé par un autre compte.";
      } else if (error.code === "auth/invalid-email") {
        message = "L'adresse email est invalide.";
      } else if (error.code === "auth/weak-password") {
        message = "Le mot de passe doit contenir au moins 6 caractères.";
      }
      Alert.alert("Erreur", message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setShowAdminCode(newRole === "admin");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Créer un compte</Text>

        {/* Section Photo de profil */}
        <View style={styles.profilePictureContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profilePicture} />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <User size={40} color={colors.gray} />
            </View>
          )}
          <View style={styles.profilePictureButtons}>
            <TouchableOpacity 
              style={styles.profilePictureButton} 
              onPress={pickImage}
            >
              <Text style={styles.profilePictureButtonText}>Choisir</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profilePictureButton} 
              onPress={takePhoto}
            >
              <Camera size={16} color={colors.primary} />
              <Text style={styles.profilePictureButtonText}>Prendre</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Champs de formulaire */}
        <View style={styles.inputContainer}>
          <User size={20} color={colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Nom complet"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Mail size={20} color={colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Contact size={20} color={colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Téléphone"
            value={contact}
            onChangeText={setContact}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color={colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff color="gray" /> : <Eye color="gray" />}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color={colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <EyeOff color="gray" /> : <Eye color="gray" />}
          </TouchableOpacity>
        </View>

        {/* Sélection du rôle */}
        <Text style={styles.roleLabel}>Rôle :</Text>
        <View style={styles.roleContainer}>
          {["parent", "driver", "admin"].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleButton, role === r && styles.roleButtonSelected]}
              onPress={() => handleRoleChange(r)}
            >
              <Text style={[styles.roleText, role === r && styles.roleTextSelected]}>
                {r === "parent" ? "Parent" : r === "driver" ? "Chauffeur" : "Admin"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Champ code admin (visible seulement si rôle admin sélectionné) */}
        {showAdminCode && (
          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.primary} />
            <TextInput
              style={styles.input}
              placeholder="Code admin"
              secureTextEntry={true}
              value={adminCode}
              onChangeText={setAdminCode}
            />
          </View>
        )}

        {/* Bouton d'inscription */}
        <TouchableOpacity
          style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        {/* Lien vers la connexion */}
        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.loginText}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  scrollContainer: { 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20, 
    color: colors.primary,
    textAlign: "center" 
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profilePictureButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
  },
  profilePictureButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: colors.inputBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profilePictureButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  input: { 
    flex: 1, 
    padding: 10, 
    color: colors.textDark 
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  registerButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  registerText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16 
  },
  loginText: { 
    marginTop: 16, 
    textAlign: "center", 
    color: colors.primary,
    textDecorationLine: "underline",
  },
  roleLabel: { 
    fontWeight: "600", 
    fontSize: 14, 
    marginBottom: 6,
    color: colors.textDark 
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleText: { 
    color: colors.textDark 
  },
  roleTextSelected: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
});