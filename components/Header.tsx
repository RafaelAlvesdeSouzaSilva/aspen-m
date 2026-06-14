import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const TEAL = "#0b6b6b";

interface Props {
  titulo: string;
  subtitulo?: string;
  mostrarVoltar?: boolean;
  direita?: React.ReactNode;
}

export default function Header({ titulo, subtitulo, mostrarVoltar = true, direita }: Props) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        {mostrarVoltar ? (
          <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={20} color="#475569" />
          </TouchableOpacity>
        ) : (
          <View style={styles.btnVoltar} />
        )}

        <View style={styles.logoWrap}>
          <Ionicons name="shield-checkmark-outline" size={16} color={TEAL} />
          <Text style={styles.logoText}>ASPEN CORE</Text>
        </View>

        <View style={{ width: 36 }}>
          {direita}
        </View>
      </View>

      <Text style={styles.titulo}>{titulo}</Text>
      {subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "white",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  btnVoltar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoText: { fontSize: 11, fontWeight: "700", color: TEAL, letterSpacing: 0.8 },
  titulo: { fontSize: 28, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  subtitulo: { fontSize: 13, color: "#64748b" },
});