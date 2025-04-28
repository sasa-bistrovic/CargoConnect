import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";
import { Home, Plus, Settings, Truck } from 'lucide-react-native';

import Colors from "@/constants/colors";
import { colors } from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        headerShown: true,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.white,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Vehicles",
          tabBarIcon: ({ color }) => <Truck size={24} color={color} />,
          headerTitleStyle: {
            fontWeight: '600',
            color: colors.text,
          },
        }}
      />
      
      <Tabs.Screen
        name="add"
        options={{
          title: "Add Vehicle",
          tabBarIcon: ({ color }) => <Plus size={24} color={color} />,
          headerTitleStyle: {
            fontWeight: '600',
            color: colors.text,
          },
        }}
      />
    </Tabs>
  );
}