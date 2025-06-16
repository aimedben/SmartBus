import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/constants/Colors';
import { CircleAlert as AlertCircle, Bell, CircleCheck as CheckCircle, Info as InfoIcon, MapPin } from 'lucide-react-native';
import { getNotifications } from '@/utils/mockData';
import ScreenHeader from '@/components/ScreenHeader';

export default function NotificationsScreen() {
  const { userRole } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, [userRole]);

  const loadNotifications = () => {
    const data = getNotifications(userRole);
    setNotifications(data);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(item => item.type === filter);

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle size={24} color={colors.error} />;
      case 'info':
        return <InfoIcon size={24} color={colors.primary} />;
      case 'success':
        return <CheckCircle size={24} color={colors.success} />;
      case 'location':
        return <MapPin size={24} color={colors.warning} />;
      default:
        return <Bell size={24} color={colors.primary} />;
    }
  };

  const renderNotification = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity style={[styles.notificationItem, !item.read && styles.unread]}>
        <View style={[styles.iconContainer, { backgroundColor: item.read ? colors.backgroundLight : colors.primaryLight }]}>
          {renderNotificationIcon(item.type)}
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        {!item.read && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Notifications" />
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterOption, filter === 'all' && styles.filterOptionActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterOption, filter === 'alert' && styles.filterOptionActive]}
          onPress={() => setFilter('alert')}
        >
          <Text style={[styles.filterText, filter === 'alert' && styles.filterTextActive]}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterOption, filter === 'info' && styles.filterOptionActive]}
          onPress={() => setFilter('info')}
        >
          <Text style={[styles.filterText, filter === 'info' && styles.filterTextActive]}>Info</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterOption, filter === 'location' && styles.filterOptionActive]}
          onPress={() => setFilter('location')}
        >
          <Text style={[styles.filterText, filter === 'location' && styles.filterTextActive]}>Location</Text>
        </TouchableOpacity>
      </View>
      
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={64} color={colors.primaryLight} />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyText}>You don't have any notifications at the moment</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item, index) => `notification-${index}`}
          contentContainerStyle={styles.notificationsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
  },
  filterOptionActive: {
    backgroundColor: colors.primaryLight,
  },
  filterText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: colors.textLight,
  },
  filterTextActive: {
    color: colors.primary,
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  unread: {
    backgroundColor: colors.white,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 4,
  },
  notificationMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  notificationTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: colors.textLight,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
});