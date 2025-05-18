import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Clock } from 'lucide-react-native';
import { StatusUpdate } from '@/types';
import { colors } from '@/constants/colors';
import { formatDate } from '@/utils/helpers';

interface StatusTimelineProps {
  statusUpdates: StatusUpdate[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ statusUpdates }) => {
  // Sort updates by timestamp (newest first)
  const sortedUpdates = [...statusUpdates].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return (
    <View style={styles.container}>
      {sortedUpdates.map((update, index) => (
        <View key={index} style={styles.timelineItem}>
          <View style={styles.iconContainer}>
            <Check size={16} color={colors.white} />
          </View>
          
          {index !== sortedUpdates.length - 1 && (
            <View style={styles.line} />
          )}
          
          <View style={styles.contentContainer}>
            <Text style={styles.statusText}>
              {update.status.replace('_', ' ').toUpperCase()}
            </Text>
            
            <View style={styles.timeContainer}>
              <Clock size={12} color={colors.textLight} />
              <Text style={styles.timeText}>
                {formatDate(update.timestamp, true)}
              </Text>
            </View>
            
            {update.note && (
              <Text style={styles.noteText}>{update.note}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  line: {
    position: 'absolute',
    left: 14,
    top: 28,
    bottom: -16,
    width: 2,
    backgroundColor: colors.primaryLight,
  },
  contentContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.textLight,
  },
  noteText: {
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.lightGray,
    padding: 8,
    borderRadius: 8,
  },
});