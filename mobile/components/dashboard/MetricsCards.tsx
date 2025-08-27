import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 60) / 2; // 2 cards per row with margins

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  description: string;
  icon: string;
  color: string;
}

function MetricCard({ title, value, change, trend, description, icon, color }: MetricCardProps) {
  const trendIcon = trend === 'up' ? 'arrow.up.right' : 'arrow.down.right';
  const trendColor = trend === 'up' ? '#10B981' : '#EF4444';

  return (
    <ThemedView style={[styles.card, { width: cardWidth }]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <IconSymbol size={20} color={color} name={icon} />
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
        </View>
        <View style={[styles.trendBadge, { backgroundColor: `${trendColor}15` }]}>
          <IconSymbol size={12} color={trendColor} name={trendIcon} />
          <ThemedText style={[styles.trendText, { color: trendColor }]}>{change}</ThemedText>
        </View>
      </View>
      
      <ThemedText style={styles.cardValue}>{value}</ThemedText>
      
      <View style={styles.cardFooter}>
        <ThemedText style={styles.description}>{description}</ThemedText>
      </View>
    </ThemedView>
  );
}

export default function MetricsCards() {
  const metrics: MetricCardProps[] = [
    {
      title: 'Total Revenue',
      value: '$1,250.00',
      change: '+12.5%',
      trend: 'up',
      description: 'Trending up this month',
      icon: 'dollarsign.circle',
      color: '#10B981',
    },
    {
      title: 'New Customers',
      value: '1,234',
      change: '-20%',
      trend: 'down',
      description: 'Acquisition needs attention',
      icon: 'person.2',
      color: '#EF4444',
    },
    {
      title: 'Active Accounts',
      value: '45,678',
      change: '+12.5%',
      trend: 'up',
      description: 'Strong user retention',
      icon: 'person.3',
      color: '#3B82F6',
    },
    {
      title: 'Growth Rate',
      value: '4.5%',
      change: '+4.5%',
      trend: 'up',
      description: 'Meets growth projections',
      icon: 'chart.line.uptrend.xyaxis',
      color: '#F59E0B',
    },
  ];

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Key Metrics</ThemedText>
      <View style={styles.grid}>
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    opacity: 0.7,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  description: {
    fontSize: 11,
    lineHeight: 14,
    opacity: 0.7,
  },
});