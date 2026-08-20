import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Image, Linking, Modal, Pressable,
  ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { auth } from "@/services/firebase";
import api from "@/services/api";
import { useI18n, LOCALE_LABELS, type Locale, type Theme } from "@/contexts/i18n";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TEAL = "#0b6b6b";
const LOGO_ESCURA = require("@/assets/images/logo-alt.png");
const LOGO_CLARA = require("@/assets/images/logo-icone.png");

type Usuario = { name: string; email: string; plan: string };

function Divisor({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

function ItemToggle({ titulo, descricao, value, onValueChange, colors }: {
  titulo: string; descricao?: string; value: boolean;
  onValueChange: (v: boolean) => void; colors: any;
}) {
  return (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitulo, { color: colors.text }]}>{titulo}</Text>
        {!!descricao && <Text style={[styles.itemDesc, { color: colors.textMuted }]}>{descricao}</Text>}
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: "#e2e8f0", true: TEAL }} thumbColor="white" />
    </View>
  );
}

function ItemAcao({ titulo, descricao, onPress, cor, icone, colors }: {
  titulo: string; descricao?: string; onPress: () => void;
  cor?: string; icone?: string; colors: any;
}) {
  return (
    <TouchableOpacity style={styles.itemRow} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitulo, { color: cor ?? colors.text }]}>{titulo}</Text>
        {!!descricao && <Text style={[styles.itemDesc, { color: colors.textMuted }]}>{descricao}</Text>}
      </View>
      <Ionicons name={(icone ?? "chevron-forward") as any} size={16} color={cor ?? colors.textMuted} />
    </TouchableOpacity>
  );
}

const SECOES_KEYS = ["account", "privacy", "security", "preferences", "about"] as const;
type SecaoKey = typeof SECOES_KEYS[number];

export default function Configuracoes() {
  const router = useRouter();
  const { t, colors, locale, setLocale, theme, setTheme, photoUri } = useI18n();
  const logo = theme === "dark" ? LOGO_CLARA : LOGO_ESCURA;
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoKey>("account");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [saindo, setSaindo] = useState(false);
  const [modalIdioma, setModalIdioma] = useState(false);
  const [modalTema, setModalTema] = useState(false);

  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [compartilharDados, setCompartilharDados] = useState(true);
  const [cookies, setCookies] = useState(false);
  const [autenticacaoBio, setAutenticacaoBio] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("@aspen_bio_ativada").then((v) => {
      if (v === "true") setAutenticacaoBio(true);
    });
  }, []);

  const [modalBiometria, setModalBiometria] = useState(false);
  const [bioEmail, setBioEmail] = useState("");
  const [bioSenha, setBioSenha] = useState("");
  const [bioCarregando, setBioCarregando] = useState(false);
  const [bioMostrarSenha, setBioMostrarSenha] = useState(false);

  async function handleToggleBiometria(valor: boolean) {
    if (valor) {
      const compativel = await LocalAuthentication.hasHardwareAsync();
      const registrado = await LocalAuthentication.isEnrolledAsync();

      if (!compativel || !registrado) {
        Alert.alert(t("attention"), "Seu dispositivo não possui biometria configurada nas configurações do sistema.");
        return;
      }

      // Pré-preenche com email do usuário logado
      setBioEmail(usuario?.email ?? "");
      setBioSenha("");
      setModalBiometria(true);
    } else {
      setAutenticacaoBio(false);
      await AsyncStorage.setItem("@aspen_bio_ativada", "false");

      // Precisa apagar as MESMAS chaves que o login.tsx usa pra liberar o
      // acesso por biometria (por e-mail). Antes isso apagava chaves sem
      // sufixo de e-mail (@aspen_bio_email / @aspen_bio_senha), que nunca
      // existiram — por isso a biometria continuava funcionando no login
      // mesmo com o switch desligado aqui.
      const emailAlvo = usuario?.email ?? (await AsyncStorage.getItem("@aspen_bio_ultimo_email"));
      if (emailAlvo) {
        await AsyncStorage.removeItem(`@aspen_bio_${emailAlvo}`);
        await AsyncStorage.removeItem(`@aspen_bio_senha_${emailAlvo}`);
        await AsyncStorage.removeItem("@aspen_bio_ultimo_email");
      }

      Alert.alert(t("success"), "Biometria desativada.");
    }
  }

  async function confirmarAtivacaoBiometria() {
    if (!bioEmail || !bioSenha) {
      Alert.alert(t("attention"), "Preencha e-mail e senha."); return;
    }
    setBioCarregando(true);
    try {
      // Valida credenciais
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, bioEmail, bioSenha);

      // Autentica biometria
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirme com sua biometria para ativar",
        cancelLabel: t("cancel"),
      });

      if (resultado.success) {
        await AsyncStorage.setItem(`@aspen_bio_${bioEmail}`, "true");
        await AsyncStorage.setItem(`@aspen_bio_senha_${bioEmail}`, bioSenha);
        await AsyncStorage.setItem("@aspen_bio_ultimo_email", bioEmail);
        // Chave que o switch desta tela lê no useEffect ao montar — faltava
        // gravar isso, então o toggle voltava a aparecer desligado mesmo
        // com a biometria já ativa e funcionando no login.
        await AsyncStorage.setItem("@aspen_bio_ativada", "true");
        setAutenticacaoBio(true);
        setModalBiometria(false);
        Alert.alert(t("success"), "Biometria ativada! Na próxima vez, entre sem digitar senha.");
      }
    } catch (err: any) {
      const msg = err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential"
        ? "Senha incorreta." : "Erro ao verificar credenciais.";
      Alert.alert(t("error"), msg);
    } finally {
      setBioCarregando(false);
    }
  }
  const [alertasLogin, setAlertasLogin] = useState(true);

  useEffect(() => {
    api.get("/auth/me").then((res) => {
      setUsuario(res.data.data?.user ?? res.data);
    }).catch(() => {}).finally(() => setCarregando(false));
  }, []);

  async function handleSair() {
    Alert.alert(t("logout"), t("logoutConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("logout"), style: "destructive", onPress: async () => {
          setSaindo(true);
          try { await signOut(auth); router.replace("/login"); }
          catch { Alert.alert(t("error"), t("logoutError")); }
          finally { setSaindo(false); }
        },
      },
    ]);
  }

  const planLabel = (p: string) => ({
    basico: t("planBasico"), padrao: t("planPadrao"), premium: t("planPremium"),
  }[p] ?? p);

  const inics = usuario?.name?.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("") ?? "?";

  if (carregando) {
    return <View style={[styles.loading, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color={TEAL} /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header manual (sem usar componente Header pra evitar padding duplo) */}
      <View style={[styles.headerBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerLogo}>
          <Image source={logo} style={styles.logoImg} resizeMode="contain" />
          <Text style={[styles.headerLogoText, { color: colors.text }]}>ASPEN CORE</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Abas horizontais */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={[styles.abasScroll, { backgroundColor: colors.abasBg, borderBottomColor: colors.border }]}
        contentContainerStyle={styles.abasContent}>
        {SECOES_KEYS.map((key) => (
          <TouchableOpacity key={key} style={[styles.aba, secaoAtiva === key && styles.abaAtiva]} onPress={() => setSecaoAtiva(key)}>
            <Text style={[styles.abaText, { color: colors.textMuted }, secaoAtiva === key && styles.abaTextAtiva]}>{t(key as any)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>

        {/* ---- Conta ---- */}
        {secaoAtiva === "account" && (
          <View>
            {/* Card do usuário com foto */}
            <View style={[styles.card, styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.userAvatarWrap}>
                {photoUri
                  ? <Image source={{ uri: photoUri }} style={styles.userAvatarImg} />
                  : (
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>{inics}</Text>
                    </View>
                  )
                }
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.userNome, { color: colors.text }]} numberOfLines={1}>{usuario?.name ?? "—"}</Text>
                <Text style={[styles.userEmail, { color: colors.textSec }]} numberOfLines={1}>{usuario?.email ?? "—"}</Text>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>{planLabel(usuario?.plan ?? "")}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
              <ItemAcao titulo={t("editProfile")} descricao={t("editProfileDesc")} onPress={() => router.push("/(tabs)/profile" as any)} colors={colors} />
              <Divisor color={colors.border} />
              <ItemAcao titulo={t("changePassword")} descricao={t("changePasswordDesc")} onPress={() => router.push("/(tabs)/profile" as any)} colors={colors} />
              <Divisor color={colors.border} />
              <ItemAcao titulo={t("managePlan")} descricao={`${t("currentPlan")}: ${planLabel(usuario?.plan ?? "")}`} onPress={() => router.push("/(tabs)/planos" as any)} colors={colors} />
            </View>

            <TouchableOpacity style={[styles.btnSair, { borderColor: "#fecaca" }]} onPress={handleSair} disabled={saindo}>
              {saindo
                ? <ActivityIndicator color="#ef4444" size="small" />
                : <>
                    <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                    <Text style={styles.btnSairText}>{t("logout")}</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* ---- Privacidade ---- */}
        {secaoAtiva === "privacy" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ItemToggle titulo={t("shareData")} descricao={t("shareDataDesc")} value={compartilharDados} onValueChange={setCompartilharDados} colors={colors} />
            <Divisor color={colors.border} />
            <ItemToggle titulo={t("analyticsCookies")} descricao={t("analyticsCookiesDesc")} value={cookies} onValueChange={setCookies} colors={colors} />
            <Divisor color={colors.border} />
            <ItemAcao titulo={t("privacyPolicy")} onPress={() => router.push("/politica-de-privacidade" as any)} colors={colors} />
            <Divisor color={colors.border} />
            <ItemAcao titulo={t("termsOfUse")} onPress={() => router.push("/termos-de-uso" as any)} colors={colors} />
          </View>
        )}

        {/* ---- Segurança ---- */}
        {secaoAtiva === "security" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ItemToggle titulo={t("biometric")} descricao={t("biometricDesc")} value={autenticacaoBio} onValueChange={handleToggleBiometria} colors={colors} />
            <Divisor color={colors.border} />
            <ItemToggle titulo={t("loginAlerts")} descricao={t("loginAlertsDesc")} value={alertasLogin} onValueChange={setAlertasLogin} colors={colors} />
            <Divisor color={colors.border} />
            <ItemAcao titulo={t("changePassword")} descricao={t("changePasswordDesc")} onPress={() => router.push("/(tabs)/profile" as any)} colors={colors} />
            <Divisor color={colors.border} />
            <ItemAcao titulo={t("deleteAccountShort")} descricao={t("deleteAccountShortDesc")} onPress={() => router.push("/(tabs)/profile" as any)} cor="#ef4444" icone="warning-outline" colors={colors} />
          </View>
        )}

        {/* ---- Preferências ---- */}
        {secaoAtiva === "preferences" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ItemToggle titulo={t("pushNotifications")} descricao={t("pushNotificationsDesc")} value={notifPush} onValueChange={setNotifPush} colors={colors} />
            <Divisor color={colors.border} />
            <ItemToggle titulo={t("emailNotifications")} descricao={t("emailNotificationsDesc")} value={notifEmail} onValueChange={setNotifEmail} colors={colors} />
            <Divisor color={colors.border} />
            <TouchableOpacity style={styles.itemRow} onPress={() => setModalIdioma(true)}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitulo, { color: colors.text }]}>{t("language")}</Text>
                <Text style={[styles.itemDesc, { color: colors.textMuted }]}>{LOCALE_LABELS[locale]}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
            <Divisor color={colors.border} />
            <TouchableOpacity style={styles.itemRow} onPress={() => setModalTema(true)}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitulo, { color: colors.text }]}>{t("theme")}</Text>
                <Text style={[styles.itemDesc, { color: colors.textMuted }]}>{theme === "light" ? t("lightMode") : t("darkMode")}</Text>
              </View>
              <Ionicons name={theme === "light" ? "sunny-outline" : "moon-outline"} size={18} color={TEAL} />
            </TouchableOpacity>
          </View>
        )}

        {/* ---- Sobre ---- */}
        {secaoAtiva === "about" && (
          <View>
            <View style={[styles.card, styles.sobreHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image source={logo} style={styles.sobreLogo} resizeMode="contain" />
              <Text style={[styles.sobreNome, { color: colors.text }]}>ASPEN CORE</Text>
              <Text style={[styles.sobreTagline, { color: colors.textSec }]}>{t("securityDigital")}</Text>
              <Text style={[styles.sobreVersao, { color: colors.textMuted }]}>{t("version")} 1.0.0</Text>
            </View>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
              <ItemAcao titulo={t("termsOfUse")} onPress={() => router.push("/termos-de-uso" as any)} colors={colors} />
              <Divisor color={colors.border} />
              <ItemAcao titulo={t("privacyPolicy")} onPress={() => router.push("/politica-de-privacidade" as any)} colors={colors} />
              <Divisor color={colors.border} />
              <ItemAcao titulo={t("instagram")} descricao="@aspencore0" onPress={() => Linking.openURL("https://www.instagram.com/aspencore0/")} icone="logo-instagram" colors={colors} />
              <Divisor color={colors.border} />
              <ItemAcao titulo={t("contact")} descricao="aspencorp0@gmail.com" onPress={() => Linking.openURL("mailto:aspencorp0@gmail.com")} icone="mail-outline" colors={colors} />
            </View>
            <Text style={[styles.copyright, { color: colors.textMuted }]}>{t("copyright")}</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Modal: ativar biometria */}
      <Modal visible={modalBiometria} transparent animationType="fade" onRequestClose={() => setModalBiometria(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalBiometria(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20 }]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitulo, { color: colors.text }]}>{t("biometric")}</Text>
            <Text style={[{ fontSize: 13, color: colors.textSec, marginBottom: 16 }]}>
              Confirme suas credenciais para ativar o acesso por biometria.
            </Text>
            <View style={[bioStyles.inputWrap, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
              <Ionicons name="mail-outline" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={[bioStyles.input, { color: colors.text }]}
                value={bioEmail}
                onChangeText={setBioEmail}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={[bioStyles.inputWrap, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={[bioStyles.input, { color: colors.text, flex: 1 }]}
                value={bioSenha}
                onChangeText={setBioSenha}
                placeholder="Sua senha"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!bioMostrarSenha}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setBioMostrarSenha(!bioMostrarSenha)}>
                <Ionicons name={bioMostrarSenha ? "eye-off-outline" : "eye-outline"} size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={bioStyles.btnConfirmar} onPress={confirmarAtivacaoBiometria} disabled={bioCarregando}>
              {bioCarregando
                ? <ActivityIndicator color="white" size="small" />
                : <>
                    <Ionicons name="finger-print-outline" size={18} color="white" />
                    <Text style={bioStyles.btnConfirmarText}>Confirmar e ativar biometria</Text>
                  </>
              }
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalFechar, { borderTopColor: colors.border, marginTop: 8 }]} onPress={() => setModalBiometria(false)}>
              <Text style={[styles.modalFecharText, { color: colors.textSec }]}>{t("cancel")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal: idioma */}
      <Modal visible={modalIdioma} transparent animationType="slide" onRequestClose={() => setModalIdioma(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalIdioma(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitulo, { color: colors.text }]}>{t("language")}</Text>
            {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => (
              <TouchableOpacity key={loc} style={[styles.localeItem, locale === loc && { backgroundColor: "#e6f4f4" }]}
                onPress={() => { setLocale(loc); setModalIdioma(false); }}>
                <Text style={[styles.localeTitulo, { color: colors.text }, locale === loc && { color: TEAL, fontWeight: "700" }]}>{LOCALE_LABELS[loc]}</Text>
                {locale === loc && <Ionicons name="checkmark" size={18} color={TEAL} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.modalFechar, { borderTopColor: colors.border }]} onPress={() => setModalIdioma(false)}>
              <Text style={[styles.modalFecharText, { color: colors.textSec }]}>{t("close")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal: tema */}
      <Modal visible={modalTema} transparent animationType="slide" onRequestClose={() => setModalTema(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalTema(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitulo, { color: colors.text }]}>{t("theme")}</Text>
            {(["light", "dark"] as Theme[]).map((th) => (
              <TouchableOpacity key={th} style={[styles.localeItem, theme === th && { backgroundColor: "#e6f4f4" }]}
                onPress={() => { setTheme(th); setModalTema(false); }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Ionicons name={th === "light" ? "sunny-outline" : "moon-outline"} size={20} color={theme === th ? TEAL : colors.textSec} />
                  <Text style={[styles.localeTitulo, { color: colors.text }, theme === th && { color: TEAL, fontWeight: "700" }]}>
                    {th === "light" ? t("lightMode") : t("darkMode")}
                  </Text>
                </View>
                {theme === th && <Ionicons name="checkmark" size={18} color={TEAL} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.modalFechar, { borderTopColor: colors.border }]} onPress={() => setModalTema(false)}>
              <Text style={[styles.modalFecharText, { color: colors.textSec }]}>{t("close")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 0.5 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerLogo: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerLogoText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  logoImg: { width: 18, height: 18 },
  sobreLogo: { width: 64, height: 64 },
  abasScroll: { borderBottomWidth: 0.5, flexGrow: 0, flexShrink: 1 },
  abasContent: { paddingHorizontal: 8, alignItems: "center" },
  aba: { paddingHorizontal: 14, paddingVertical: 16 },
  abaAtiva: { borderBottomWidth: 2, borderBottomColor: TEAL },
  abaText: { fontSize: 13, fontWeight: "500" },
  abaTextAtiva: { color: TEAL, fontWeight: "700" },
  card: { borderRadius: 14, borderWidth: 0.5, padding: 16 },
  userCard: { flexDirection: "row", alignItems: "center", gap: 14 },
  userAvatarWrap: { flexShrink: 0 },
  userAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: TEAL, alignItems: "center", justifyContent: "center" },
  userAvatarImg: { width: 52, height: 52, borderRadius: 26 },
  userAvatarText: { color: "white", fontSize: 18, fontWeight: "700" },
  userNome: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  userEmail: { fontSize: 12, marginBottom: 6 },
  planBadge: { backgroundColor: "#e6f4f4", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, alignSelf: "flex-start" },
  planBadgeText: { fontSize: 11, fontWeight: "600", color: TEAL },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, gap: 8 },
  itemTitulo: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  itemDesc: { fontSize: 12 },
  divider: { height: 0.5 },
  btnSair: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, borderRadius: 14, borderWidth: 1, paddingVertical: 16 },
  btnSairText: { fontSize: 15, fontWeight: "700", color: "#ef4444" },
  sobreHeader: { alignItems: "center", gap: 6, paddingVertical: 16 },
  sobreNome: { fontSize: 18, fontWeight: "700", letterSpacing: 1 },
  sobreTagline: { fontSize: 13 },
  sobreVersao: { fontSize: 12, marginTop: 4 },
  copyright: { textAlign: "center", fontSize: 11, marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  modalTitulo: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  localeItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10 },
  localeTitulo: { fontSize: 15, fontWeight: "500" },
  modalFechar: { borderTopWidth: 0.5, paddingTop: 16, alignItems: "center" },
  modalFecharText: { fontSize: 15, fontWeight: "600" },
});

const bioStyles = StyleSheet.create({
  inputWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 12 },
  input: { flex: 1, fontSize: 14 },
  btnConfirmar: { backgroundColor: "#0b6b6b", borderRadius: 10, paddingVertical: 13, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  btnConfirmarText: { color: "white", fontWeight: "700", fontSize: 14 },
});