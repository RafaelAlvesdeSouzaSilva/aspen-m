import { useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useI18n } from "@/contexts/i18n";

interface Props {
  titulo: string;
  subtitulo?: string;
  mostrarVoltar?: boolean;
  direita?: React.ReactNode;
}

export default function Header({ titulo, subtitulo, mostrarVoltar = true, direita }: Props) {
  const router = useRouter();
  const { colors, theme } = useI18n();

  const logo = theme === "dark"
    ? require("@/assets/images/logo-icone.png")
    : require("@/assets/images/logo-alt.png");

  return (
    <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
      <View style={styles.topRow}>
        {mostrarVoltar ? (
          <TouchableOpacity style={[styles.btnVoltar, { backgroundColor: colors.inputBg }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={20} color={colors.textSec} />
          </TouchableOpacity>
        ) : (
          <View style={styles.btnVoltar} />
        )}

        <View style={styles.logoWrap}>
          <Image source={logo} style={styles.logoImg} resizeMode="contain" />
          <Text style={[styles.logoText, { color: colors.text }]}>ASPEN CORE</Text>
        </View>

        <View style={{ width: 36 }}>
          {direita}
        </View>
      </View>

      <Text style={[styles.titulo, { color: colors.text }]}>{titulo}</Text>
      {subtitulo && <Text style={[styles.subtitulo, { color: colors.textSec }]}>{subtitulo}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  btnVoltar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoImg: { width: 20, height: 20 },
  logoText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  titulo: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  subtitulo: { fontSize: 13 },
});