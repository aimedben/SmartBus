import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/constants/colors';
import { LogOut, Bell, Shield, CircleHelp as HelpCircle, FileText, ChevronRight, MapPin } from 'lucide-react-native';
import ScreenHeader from '@/components/ScreenHeader';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const { userRole, uid, signOut } = useAuth(); // ← userId requis
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
   const [userData, setUserData] = useState({
      fullName: '',
      
     
    });
  const [loading, setLoading] = useState(true);
  const [error , setError] = useState(null);

  const getUserRoleTitle = () => {
    switch (userRole) {
      case 'parent': return 'Parent';
      case 'driver': return 'Bus Driver';
      case 'admin': return 'Administrator';
      case 'student': return 'Student';
      default: return 'User';
    }
  };

  const getUserAvatar = () => require('../../assets/images/imgprofile.png');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!uid ) return;
        const docRef = doc(db, 'Users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData({
            fullName: docSnap.data().fullName || 'No name',
           
            
          });
          
        } else {
          console.warn('User data not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [uid]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <Image source={getUserAvatar()} style={styles.profileImage} />
          <Text style={styles.profileName}>{userData?.fullName}</Text>
          <Text style={styles.profileRole}>{getUserRoleTitle()}</Text>

          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

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
              ios_backgroundColor={colors.border}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <Text style={styles.settingText}>Location Services</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={locationEnabled ? colors.primary : colors.textLight}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Shield size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuText}>Privacy and Security</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <HelpCircle size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuText}>Help and Support</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <FileText size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuText}>Terms and Conditions</Text>
            </View>
            <ChevronRight size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={signOut}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.errorLight }]}>
                <LogOut size={20} color={colors.error} />
              </View>
              <Text style={[styles.menuText, { color: colors.error }]}>Logout</Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  profileName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: colors.textDark,
    marginBottom: 4,
  },
  profileRole: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 16,
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  editProfileButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.primary,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.textDark,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.textDark,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.textDark,
  },
  logoutItem: {
    marginTop: 8,
  },
  versionContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  versionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textLight,
  },
});