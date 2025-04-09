import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Settings, 
  LogOut, 
  Truck, 
  Package, 
  MapPin, 
  ChevronRight,
  UserCog
} from 'lucide-react-native';
import { useAuthStore, switchMockUser } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const handleEditProfile = () => {
    router.push('/profile/edit');
  };
  
  const handleManageVehicles = () => {
    router.push('/profile/vehicles');
  };
  
  const handleLogout = async () => {
    await logout();
    // Navigate directly to the login screen instead of the welcome screen
    router.replace('/auth/login');
  };
  
  // For demo purposes
  const handleSwitchUser = async () => {
    await switchMockUser();
  };
  
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            {user.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color={colors.white} />
              </View>
            )}
            
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {user.role === 'orderer' ? 'Transport Orderer' : 'Transporter'}
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <UserCog size={20} color={colors.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.card}>
            <View style={styles.cardItem}>
              <View style={styles.cardItemIcon}>
                <User size={20} color={colors.primary} />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Full Name</Text>
                <Text style={styles.cardItemValue}>{user.name}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.cardItem}>
              <View style={styles.cardItemIcon}>
                <Package size={20} color={colors.primary} />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Role</Text>
                <Text style={styles.cardItemValue}>
                  {user.role === 'orderer' ? 'Transport Orderer' : 'Transporter'}
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.cardItem}>
              <View style={styles.cardItemIcon}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Address</Text>
                <Text style={styles.cardItemValue}>{user.address || 'Not provided'}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {user.role === 'transporter' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transport Information</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleManageVehicles}
            >
              <View style={styles.menuItemIcon}>
                <Truck size={20} color={colors.primary} />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemText}>Manage Vehicles</Text>
                <Text style={styles.menuItemSubtext}>
                  {user.vehicles?.length || 0} vehicles registered
                </Text>
              </View>
              <ChevronRight size={20} color={colors.gray} />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemIcon}>
              <Settings size={20} color={colors.primary} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>App Settings</Text>
            </View>
            <ChevronRight size={20} color={colors.gray} />
          </TouchableOpacity>
          
          {/* For demo purposes */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleSwitchUser}
          >
            <View style={styles.menuItemIcon}>
              <User size={20} color={colors.primary} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>Switch Demo User</Text>
              <Text style={styles.menuItemSubtext}>
                Try the app as {user.role === 'orderer' ? 'transporter' : 'orderer'}
              </Text>
            </View>
            <ChevronRight size={20} color={colors.gray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.logoutContainer}>
          <Button 
            title="Log Out" 
            variant="outline"
            leftIcon={<LogOut size={20} color={colors.danger} />}
            onPress={handleLogout}
            style={styles.logoutButton}
            textStyle={{ color: colors.danger }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    gap: 8,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cardItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardItemContent: {
    flex: 1,
  },
  cardItemLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  cardItemValue: {
    fontSize: 16,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  menuItemSubtext: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  logoutContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    borderColor: colors.danger,
  },
});