import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants";
import { BigButton } from "./ui";
import { IcoCheck, IcoPlus, IcoX, IcoZona } from "./icons";

interface ZoneAssignSheetProps {
  readonly visible: boolean;
  readonly deviceName: string;
  readonly knownZones: readonly string[];
  readonly assignedZones: readonly string[];
  readonly onSave: (zones: readonly string[]) => void;
  readonly onClose: () => void;
}

/**
 * Editor de asignación de zonas (local en el celular — el hub no expone zonas).
 * Permite marcar zonas conocidas y crear nuevas por texto. Al guardar devuelve
 * la selección completa; la persistencia (zoneStore) la maneja la pantalla.
 */
export function ZoneAssignSheet({
  visible,
  deviceName,
  knownZones,
  assignedZones,
  onSave,
  onClose,
}: ZoneAssignSheetProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<readonly string[]>(assignedZones);
  const [newZone, setNewZone] = useState("");
  const footerPaddingBottom = Math.max(24, insets.bottom + 20);

  useEffect(() => {
    if (visible) {
      setDraft(assignedZones);
      setNewZone("");
    }
  }, [visible, assignedZones]);

  // Lista a mostrar: zonas conocidas ∪ las que el usuario haya agregado al draft.
  const options = Array.from(new Set([...knownZones, ...draft]));

  const toggle = (zone: string) => {
    setDraft((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  const handleAddNew = () => {
    const name = newZone.trim();
    if (name === "") {
      return;
    }
    setDraft((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setNewZone("");
  };

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          testID="zone-assign-sheet"
          style={styles.sheet}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <IcoZona size={24} color={COLORS.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>Zonas</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {deviceName}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.85}
            >
              <IcoX size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              value={newZone}
              onChangeText={setNewZone}
              placeholder="Nueva zona…"
              placeholderTextColor={COLORS.textMuted}
              accessibilityLabel="Nombre de nueva zona"
              onSubmitEditing={handleAddNew}
              returnKeyType="done"
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Agregar zona"
              accessibilityState={{ disabled: newZone.trim() === "" }}
              style={[
                styles.addBtn,
                newZone.trim() === "" && styles.addBtnDisabled,
              ]}
              onPress={handleAddNew}
              disabled={newZone.trim() === ""}
              activeOpacity={0.85}
            >
              <IcoPlus size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            testID="zone-assign-list"
            style={styles.listScroll}
            contentContainerStyle={styles.list}
          >
            {options.length === 0 ? (
              <Text style={styles.empty}>
                Todavía no hay zonas. Creá una arriba.
              </Text>
            ) : (
              options.map((zone) => {
                const checked = draft.includes(zone);
                return (
                  <TouchableOpacity
                    key={zone}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    accessibilityLabel={zone}
                    style={[styles.row, checked && styles.rowChecked]}
                    onPress={() => toggle(zone)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        checked && styles.checkboxChecked,
                      ]}
                    >
                      {checked && <IcoCheck size={20} color="#fff" />}
                    </View>
                    <IcoZona
                      size={22}
                      color={checked ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text
                      style={[styles.rowLabel, checked && styles.rowLabelChecked]}
                    >
                      {zone}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
            <View style={styles.applySlot}>
              <BigButton label="Guardar" onPress={handleSave} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    width: "100%",
    maxHeight: "82%",
    minHeight: 380,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: COLORS.divider,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: COLORS.surface,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  addInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  listScroll: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  empty: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 32,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  rowChecked: {
    backgroundColor: COLORS.primarySoft,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rowLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  rowLabelChecked: {
    color: COLORS.primaryDark,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  applySlot: {
    flex: 1,
  },
});
