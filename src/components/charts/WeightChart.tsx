import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Line, Circle, Text as SvgText } from 'react-native-svg';
import { WeighIn } from '../../types';
import { colors, fontSize, spacing } from '../ui/theme';
import { format } from 'date-fns';

interface WeightChartProps {
  weighIns: WeighIn[];
  targetWeight: number;
  weightUnit: 'lbs' | 'kg';
}

export function WeightChart({ weighIns, targetWeight, weightUnit }: WeightChartProps) {
  if (weighIns.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No weigh-ins yet</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - 64;
  const chartWidth = screenWidth;
  const chartHeight = 200;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 35;

  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const weights = weighIns.map((wi) => Number(wi.weight));
  const allWeights = [...weights, targetWeight];
  const minWeight = Math.min(...allWeights) - 2;
  const maxWeight = Math.max(...allWeights) + 2;
  const weightRange = maxWeight - minWeight;

  const toX = (index: number) => {
    if (weighIns.length === 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (weighIns.length - 1)) * plotWidth;
  };

  const toY = (weight: number) => {
    return paddingTop + (1 - (weight - minWeight) / weightRange) * plotHeight;
  };

  const points = weighIns.map((wi, i) => `${toX(i)},${toY(Number(wi.weight))}`).join(' ');
  const targetY = toY(targetWeight);

  // Y-axis tick values
  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount }, (_, i) => {
    return Math.round(minWeight + (weightRange * i) / (tickCount - 1));
  });

  // X-axis labels (show up to 5 dates)
  const labelCount = Math.min(weighIns.length, 5);
  const xLabelIndices = Array.from({ length: labelCount }, (_, i) => {
    return Math.round((i * (weighIns.length - 1)) / (labelCount - 1));
  });

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Y-axis grid lines and labels */}
        {yTicks.map((tick) => (
          <React.Fragment key={`y-${tick}`}>
            <Line
              x1={paddingLeft}
              y1={toY(tick)}
              x2={chartWidth - paddingRight}
              y2={toY(tick)}
              stroke={colors.borderLight}
              strokeWidth={1}
            />
            <SvgText
              x={paddingLeft - 8}
              y={toY(tick) + 4}
              textAnchor="end"
              fontSize={10}
              fill={colors.textSecondary}
            >
              {tick}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Target weight line (dashed) */}
        <Line
          x1={paddingLeft}
          y1={targetY}
          x2={chartWidth - paddingRight}
          y2={targetY}
          stroke={colors.secondary}
          strokeWidth={2}
          strokeDasharray="6,4"
        />

        {/* Weight line */}
        <Polyline
          points={points}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {weighIns.map((wi, i) => (
          <Circle
            key={wi.id || i}
            cx={toX(i)}
            cy={toY(Number(wi.weight))}
            r={4}
            fill={colors.primary}
            stroke={colors.surface}
            strokeWidth={2}
          />
        ))}

        {/* X-axis labels */}
        {xLabelIndices.map((idx) => (
          <SvgText
            key={`x-${idx}`}
            x={toX(idx)}
            y={chartHeight - 5}
            textAnchor="middle"
            fontSize={9}
            fill={colors.textSecondary}
          >
            {format(new Date(weighIns[idx].weighed_on), 'MM/dd')}
          </SvgText>
        ))}
      </Svg>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Weight ({weightUnit})</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDashed, { borderColor: colors.secondary }]} />
          <Text style={styles.legendText}>Target ({targetWeight} {weightUnit})</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  empty: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendLine: {
    width: 16,
    height: 3,
    borderRadius: 2,
  },
  legendDashed: {
    width: 16,
    height: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
  },
  legendText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
