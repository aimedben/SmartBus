import React, { useState } from "react";
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
} from "react-native";
import { router } from "expo-router";
import { Lock, Mail, User, Eye, EyeOff, ChevronLeft, Contact } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/Colors";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import * as Location from "expo-location";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("parent");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState("");

  const validateFields = () => {
    if (!name.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre nom complet");
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Erreur", "Veuillez entrer une adresse email valide");
      return false;
    }
    if (!contact.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre numéro de téléphone");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
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
      console.warn("Erreur de localisation:", error);
      return null;
    }
  };

  const handleRegister = async () => {
    if (!validateFields()) return;

    try {
      setLoading(true);
      const auth = getAuth();

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData: any = {
        uid: user.uid,
        email: user.email,
        fullName: name,
        contact,
        role,
        createdAt: new Date(),
      };

      if (role === "driver") {
        const location = await getLocation();
        if (location) {
          userData.location = location;
        }
      }

      // Créer un document dans la collection Users
      await setDoc(doc(db, "Users", user.uid), userData);

      // Créer un document dans la collection spécifique selon le rôle
      let roleCollection = "Parents"; // Par défaut
      if (role === "driver") {
        roleCollection = "Drivers";
      } else if (role === "admin") {
        roleCollection = "Admins";
      }
      
      await setDoc(doc(db, roleCollection, user.uid), userData);

      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      let errorMessage = "Une erreur est survenue lors de l'inscription";
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Cet email est déjà utilisé";
          break;
        case "auth/weak-password":
          errorMessage = "Le mot de passe doit contenir au moins 6 caractères";
          break;
        case "auth/invalid-email":
          errorMessage = "Adresse email invalide";
          break;
      }
      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ... (le reste du code reste inchangé)
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer un compte</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Rejoignez notre communauté</Text>

          <View style={styles.inputContainer}>
            <User size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nom complet"
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
            <Contact size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Téléphone"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
              value={contact}
              onChangeText={setContact}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor={colors.textLight}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.textLight} />
              ) : (
                <Eye size={20} color={colors.textLight} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor={colors.textLight}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={colors.textLight} />
              ) : (
                <Eye size={20} color={colors.textLight} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Je suis :</Text>
            <View style={styles.rolesRow}>
              {["parent", "driver"].map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  style={[styles.roleButton, role === r && styles.roleSelected]}
                >
                  <Text style={[styles.roleText, role === r && styles.roleTextSelected]}>
                    {r === "parent" ? "Parent" : "Conducteur"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.registerButtonText}>Créer un compte</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { flexGrow: 1, paddingBottom: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: colors.textDark,
  },
  formContainer: { paddingHorizontal: 24 },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: colors.textDark,
  },
  eyeIcon: { padding: 8 },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  registerButtonDisabled: {
    backgroundColor: colors.primaryLight,
    elevation: 1,
    shadowOpacity: 0.1,
  },
  registerButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: colors.white,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: colors.textLight,
  },
  loginLink: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  roleContainer: { marginBottom: 16 },
  roleLabel: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 8,
  },
  rolesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  roleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleText: {
    fontFamily: "Poppins-Regular",
    color: colors.textDark,
    textAlign: "center",
  },
  roleTextSelected: {
    color: colors.white,
    fontFamily: "Poppins-SemiBold",
  },
});