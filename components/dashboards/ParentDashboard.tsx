import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors } from '@/constants/Colors';

interface Student {
  name: string;
  grade: string;
  avatar: string;
}

interface Props {
  students: Student[];
}

const ParentDashboard: React.FC<Props> = ({ students }) => {
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
};

const styles = StyleSheet.create({
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
});

export default ParentDashboard;
