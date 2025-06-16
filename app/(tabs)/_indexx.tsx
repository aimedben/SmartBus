import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/constants/Colors';
import { Bus, Calendar, Clock, ChevronRight, Info, MapPin, User, Users } from 'lucide-react-native';
import DashboardHeader from '@/components/DashboardHeader';
import { getBusStatus, getStudents, getUpcomingTrips } from '@/utils/mockData';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export async function fetchAdminStats() {
  try {
    const [driversSnap, studentsSnap, busesSnap] = await Promise.all([
      getDocs(query(collection(db, 'users'), where('role', '==', 'driver'))),
      getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
      getDocs(query(collection(db, 'buses'), where('status', '==', 'active'))),
    ]);

    return {
      drivers: driversSnap.docs.length,
      students: studentsSnap.docs.length,
      activeBuses: busesSnap.docs.length,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      drivers: 0,
      students: 0,
      activeBuses: 0,
    };
  }
}

export default function HomeScreen() {
  const { userRole, userName } = useAuth();
  const [busStatus, setBusStatus] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [adminStats, setAdminStats] = useState({ drivers: 0, students: 0, activeBuses: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [userRole]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      setBusStatus(getBusStatus(userRole));

      if (userRole === 'parent') {
        setStudents(getStudents());
      }

      setUpcomingTrips(getUpcomingTrips(userRole));

      if (userRole === 'admin') {
        const stats = await fetchAdminStats();
        setAdminStats(stats);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderRoleSpecificContent = () => {
    switch (userRole) {
      case 'parent':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Children</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.studentsContainer}
            >
              {students.map((student, index) => (
                <TouchableOpacity key={index} style={styles.studentCard}>
                  <Image source={{ uri: student.avatar }} style={styles.studentImage} />
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentGrade}>{student.grade}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 'driver':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Route</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Details</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <Bus size={20} color={colors.primary} />
                <Text style={styles.routeName}>Route #103</Text>
              </View>
              <View style={styles.routeDetail}>
                <MapPin size={16} color={colors.textLight} />
                <Text style={styles.routeText}>14 stops • 32 km</Text>
              </View>
              <View style={styles.routeDetail}>
                <Users size={16} color={colors.textLight} />
                <Text style={styles.routeText}>28 students onboard</Text>
              </View>
              <View style={styles.routeDetail}>
                <Clock size={16} color={colors.textLight} />
                <Text style={styles.routeText}>Estimated trip time: 45 min</Text>
              </View>
            </View>
          </View>
        );

      case 'admin':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fleet Status</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: colors.primaryLight }]}>
                  <Bus size={20} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{adminStats.activeBuses}</Text>
                <Text style={styles.statLabel}>Active Buses</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: colors.successLight }]}>
                  <User size={20} color={colors.success} />
                </View>
                <Text style={styles.statValue}>{adminStats.drivers}</Text>
                <Text style={styles.statLabel}>Drivers</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: colors.warningLight }]}>
                  <Users size={20} color={colors.warning} />
                </View>
                <Text style={styles.statValue}>{adminStats.students}</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
            </View>
          </View>
        );

      case 'student':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Bus</Text>
            </View>
            <View style={styles.studentBusCard}>
              <View style={styles.studentBusHeader}>
                <Bus size={24} color={colors.white} />
                <View>
                  <Text style={styles.studentBusTitle}>Bus #B42</Text>
                  <Text style={styles.studentBusDriver}>Driver: Ahmed K.</Text>
                </View>
              </View>
              <View style={styles.studentBusInfo}>
                <View style={styles.studentBusDetail}>
                  <Clock size={16} color={colors.textLight} />
                  <Text style={styles.studentBusText}>Next pickup: 07:15 AM</Text>
                </View>
                <View style={styles.studentBusDetail}>
                  <MapPin size={16} color={colors.textLight} />
                  <Text style={styles.studentBusText}>Stop: University Gate 3</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.trackButton}>
                <Text style={styles.trackButtonText}>Track Now</Text>
                <ChevronRight size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DashboardHeader userName={userName} userRole={userRole} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {busStatus && (
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Info size={18} color={busStatus.statusColor} />
              <Text style={[styles.statusTitle, { color: busStatus.statusColor }]}>
                {busStatus.statusText}
              </Text>
            </View>
            <Text style={styles.statusDescription}>{busStatus.statusDescription}</Text>
            {busStatus.eta && (
              <View style={styles.etaContainer}>
                <Clock size={16} color={colors.textLight} />
                <Text style={styles.etaText}>
                  {busStatus.eta}
                </Text>
              </View>
            )}
          </View>
        )}

        {renderRoleSpecificContent()}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Trips</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {upcomingTrips.map((trip, index) => (
            <TouchableOpacity key={index} style={styles.tripCard}>
              <View style={styles.tripIconContainer}>
                {trip.type === 'pickup' ? (
                  <Bus size={24} color={colors.primary} />
                ) : (
                  <Bus size={24} color={colors.success} />
                )}
              </View>
              <View style={styles.tripInfo}>
                <Text style={styles.tripType}>
                  {trip.type === 'pickup' ? 'Morning Pickup' : 'Afternoon Drop-off'}
                </Text>
                <View style={styles.tripDetail}>
                  <Calendar size={14} color={colors.textLight} />
                  <Text style={styles.tripText}>{trip.date}</Text>
                </View>
                <View style={styles.tripDetail}>
                  <Clock size={14} color={colors.textLight} />
                  <Text style={styles.tripText}>{trip.time}</Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.danger,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    marginLeft: 8,
  },
  statusDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 8,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  etaText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textDark,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.textDark,
  },
  seeAllText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.primary,
  },
  studentsContainer: {
    paddingRight: 16,
  },
  studentCard: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  studentImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  studentName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textDark,
    textAlign: 'center',
  },
  studentGrade: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tripIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tripInfo: {
    flex: 1,
  },
  tripType: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 4,
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  tripText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  routeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginLeft: 8,
  },
  routeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textDark,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: colors.textDark,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  studentBusCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  studentBusHeader: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  studentBusTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.white,
  },
  studentBusDriver: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  studentBusInfo: {
    padding: 16,
  },
  studentBusDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentBusText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textDark,
    marginLeft: 8,
  },
  trackButton: {
    backgroundColor: colors.primary,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  trackButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.white,
    marginRight: 4,
  },
});