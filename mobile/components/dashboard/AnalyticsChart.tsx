import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { width: screenWidth } = Dimensions.get('window');

// Sample data matching the web dashboard
const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
];

type ViewMode = 'desktop' | 'mobile' | 'combined';

export default function AnalyticsChart() {
  const [viewMode, setViewMode] = useState<ViewMode>('combined');

  const getChartData = () => {
    const labels = chartData.map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    switch (viewMode) {
      case 'desktop':
        return {
          labels,
          datasets: [{
            data: chartData.map(item => item.desktop),
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue
            strokeWidth: 2
          }]
        };
      case 'mobile':
        return {
          labels,
          datasets: [{
            data: chartData.map(item => item.mobile),
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
            strokeWidth: 2
          }]
        };
      case 'combined':
      default:
        return {
          labels,
          datasets: [
            {
              data: chartData.map(item => item.desktop),
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue
              strokeWidth: 2
            },
            {
              data: chartData.map(item => item.mobile),
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
              strokeWidth: 2
            }
          ]
        };
    }
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#ffffff'
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e5e7eb',
      strokeWidth: 1
    },
    fillShadowGradient: '#3B82F6',
    fillShadowGradientOpacity: 0.1,
  };

  const ViewModeButton = ({ mode, title, color }: { mode: ViewMode; title: string; color: string }) => (
    <TouchableOpacity
      style={[
        styles.viewModeButton,
        viewMode === mode && styles.activeViewModeButton,
        viewMode === mode && { borderColor: color }
      ]}
      onPress={() => setViewMode(mode)}
    >
      <View style={[styles.colorIndicator, { backgroundColor: color }]} />
      <ThemedText style={[
        styles.viewModeButtonText,
        viewMode === mode && styles.activeViewModeButtonText
      ]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <IconSymbol size={24} color="#3B82F6" name="chart.line.uptrend.xyaxis" />
          <ThemedText style={styles.title}>Analytics Overview</ThemedText>
        </View>
        <ThemedText style={styles.subtitle}>Visitors for the last 12 days</ThemedText>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.viewModeContainer}>
        <View style={styles.viewModeButtons}>
          <ViewModeButton mode="combined" title="Combined" color="#8B5CF6" />
          <ViewModeButton mode="desktop" title="Desktop" color="#3B82F6" />
          <ViewModeButton mode="mobile" title="Mobile" color="#10B981" />
        </View>
      </ScrollView>

      <View style={styles.chartContainer}>
        <LineChart
          data={getChartData()}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withDots={true}
          withShadow={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          withInnerLines={false}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          yAxisSuffix=""
          yAxisInterval={1}
          segments={4}
        />
      </View>

      <View style={styles.legend}>
        {viewMode === 'combined' && (
          <>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
              <ThemedText style={styles.legendText}>Desktop</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
              <ThemedText style={styles.legendText}>Mobile</ThemedText>
            </View>
          </>
        )}
        {viewMode === 'desktop' && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
            <ThemedText style={styles.legendText}>Desktop Visitors</ThemedText>
          </View>
        )}
        {viewMode === 'mobile' && (
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
            <ThemedText style={styles.legendText}>Mobile Visitors</ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  viewModeContainer: {
    marginBottom: 16,
  },
  viewModeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  activeViewModeButton: {
    backgroundColor: '#EBF4FF',
    borderWidth: 1.5,
  },
  colorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  viewModeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeViewModeButtonText: {
    color: '#1F2937',
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
  },
});