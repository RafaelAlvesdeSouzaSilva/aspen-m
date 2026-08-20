import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Locale = "pt-BR" | "en" | "es" | "fr";
export type Theme = "light" | "dark";

const translations = {
  "pt-BR": {
    // Geral
    save: "Salvar alterações", cancel: "Cancelar", close: "Fechar", back: "Voltar",
    loading: "Carregando...", error: "Erro", success: "Sucesso", confirm: "Confirmar",
    attention: "Atenção", remove: "Remover", seeAll: "Ver todas", seeMore: "Ver tudo",

    // Planos
    planBasico: "Básico", planPadrao: "Padrão", planPremium: "Premium",
    free: "Gratuito", active: "Ativo", noRenewal: "Sem data de renovação",
    currentPlan: "Plano atual", status: "Status", nextRenewal: "Próxima renovação",
    price: "Valor", comparePlans: "Comparar planos",
    planBasicoDesc: "Para uso pessoal com até 2 dispositivos.",
    planPadraoDesc: "Para famílias e profissionais com até 10 dispositivos.",
    planPremiumDesc: "Para equipes e empresas com dispositivos ilimitados.",
    planAtual: "Seu plano atual", maisPopular: "Mais popular",
    ativarAgora: "Ativar agora", planoAtual: "Plano atual",
    voceEstaNoPlano: "Você está no plano",
    planosSubtitulo: "Você está no plano gratuito. Faça upgrade para desbloquear mais recursos.",

    // Dashboard
    welcome: "Bem-vindo,", securitySummary: "Aqui está um resumo da sua segurança digital.",
    nfcMode: "Modo de acesso NFC", nfcDesc: "Aproxime o celular para desbloquear sem senha",
    notifications: "Notificações", recentActivity: "Atividade recente",
    noRecentActivity: "Nenhuma atividade recente",
    allOnline: "Todos online", configured: "Tudo configurado",
    deviceCount: "DISPOSITIVOS", subscriptionStatus: "ASSINATURA",
    alertsMonth: "ALERTAS", protectionLevel: "PROTEÇÃO", high: "Alto",
    alertsDown: "↓ 60% que mês anterior",
    plans: "Planos", devices: "Dispositivos",

    // Notificações
    notificationsSubtitulo: "Acompanhe os eventos da sua conta.",
    allTab: "Todas", unreadTab: "Não lidas", readTab: "Lidas",
    markAllRead: "Marcar todas como lidas", markRead: "Marcar lida",
    noNotifications: "Nenhuma notificação aqui",

    // Dispositivos
    devicesSubtitulo: "Gerencie os dispositivos conectados à sua conta.",
    total: "Total", online: "Online", offline: "Offline",
    noDevices: "Nenhum dispositivo cadastrado", noDevicesDesc: "Clique em \"+\" para começar.",
    lastAccess: "Último acesso:",

    // Perfil
    profile: "Perfil", personalData: "Dados pessoais", security: "Segurança",
    payment: "Pagamento", subscription: "Assinatura", fullName: "Nome completo",
    email: "E-mail", phone: "Telefone", cpf: "CPF",
    emailReadOnly: "Para alterar o e-mail, entre em contato com o suporte.",
    profileSaved: "Dados salvos com sucesso!", profileError: "Não foi possível salvar os dados.",
    nameTooShort: "Nome deve ter pelo menos 3 caracteres.",
    changePassword: "Alterar senha", currentPassword: "Senha atual",
    newPassword: "Nova senha (mín. 8 caracteres)", confirmPassword: "Confirmar nova senha",
    updatePassword: "Atualizar senha", passwordUpdated: "Senha atualizada com sucesso!",
    passwordWrong: "Senha atual incorreta.", passwordWeak: "Nova senha muito fraca.",
    passwordError: "Erro ao atualizar senha.", passwordMismatch: "As senhas não coincidem.",
    passwordTooShort: "A nova senha deve ter pelo menos 8 caracteres.",
    fillAllFields: "Preencha todos os campos de senha.", dangerZone: "Zona de perigo",
    deleteAccount: "Excluir conta",
    deleteAccountDesc: "Esta ação é permanente e irreversível. Todos os seus dados serão apagados.",
    deleteConfirm: "Digite sua senha para confirmar.", deleting: "Excluindo...",
    deleteError: "Erro ao excluir conta. Tente novamente.",
    paymentMethods: "Métodos de pagamento", noPayment: "Nenhum método cadastrado",
    noPaymentDesc: "Adicione um cartão de crédito ou Pix para usar em pagamentos.",
    removeMethod: "Remover método", removeMethodConfirm: "Deseja remover este método de pagamento?",
    removeError: "Não foi possível remover o método.", cardEnding: "terminando em",
    expires: "Expira em", default: "Padrão", subscriptionDetails: "Detalhes da assinatura",
    changePhoto: "Alterar foto", removePhoto: "Remover foto", gallery: "Galeria",
    photoError: "Não foi possível selecionar a foto.",

    // Configurações
    settings: "Configurações", account: "Conta", privacy: "Privacidade",
    preferences: "Preferências", about: "Sobre", logout: "Sair",
    logoutConfirm: "Deseja encerrar a sessão?", logoutError: "Não foi possível sair. Tente novamente.",
    editProfile: "Editar perfil", editProfileDesc: "Nome, telefone e CPF",
    changePasswordDesc: "Redefina sua senha de acesso", managePlan: "Gerenciar plano",
    shareData: "Compartilhar dados de uso anônimos", shareDataDesc: "Ajuda a melhorar o produto.",
    analyticsCookies: "Cookies de análise", analyticsCookiesDesc: "Usados para medir o desempenho.",
    privacyPolicy: "Política de privacidade", termsOfUse: "Termos de uso",
    biometric: "Autenticação biométrica", biometricDesc: "Use impressão digital ou Face ID para entrar.",
    loginAlerts: "Alertas de login suspeito", loginAlertsDesc: "Notificação ao detectar acesso incomum.",
    pushNotifications: "Notificações push", pushNotificationsDesc: "Receba alertas de segurança no celular.",
    emailNotifications: "Notificações por e-mail", emailNotificationsDesc: "Receba resumo semanal de atividades.",
    language: "Idioma", theme: "Tema", lightMode: "Modo Claro", darkMode: "Modo Escuro",
    version: "Versão", copyright: "© 2026 ASPEN CORE. Todos os direitos reservados.",
    contact: "Fale conosco", instagram: "Instagram",
    deleteAccountShort: "Excluir conta", deleteAccountShortDesc: "Remove permanentemente sua conta e dados",
    securityDigital: "Segurança Digital",
  },

  en: {
    save: "Save changes", cancel: "Cancel", close: "Close", back: "Back",
    loading: "Loading...", error: "Error", success: "Success", confirm: "Confirm",
    attention: "Attention", remove: "Remove", seeAll: "See all", seeMore: "See more",

    planBasico: "Basic", planPadrao: "Standard", planPremium: "Premium",
    free: "Free", active: "Active", noRenewal: "No renewal date",
    currentPlan: "Current plan", status: "Status", nextRenewal: "Next renewal",
    price: "Price", comparePlans: "Compare plans",
    planBasicoDesc: "For personal use with up to 2 devices.",
    planPadraoDesc: "For families and professionals with up to 10 devices.",
    planPremiumDesc: "For teams and companies with unlimited devices.",
    planAtual: "Your current plan", maisPopular: "Most popular",
    ativarAgora: "Activate now", planoAtual: "Current plan",
    voceEstaNoPlano: "You are on the",
    planosSubtitulo: "You are on the free plan. Upgrade to unlock more features.",

    welcome: "Welcome,", securitySummary: "Here is a summary of your digital security.",
    nfcMode: "NFC access mode", nfcDesc: "Bring your phone close to unlock without a password",
    notifications: "Notifications", recentActivity: "Recent activity",
    noRecentActivity: "No recent activity",
    allOnline: "All online", configured: "All configured",
    deviceCount: "DEVICES", subscriptionStatus: "SUBSCRIPTION",
    alertsMonth: "ALERTS", protectionLevel: "PROTECTION", high: "High",
    alertsDown: "↓ 60% from last month",
    plans: "Plans", devices: "Devices",

    notificationsSubtitulo: "Track events on your account.",
    allTab: "All", unreadTab: "Unread", readTab: "Read",
    markAllRead: "Mark all as read", markRead: "Mark as read",
    noNotifications: "No notifications here",

    devicesSubtitulo: "Manage the devices connected to your account.",
    total: "Total", online: "Online", offline: "Offline",
    noDevices: "No devices registered", noDevicesDesc: "Click \"+\" to get started.",
    lastAccess: "Last access:",

    profile: "Profile", personalData: "Personal data", security: "Security",
    payment: "Payment", subscription: "Subscription", fullName: "Full name",
    email: "Email", phone: "Phone", cpf: "Tax ID",
    emailReadOnly: "To change your email, contact support.",
    profileSaved: "Data saved successfully!", profileError: "Could not save data.",
    nameTooShort: "Name must be at least 3 characters.",
    changePassword: "Change password", currentPassword: "Current password",
    newPassword: "New password (min. 8 characters)", confirmPassword: "Confirm new password",
    updatePassword: "Update password", passwordUpdated: "Password updated successfully!",
    passwordWrong: "Current password is incorrect.", passwordWeak: "New password is too weak.",
    passwordError: "Error updating password.", passwordMismatch: "Passwords do not match.",
    passwordTooShort: "New password must be at least 8 characters.",
    fillAllFields: "Fill in all password fields.", dangerZone: "Danger zone",
    deleteAccount: "Delete account",
    deleteAccountDesc: "This action is permanent and irreversible. All your data will be deleted.",
    deleteConfirm: "Enter your password to confirm.", deleting: "Deleting...",
    deleteError: "Error deleting account. Please try again.",
    paymentMethods: "Payment methods", noPayment: "No payment method added",
    noPaymentDesc: "Add a credit card or Pix to use for payments.",
    removeMethod: "Remove method", removeMethodConfirm: "Do you want to remove this payment method?",
    removeError: "Could not remove the method.", cardEnding: "ending in",
    expires: "Expires", default: "Default", subscriptionDetails: "Subscription details",
    changePhoto: "Change photo", removePhoto: "Remove photo", gallery: "Gallery",
    photoError: "Could not select the photo.",

    settings: "Settings", account: "Account", privacy: "Privacy",
    preferences: "Preferences", about: "About", logout: "Sign out",
    logoutConfirm: "Do you want to sign out?", logoutError: "Could not sign out. Please try again.",
    editProfile: "Edit profile", editProfileDesc: "Name, phone and tax ID",
    changePasswordDesc: "Reset your access password", managePlan: "Manage plan",
    shareData: "Share anonymous usage data", shareDataDesc: "Helps improve the product.",
    analyticsCookies: "Analytics cookies", analyticsCookiesDesc: "Used to measure system performance.",
    privacyPolicy: "Privacy policy", termsOfUse: "Terms of use",
    biometric: "Biometric authentication", biometricDesc: "Use fingerprint or Face ID to sign in.",
    loginAlerts: "Suspicious login alerts", loginAlertsDesc: "Notification when unusual access is detected.",
    pushNotifications: "Push notifications", pushNotificationsDesc: "Receive security alerts on your phone.",
    emailNotifications: "Email notifications", emailNotificationsDesc: "Receive weekly activity summary.",
    language: "Language", theme: "Theme", lightMode: "Light mode", darkMode: "Dark mode",
    version: "Version", copyright: "© 2026 ASPEN CORE. All rights reserved.",
    contact: "Contact us", instagram: "Instagram",
    deleteAccountShort: "Delete account", deleteAccountShortDesc: "Permanently removes your account and data",
    securityDigital: "Digital Security",
  },

  es: {
    save: "Guardar cambios", cancel: "Cancelar", close: "Cerrar", back: "Volver",
    loading: "Cargando...", error: "Error", success: "Éxito", confirm: "Confirmar",
    attention: "Atención", remove: "Eliminar", seeAll: "Ver todas", seeMore: "Ver todo",

    planBasico: "Básico", planPadrao: "Estándar", planPremium: "Premium",
    free: "Gratuito", active: "Activo", noRenewal: "Sin fecha de renovación",
    currentPlan: "Plan actual", status: "Estado", nextRenewal: "Próxima renovación",
    price: "Precio", comparePlans: "Comparar planes",
    planBasicoDesc: "Para uso personal con hasta 2 dispositivos.",
    planPadraoDesc: "Para familias y profesionales con hasta 10 dispositivos.",
    planPremiumDesc: "Para equipos y empresas con dispositivos ilimitados.",
    planAtual: "Tu plan actual", maisPopular: "Más popular",
    ativarAgora: "Activar ahora", planoAtual: "Plan actual",
    voceEstaNoPlano: "Estás en el plan",
    planosSubtitulo: "Estás en el plan gratuito. Actualiza para desbloquear más funciones.",

    welcome: "Bienvenido,", securitySummary: "Aquí hay un resumen de tu seguridad digital.",
    nfcMode: "Modo de acceso NFC", nfcDesc: "Acerca el teléfono para desbloquear sin contraseña",
    notifications: "Notificaciones", recentActivity: "Actividad reciente",
    noRecentActivity: "Sin actividad reciente",
    allOnline: "Todos en línea", configured: "Todo configurado",
    deviceCount: "DISPOSITIVOS", subscriptionStatus: "SUSCRIPCIÓN",
    alertsMonth: "ALERTAS", protectionLevel: "PROTECCIÓN", high: "Alto",
    alertsDown: "↓ 60% del mes anterior",
    plans: "Planes", devices: "Dispositivos",

    notificationsSubtitulo: "Sigue los eventos de tu cuenta.",
    allTab: "Todas", unreadTab: "No leídas", readTab: "Leídas",
    markAllRead: "Marcar todas como leídas", markRead: "Marcar leída",
    noNotifications: "No hay notificaciones aquí",

    devicesSubtitulo: "Gestiona los dispositivos conectados a tu cuenta.",
    total: "Total", online: "En línea", offline: "Sin conexión",
    noDevices: "Ningún dispositivo registrado", noDevicesDesc: "Haz clic en \"+\" para comenzar.",
    lastAccess: "Último acceso:",

    profile: "Perfil", personalData: "Datos personales", security: "Seguridad",
    payment: "Pago", subscription: "Suscripción", fullName: "Nombre completo",
    email: "Correo electrónico", phone: "Teléfono", cpf: "Documento",
    emailReadOnly: "Para cambiar el correo, contacta al soporte.",
    profileSaved: "¡Datos guardados con éxito!", profileError: "No se pudieron guardar los datos.",
    nameTooShort: "El nombre debe tener al menos 3 caracteres.",
    changePassword: "Cambiar contraseña", currentPassword: "Contraseña actual",
    newPassword: "Nueva contraseña (mín. 8 caracteres)", confirmPassword: "Confirmar nueva contraseña",
    updatePassword: "Actualizar contraseña", passwordUpdated: "¡Contraseña actualizada con éxito!",
    passwordWrong: "Contraseña actual incorrecta.", passwordWeak: "La nueva contraseña es muy débil.",
    passwordError: "Error al actualizar la contraseña.", passwordMismatch: "Las contraseñas no coinciden.",
    passwordTooShort: "La nueva contraseña debe tener al menos 8 caracteres.",
    fillAllFields: "Complete todos los campos de contraseña.", dangerZone: "Zona de peligro",
    deleteAccount: "Eliminar cuenta",
    deleteAccountDesc: "Esta acción es permanente e irreversible. Todos sus datos serán eliminados.",
    deleteConfirm: "Ingrese su contraseña para confirmar.", deleting: "Eliminando...",
    deleteError: "Error al eliminar la cuenta. Inténtelo de nuevo.",
    paymentMethods: "Métodos de pago", noPayment: "Ningún método registrado",
    noPaymentDesc: "Agregue una tarjeta de crédito o Pix para usar en pagos.",
    removeMethod: "Eliminar método", removeMethodConfirm: "¿Desea eliminar este método de pago?",
    removeError: "No se pudo eliminar el método.", cardEnding: "terminada en",
    expires: "Vence", default: "Predeterminado", subscriptionDetails: "Detalles de la suscripción",
    changePhoto: "Cambiar foto", removePhoto: "Eliminar foto", gallery: "Galería",
    photoError: "No se pudo seleccionar la foto.",

    settings: "Configuración", account: "Cuenta", privacy: "Privacidad",
    preferences: "Preferencias", about: "Acerca de", logout: "Cerrar sesión",
    logoutConfirm: "¿Desea cerrar la sesión?", logoutError: "No se pudo cerrar sesión. Inténtelo de nuevo.",
    editProfile: "Editar perfil", editProfileDesc: "Nombre, teléfono y documento",
    changePasswordDesc: "Restablezca su contraseña de acceso", managePlan: "Administrar plan",
    shareData: "Compartir datos de uso anónimos", shareDataDesc: "Ayuda a mejorar el producto.",
    analyticsCookies: "Cookies de análisis", analyticsCookiesDesc: "Utilizados para medir el rendimiento.",
    privacyPolicy: "Política de privacidad", termsOfUse: "Términos de uso",
    biometric: "Autenticación biométrica", biometricDesc: "Use huella digital o Face ID para iniciar sesión.",
    loginAlerts: "Alertas de inicio de sesión sospechoso", loginAlertsDesc: "Notificación al detectar acceso inusual.",
    pushNotifications: "Notificaciones push", pushNotificationsDesc: "Reciba alertas de seguridad en su teléfono.",
    emailNotifications: "Notificaciones por correo", emailNotificationsDesc: "Reciba resumen semanal de actividades.",
    language: "Idioma", theme: "Tema", lightMode: "Modo claro", darkMode: "Modo oscuro",
    version: "Versión", copyright: "© 2026 ASPEN CORE. Todos los derechos reservados.",
    contact: "Contáctenos", instagram: "Instagram",
    deleteAccountShort: "Eliminar cuenta", deleteAccountShortDesc: "Elimina permanentemente su cuenta y datos",
    securityDigital: "Seguridad Digital",
  },

  fr: {
    save: "Enregistrer les modifications", cancel: "Annuler", close: "Fermer", back: "Retour",
    loading: "Chargement...", error: "Erreur", success: "Succès", confirm: "Confirmer",
    attention: "Attention", remove: "Supprimer", seeAll: "Voir tout", seeMore: "Voir plus",

    planBasico: "Basique", planPadrao: "Standard", planPremium: "Premium",
    free: "Gratuit", active: "Actif", noRenewal: "Sans date de renouvellement",
    currentPlan: "Plan actuel", status: "Statut", nextRenewal: "Prochain renouvellement",
    price: "Prix", comparePlans: "Comparer les plans",
    planBasicoDesc: "Pour usage personnel avec jusqu'à 2 appareils.",
    planPadraoDesc: "Pour les familles et professionnels avec jusqu'à 10 appareils.",
    planPremiumDesc: "Pour les équipes et entreprises avec des appareils illimités.",
    planAtual: "Votre plan actuel", maisPopular: "Le plus populaire",
    ativarAgora: "Activer maintenant", planoAtual: "Plan actuel",
    voceEstaNoPlano: "Vous êtes sur le plan",
    planosSubtitulo: "Vous êtes sur le plan gratuit. Passez à la version supérieure pour débloquer plus de fonctionnalités.",

    welcome: "Bienvenue,", securitySummary: "Voici un résumé de votre sécurité numérique.",
    nfcMode: "Mode d'accès NFC", nfcDesc: "Approchez le téléphone pour déverrouiller sans mot de passe",
    notifications: "Notifications", recentActivity: "Activité récente",
    noRecentActivity: "Aucune activité récente",
    allOnline: "Tous en ligne", configured: "Tout configuré",
    deviceCount: "APPAREILS", subscriptionStatus: "ABONNEMENT",
    alertsMonth: "ALERTES", protectionLevel: "PROTECTION", high: "Élevé",
    alertsDown: "↓ 60% du mois précédent",
    plans: "Plans", devices: "Appareils",

    notificationsSubtitulo: "Suivez les événements de votre compte.",
    allTab: "Toutes", unreadTab: "Non lues", readTab: "Lues",
    markAllRead: "Marquer tout comme lu", markRead: "Marquer comme lu",
    noNotifications: "Aucune notification ici",

    devicesSubtitulo: "Gérez les appareils connectés à votre compte.",
    total: "Total", online: "En ligne", offline: "Hors ligne",
    noDevices: "Aucun appareil enregistré", noDevicesDesc: "Cliquez sur \"+\" pour commencer.",
    lastAccess: "Dernier accès :",

    profile: "Profil", personalData: "Données personnelles", security: "Sécurité",
    payment: "Paiement", subscription: "Abonnement", fullName: "Nom complet",
    email: "E-mail", phone: "Téléphone", cpf: "Document",
    emailReadOnly: "Pour modifier l'e-mail, contactez le support.",
    profileSaved: "Données enregistrées avec succès !", profileError: "Impossible d'enregistrer les données.",
    nameTooShort: "Le nom doit comporter au moins 3 caractères.",
    changePassword: "Modifier le mot de passe", currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe (min. 8 caractères)", confirmPassword: "Confirmer le nouveau mot de passe",
    updatePassword: "Mettre à jour le mot de passe", passwordUpdated: "Mot de passe mis à jour avec succès !",
    passwordWrong: "Mot de passe actuel incorrect.", passwordWeak: "Le nouveau mot de passe est trop faible.",
    passwordError: "Erreur lors de la mise à jour du mot de passe.", passwordMismatch: "Les mots de passe ne correspondent pas.",
    passwordTooShort: "Le nouveau mot de passe doit comporter au moins 8 caractères.",
    fillAllFields: "Remplissez tous les champs de mot de passe.", dangerZone: "Zone de danger",
    deleteAccount: "Supprimer le compte",
    deleteAccountDesc: "Cette action est permanente et irréversible. Toutes vos données seront supprimées.",
    deleteConfirm: "Entrez votre mot de passe pour confirmer.", deleting: "Suppression...",
    deleteError: "Erreur lors de la suppression du compte. Réessayez.",
    paymentMethods: "Méthodes de paiement", noPayment: "Aucune méthode enregistrée",
    noPaymentDesc: "Ajoutez une carte de crédit ou Pix pour les paiements.",
    removeMethod: "Supprimer la méthode", removeMethodConfirm: "Voulez-vous supprimer cette méthode de paiement ?",
    removeError: "Impossible de supprimer la méthode.", cardEnding: "se terminant par",
    expires: "Expire", default: "Par défaut", subscriptionDetails: "Détails de l'abonnement",
    changePhoto: "Changer la photo", removePhoto: "Supprimer la photo", gallery: "Galerie",
    photoError: "Impossible de sélectionner la photo.",

    settings: "Paramètres", account: "Compte", privacy: "Confidentialité",
    preferences: "Préférences", about: "À propos", logout: "Se déconnecter",
    logoutConfirm: "Voulez-vous vous déconnecter ?", logoutError: "Impossible de se déconnecter. Réessayez.",
    editProfile: "Modifier le profil", editProfileDesc: "Nom, téléphone et document",
    changePasswordDesc: "Réinitialisez votre mot de passe", managePlan: "Gérer le plan",
    shareData: "Partager des données d'utilisation anonymes", shareDataDesc: "Aide à améliorer le produit.",
    analyticsCookies: "Cookies analytiques", analyticsCookiesDesc: "Utilisés pour mesurer les performances.",
    privacyPolicy: "Politique de confidentialité", termsOfUse: "Conditions d'utilisation",
    biometric: "Authentification biométrique", biometricDesc: "Utilisez l'empreinte digitale ou Face ID.",
    loginAlerts: "Alertes de connexion suspecte", loginAlertsDesc: "Notification en cas d'accès inhabituel.",
    pushNotifications: "Notifications push", pushNotificationsDesc: "Recevez des alertes de sécurité sur votre téléphone.",
    emailNotifications: "Notifications par e-mail", emailNotificationsDesc: "Recevez un résumé hebdomadaire des activités.",
    language: "Langue", theme: "Thème", lightMode: "Mode clair", darkMode: "Mode sombre",
    version: "Version", copyright: "© 2026 ASPEN CORE. Tous droits réservés.",
    contact: "Nous contacter", instagram: "Instagram",
    deleteAccountShort: "Supprimer le compte", deleteAccountShortDesc: "Supprime définitivement votre compte et vos données",
    securityDigital: "Sécurité Numérique",
  },
};

type TranslationKeys = keyof typeof translations["pt-BR"];

export const THEME_COLORS = {
  light: {
    bg: "#f5f7f8", card: "#ffffff", border: "#e2e8f0",
    text: "#0f172a", textSec: "#64748b", textMuted: "#94a3b8",
    inputBg: "#f8fafc", inputBorder: "#e2e8f0",
    headerBg: "#ffffff", abasBg: "#ffffff", statusBar: "dark" as const,
  },
  dark: {
    bg: "#0f172a", card: "#1e293b", border: "#334155",
    text: "#f1f5f9", textSec: "#94a3b8", textMuted: "#64748b",
    inputBg: "#0f172a", inputBorder: "#334155",
    headerBg: "#1e293b", abasBg: "#1e293b", statusBar: "light" as const,
  },
};

type AppContextType = {
  locale: Locale; setLocale: (l: Locale) => void;
  t: (key: TranslationKeys) => string;
  theme: Theme; setTheme: (t: Theme) => void;
  colors: typeof THEME_COLORS.light | typeof THEME_COLORS.dark;
  photoUri: string | null;
  setPhotoUri: (uri: string | null, uid?: string) => void;
  loadPhotoForUser: (uid: string) => Promise<void>;
};

const AppContext = createContext<AppContextType>({
  locale: "pt-BR", setLocale: () => {},
  t: (key) => key,
  theme: "light", setTheme: () => {},
  colors: THEME_COLORS.light,
  photoUri: null, setPhotoUri: () => {}, loadPhotoForUser: async () => {},
});



export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt-BR");
  const [theme, setThemeState] = useState<Theme>("light");
  const [photoUri, setPhotoUriState] = useState<string | null>(null);

  React.useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("@aspen_locale"),
      AsyncStorage.getItem("@aspen_theme"),
    ]).then(([savedLocale, savedTheme]) => {
      if (savedLocale) setLocaleState(savedLocale as Locale);
      if (savedTheme) setThemeState(savedTheme as Theme);
    });
  }, []);

  async function setLocale(l: Locale) { setLocaleState(l); await AsyncStorage.setItem("@aspen_locale", l); }
  async function setTheme(t: Theme) { setThemeState(t); await AsyncStorage.setItem("@aspen_theme", t); }
  // uid opcional — se passado, salva associado ao usuário
  async function setPhotoUri(uri: string | null, uid?: string) {
    setPhotoUriState(uri);
    const key = uid ? `@aspen_photo_${uid}` : "@aspen_photo_global";
    if (uri) await AsyncStorage.setItem(key, uri);
    else await AsyncStorage.removeItem(key);
  }

  // Carrega a foto do usuário pelo UID após login
  async function loadPhotoForUser(uid: string) {
    try {
      const foto = await AsyncStorage.getItem(`@aspen_photo_${uid}`);
      setPhotoUriState(foto ?? null);
    } catch {
      setPhotoUriState(null);
    }
  }

  function t(key: TranslationKeys): string {
    return translations[locale]?.[key] ?? translations["pt-BR"][key] ?? key;
  }

  const colors = THEME_COLORS[theme];

  return (
    <AppContext.Provider value={{ locale, setLocale, t, theme, setTheme, colors, photoUri, setPhotoUri, loadPhotoForUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useI18n() { return useContext(AppContext); }

export const LOCALE_LABELS: Record<Locale, string> = {
  "pt-BR": "Português (Brasil)", en: "English", es: "Español", fr: "Français",
};