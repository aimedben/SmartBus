import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Lock, Mail, Eye, EyeOff, ChevronLeft } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { colors } from "@/constants/colors";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Champs requis", "Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);

      Alert.alert("Bienvenue", "Connexion réussie !");
      router.push("/(auth)/user-type"); // redirection après connexion
    } catch (error: any) {
      console.error("Erreur de connexion :", error);
      Alert.alert("Erreur", error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign In</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.formContainer}>
          <View style={styles.logoContainer}>
            <Image 
              source={require("../../assets/images/logo-transparent.png")} 
              style={styles.logo} 
            />
          </View>

          <Text style={styles.subtitle}>
            Welcome back to Smart Bus. Please login to continue.
          </Text>

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

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Logging in..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.registerLink}>Create one</Text>
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
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  loginButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.white,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textLight,
  },
  registerLink: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
});
