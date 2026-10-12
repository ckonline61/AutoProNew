import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants';
import { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicleId: string) => void;
  onSelect?: (vehicle: Vehicle) => void;
  isSelected?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={onSelect ? 0.7 : 1}
      onPress={() => onSelect && onSelect(vehicle)}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.carIcon}>🚗</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>
            {vehicle.brand} {vehicle.model}
          </Text>
          <Text style={styles.regNumber}>{vehicle.registrationNumber}</Text>
        </View>
        {isSelected && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}
      </View>

      <View style={styles.tagsRow}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{vehicle.fuelType}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>Year: {vehicle.year}</Text>
        </View>
        {vehicle.color ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{vehicle.color}</Text>
          </View>
        ) : null}
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.actionRow}>
          {onEdit && (
            <TouchableOpacity
              onPress={() => onEdit(vehicle)}
              style={styles.actionButton}
            >
              <Text style={styles.editText}>✏️ Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(vehicle.id)}
              style={[styles.actionButton, styles.deleteButton]}
            >
              <Text style={styles.deleteText}>🗑️ Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F7FF',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  carIcon: {
    fontSize: 22,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  regNumber: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: 8,
    marginTop: 2,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteButton: {
    marginLeft: 4,
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.emergency,
  },
});
