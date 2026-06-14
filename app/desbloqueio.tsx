import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { useRouter } from "expo-router";

const TEAL = "#0b6b6b";

type Etapa = "aguardando_nfc" | "aguardando_bio" | "sucesso" | "erro";

export default function Desbloqueio() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("aguardando_nfc");
  const [mensagem, setMensagem] = useState("Aproxime seu celular do dispositivo");
  const [nfcSuportado, setNfcSuportado] = useState(true);
  const pulseAnim = new Animated.Value(1);

  // Animação de pulso
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Inicia leitura NFC ao abrir a tela
  useEffect(() => {
    iniciarNFC();
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  const iniciarNFC = async () => {
    try {
      const suportado = await NfcManager.isSupported();
      if (!suportado) {
        setNfcSuportado(false);
        setMensagem("NFC não disponível neste dispositivo");
        return;
      }

      await NfcManager.start();
      setEtapa("aguardando_nfc");
      setMensagem("Aproxime seu celular do dispositivo");

      // Aguarda leitura de tag NFC
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();

      if (tag) {
        await NfcManager.cancelTechnologyRequest();
        // Tag detectada — pede biometria
        await pedirBiometria();
      }
    } catch (e) {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      // Se cancelou ou erro, volta ao estado inicial
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
        // Após 2 segundos vai para o dashboard
        setTimeout(() => {
          router.replace("/(tabs)/dashboard");
        }, 2000);
      } else {
        setEtapa("erro");
        setMensagem("Biometria não reconhecida. Tente novamente.");
      }
    } catch (e) {
      setEtapa("erro");
      setMensagem("Erro ao verificar biometria.");
    }
  };

  const tentar = () => {
    setEtapa("aguardando_nfc");
    setMensagem("Aproxime seu celular do dispositivo");
    iniciarNFC();
  };

  // Cores e ícones por etapa
  const config = {
    aguardando_nfc: {
      icon: "wifi-outline" as const,
      cor: TEAL,
      fundo: "#e6f4f4",
    },
    aguardando_bio: {
      icon: "finger-print-outline" as const,
      cor: "#f59e0b",
      fundo: "#fef3c7",
    },
    sucesso: {
      icon: "checkmark-circle-outline" as const,
      cor: "#16a34a",
      fundo: "#dcfce7",
    },
    erro: {
      icon: "close-circle-outline" as const,
      cor: "#ef4444",
      fundo: "#fee2e2",
    },
  };

  const atual = config[etapa];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.btnVoltar}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={22} color="#475569" />
        </TouchableOpacity>
        <View style={styles.logoWrap}>
          <Ionicons name="shield-checkmark-outline" size={18} color={TEAL} />
          <Text style={styles.logoText}>ASPEN CORE</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Conteúdo central */}
      <View style={styles.centro}>
        {/* Ícone animado */}
        <Animated.View
          style={[
            styles.iconePrincipal,
            { backgroundColor: atual.fundo },
            etapa === "aguardando_nfc" && {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons name={atual.icon} size={64} color={atual.cor} />
        </Animated.View>

        {/* Título por etapa */}
        <Text style={styles.titulo}>
          {etapa === "aguardando_nfc" && "Modo de acesso NFC"}
          {etapa === "aguardando_bio" && "Verificação biométrica"}
          {etapa === "sucesso" && "Acesso liberado!"}
          {etapa === "erro" && "Falha no acesso"}
        </Text>

        <Text style={styles.mensagem}>{mensagem}</Text>

        {/* Passos visuais */}
        {(etapa === "aguardando_nfc" || etapa === "aguardando_bio") && (
          <View style={styles.passosWrap}>
            <View style={styles.passo}>
              <View
                style={[
                  styles.passoBola,
                  { backgroundColor: TEAL },
                ]}
              >
                <Ionicons name="wifi-outline" size={16} color="white" />
              </View>
              <Text style={styles.passoText}>Aproximar</Text>
              <View
                style={[
                  styles.passoLinha,
                  etapa === "aguardando_bio" && { backgroundColor: TEAL },
                ]}
              />
            </View>

            <View style={styles.passo}>
              <View
                style={[
                  styles.passoBola,
                  etapa === "aguardando_bio"
                    ? { backgroundColor: "#f59e0b" }
                    : { backgroundColor: "#e2e8f0" },
                ]}
              >
                <Ionicons
                  name="finger-print-outline"
                  size={16}
                  color={etapa === "aguardando_bio" ? "white" : "#94a3b8"}
                />
              </View>
              <Text style={styles.passoText}>Biometria</Text>
              <View style={styles.passoLinha} />
            </View>

            <View style={styles.passo}>
              <View style={[styles.passoBola, { backgroundColor: "#e2e8f0" }]}>
                <Ionicons name="checkmark-outline" size={16} color="#94a3b8" />
              </View>
              <Text style={styles.passoText}>Liberado</Text>
            </View>
          </View>
        )}

        {/* Sucesso */}
        {etapa === "sucesso" && (
          <View style={styles.sucessoCard}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#16a34a" />
            <Text style={styles.sucessoText}>
              Identidade verificada. Redirecionando...
            </Text>
          </View>
        )}

        {/* Erro */}
        {etapa === "erro" && (
          <TouchableOpacity style={styles.btnTentar} onPress={tentar}>
            <Ionicons name="refresh-outline" size={18} color="white" />
            <Text style={styles.btnTentarText}>Tentar novamente</Text>
          </TouchableOpacity>
        )}

        {/* Botão de teste de biometria (para testar no Expo Go sem NFC) */}
        {etapa === "aguardando_nfc" && (
          <TouchableOpacity
            style={styles.btnTeste}
            onPress={pedirBiometria}
          >
            <Ionicons name="finger-print-outline" size={16} color={TEAL} />
            <Text style={styles.btnTesteText}>
              Testar só biometria (sem NFC)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rodapé */}
      <View style={styles.rodape}>
        <Ionicons name="lock-closed-outline" size={14} color="#94a3b8" />
        <Text style={styles.rodapeText}>
          Conexão segura · Aspen Core
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7f8",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  btnVoltar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoText: {
    fontSize: 13,
    fontWeight: "700",
    color: TEAL,
    letterSpacing: 0.8,
  },

  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 20,
  },

  iconePrincipal: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  mensagem: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
  },

  // Passos
  passosWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  passo: {
    alignItems: "center",
    gap: 6,
  },
  passoBola: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  passoText: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },
  passoLinha: {
    position: "absolute",
    top: 18,
    left: 36,
    width: 40,
    height: 2,
    backgroundColor: "#e2e8f0",
  },

  // Sucesso
  sucessoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sucessoText: {
    fontSize: 13,
    color: "#16a34a",
    fontWeight: "500",
  },

  // Botões
  btnTentar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ef4444",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnTentarText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  btnTeste: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: TEAL,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  btnTesteText: {
    color: TEAL,
    fontWeight: "600",
    fontSize: 14,
  },

  rodape: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 36,
  },
  rodapeText: {
    fontSize: 12,
    color: "#94a3b8",
  },
});