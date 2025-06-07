import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import ParentDashboard from '@/components/dashboards/ParentDashboard';
import DriverDashboard from '@/components/dashboards/DriverDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';

export default function HomeScreen() {
  const { userRole, userName } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const renderDashboard = () => {
    switch (userRole) {
      case 'parent':
        return <ParentDashboard students={[]} />;
      case 'driver':
        return <DriverDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return null;
    }
  };


  return (
    <View style={{ flex: 1 }}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {renderDashboard()}
      </ScrollView>
    </View>
  );
}
