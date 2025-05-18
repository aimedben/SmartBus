// components/RoleInterfaces/ParentDashboard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

export default function ParentDashboard({ students }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Children</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
}

// Ajoute ici les styles spécifiques si besoin
const styles = StyleSheet.create({
  // ... tes styles ici
});
