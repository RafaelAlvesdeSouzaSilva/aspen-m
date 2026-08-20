import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { useRouter } from "expo-router";
import { useI18n } from "@/contexts/i18n";

const TEAL = "#0b6b6b";

type Etapa = "aguardando_nfc" | "aguardando_bio" | "sucesso" | "erro";

export default function Desbloqueio() {
  const router = useRouter();
  const { theme, colors } = useI18n();

  const logo = theme === "dark"
    ? require("@/assets/images/logo-icone.png")
    : require("@/assets/images/logo-alt.png");

  const [etapa, setEtapa] = useState<Etapa>("aguardando_nfc");
  const [mensagem, setMensagem] = useState("Aproxime seu celular do dispositivo");
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    iniciarNFC();
    return () => { NfcManager.cancelTechnologyRequest().catch(() => {}); };
  }, []);

  const iniciarNFC = async () => {
    try {
      const suportado = await NfcManager.isSupported();
      if (!suportado) {
        setMensagem("NFC não disponível neste dispositivo");
        return;
      }
      await NfcManager.start();
      setEtapa("aguardando_nfc");
      setMensagem("Aproxime seu celular do dispositivo");
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      if (tag) {
        await NfcManager.cancelTechnologyRequest();
        await pedirBiometria();
      }
    } catch {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      if (etapa !== "sucesso") {
        setEtapa("aguardando_nfc");
        setMensagem("Aproxime seu celular do dispositivo");
      }
    }
  };

  const pedirBiometria = async () => {
    setEtapa("aguardando_bio");
    setMensagem("Confirme sua identidade");
    try {
      const bioDisponivel = await LocalAuthentication.hasHardwareAsync();
      const bioRegistrada = await LocalAuthentication.isEnrolledAsync();
      if (!bioDisponivel || !bioRegistrada) {
        setEtapa("erro");
        setMensagem("Biometria não configurada no dispositivo");
        return;
      }
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirme sua identidade para liberar o acesso",
        fallbackLabel: "Usar senha",
        cancelLabel: "Cancelar",
        disableDeviceFallback: false,
      });
      if (resultado.success) {
        setEtapa("sucesso");
        setMensagem("Acesso liberado com sucesso!");
        setTimeout(() => { router.replace("/(tabs)/dashboard"); }, 2000);
      } else {
        setEtapa("erro");
        setMensagem("Biometria não reconhecida. Tente novamente.");
      }
    } catch {
      setEtapa("erro");
      setMensagem("Erro ao verificar biometria.");
    }
  };

  const tentar = () => {
    setEtapa("aguardando_nfc");
    setMensagem("Aproxime seu celular do dispositivo");
    iniciarNFC();
  };

  const config = {
    aguardando_nfc: { icon: "wifi-outline" as const, cor: TEAL, fundo: theme === "dark" ? "#0d3333" : "#e6f4f4" },
    aguardando_bio: { icon: "finger-print-outline" as const, cor: "#f59e0b", fundo: theme === "dark" ? "#3d2e00" : "#fef3c7" },
    sucesso: { icon: "checkmark-circle-outline" as const, cor: "#16a34a", fundo: theme === "dark" ? "#0d2e15" : "#dcfce7" },
    erro: { icon: "close-circle-outline" as const, cor: "#ef4444", fundo: theme === "dark" ? "#3d0d0d" : "#fee2e2" },
  };

  const atual = config[etapa];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.btnVoltar, { backgroundColor: colors.inputBg }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color={colors.textSec} />
        </TouchableOpacity>
        <View style={styles.logoWrap}>
          <Image source={logo} style={{ width: 20, height: 20 }} resizeMode="contain" />
          <Text style={[styles.logoText, { color: colors.text }]}>ASPEN CORE</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Conteúdo central */}
      <View style={styles.centro}>
        <Animated.View
          style={[
            styles.iconePrincipal,
            { backgroundColor: atual.fundo },
            etapa === "aguardando_nfc" && { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Ionicons name={atual.icon} size={64} color={atual.cor} />
        </Animated.View>

        <Text style={[styles.titulo, { color: colors.text }]}>
          {etapa === "aguardando_nfc" && "Modo de acesso NFC"}
          {etapa === "aguardando_bio" && "Verificação biométrica"}
          {etapa === "sucesso" && "Acesso liberado!"}
          {etapa === "erro" && "Falha no acesso"}
        </Text>

        <Text style={[styles.mensagem, { color: colors.textSec }]}>{mensagem}</Text>

        {/* Passos */}
        {(etapa === "aguardando_nfc" || etapa === "aguardando_bio") && (
          <View style={styles.passosWrap}>
            <View style={styles.passo}>
              <View style={[styles.passoBola, { backgroundColor: TEAL }]}>
                <Ionicons name="wifi-outline" size={16} color="white" />
              </View>
              <Text style={[styles.passoText, { color: colors.textMuted }]}>Aproximar</Text>
              <View style={[styles.passoLinha, { backgroundColor: colors.border }, etapa === "aguardando_bio" && { backgroundColor: TEAL }]} />
            </View>
            <View style={styles.passo}>
              <View style={[styles.passoBola, etapa === "aguardando_bio" ? { backgroundColor: "#f59e0b" } : { backgroundColor: colors.border }]}>
                <Ionicons name="finger-print-outline" size={16} color={etapa === "aguardando_bio" ? "white" : colors.textMuted} />
              </View>
              <Text style={[styles.passoText, { color: colors.textMuted }]}>Biometria</Text>
              <View style={[styles.passoLinha, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.passo}>
              <View style={[styles.passoBola, { backgroundColor: colors.border }]}>
                <Ionicons name="checkmark-outline" size={16} color={colors.textMuted} />
              </View>
              <Text style={[styles.passoText, { color: colors.textMuted }]}>Liberado</Text>
            </View>
          </View>
        )}

        {etapa === "sucesso" && (
          <View style={styles.sucessoCard}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#16a34a" />
            <Text style={styles.sucessoText}>Identidade verificada. Redirecionando...</Text>
          </View>
        )}

        {etapa === "erro" && (
          <TouchableOpacity style={styles.btnTentar} onPress={tentar}>
            <Ionicons name="refresh-outline" size={18} color="white" />
            <Text style={styles.btnTentarText}>Tentar novamente</Text>
          </TouchableOpacity>
        )}

        {etapa === "aguardando_nfc" && (
          <TouchableOpacity style={[styles.btnTeste, { borderColor: TEAL }]} onPress={pedirBiometria}>
            <Ionicons name="finger-print-outline" size={16} color={TEAL} />
            <Text style={[styles.btnTesteText, { color: TEAL }]}>Testar só biometria (sem NFC)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rodapé */}
      <View style={styles.rodape}>
        <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
        <Text style={[styles.rodapeText, { color: colors.textMuted }]}>Conexão segura · Aspen Core</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 0.5 },
  btnVoltar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoText: { fontSize: 13, fontWeight: "700", letterSpacing: 0.8 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 20 },
  iconePrincipal: { width: 140, height: 140, borderRadius: 70, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  titulo: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  mensagem: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  passosWrap: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  passo: { alignItems: "center", gap: 6 },
  passoBola: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  passoText: { fontSize: 11, fontWeight: "500" },
  passoLinha: { position: "absolute", top: 18, left: 36, width: 40, height: 2 },
  sucessoCard: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#dcfce7", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  sucessoText: { fontSize: 13, color: "#16a34a", fontWeight: "500" },
  btnTentar: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#ef4444", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  btnTentarText: { color: "white", fontWeight: "700", fontSize: 15 },
  btnTeste: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  btnTesteText: { fontWeight: "600", fontSize: 14 },
  rodape: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingBottom: 36 },
  rodapeText: { fontSize: 12 },
});