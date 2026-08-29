"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "es" | "en" | "pt";

export interface Translations {
  // Brand
  brandName: string;
  brandTagline: string;
  
  // Navbar
  signIn: string;
  signUp: string;
  themeToggle: string;
  languageSelect: string;
  
  // Hero Left
  serviceStatus: string;
  heroTitle1: string;
  heroTitle2: string;
  heroTitleHighlight: string;
  heroDescription: string;
  
  // 4 Features
  featureProtectedAccess: string;
  featureCentralizedManagement: string;
  featureRealtimeLicenses: string;
  featureClearControl: string;
  
  // Stats
  statActiveSessions: string;
  statActiveLicenses: string;
  statApiStatus: string;
  statOnline: string;
  
  // Hero Footer
  encryptedConnection: string;
  builtForTeams: string;
  
  // Right Card - Common
  securityNotice: string;
  oauthDiscord: string;
  oauthGoogle: string;
  
  // Right Card - Login
  loginBadge: string;
  loginTitle: string;
  loginSubtitle: string;
  savedAccounts: string;
  savedAccountsHint: string;
  resellerAccess: string;
  adminAccess: string;
  userLabel: string;
  userPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  rememberUser: string;
  forgotPassword: string;
  signInButton: string;
  loggingIn: string;
  loginOauthDivider: string;
  noAccountPrompt: string;
  noAccountLink: string;
  
  // Right Card - Register
  registerBadge: string;
  registerTitle: string;
  registerSubtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  signUpButton: string;
  creatingAccount: string;
  registerOauthDivider: string;
  hasAccountPrompt: string;
  hasAccountLink: string;
  
  // Errors / Alerts
  errPasswordMismatch: string;
  errPasswordLength: string;
  errUsernameLength: string;
  errInvalidEmail: string;
  errServer: string;
  errNetwork: string;

  // ── DASHBOARD TRANSLATIONS ──
  dashboardTitle: string;
  dashboardWelcome: string;
  dashboardDesc: string;
  quickActions: string;
  createLicense: string;
  createUser: string;
  viewResources: string;
  osTitle: string;
  selectedApp: string;
  currentPlan: string;
  activeSessions: string;
  statusActive: string;
  totalApps: string;
  totalUsers: string;
  totalLicenses: string;
  recentActivity: string;
  featuredApps: string;

  // Sidebar
  navGeneral: string;
  navCommandCenter: string;
  navManageApps: string;
  navBuilder: string;
  navTools: string;
  navHexConverter: string;
  navManagement: string;
  navLicenses: string;
  navUsers: string;
  navSubscriptions: string;
  navSubResellers: string;
  navSessions: string;
  navVariables: string;
  navCredits: string;
  navGlobalChat: string;
  navAccount: string;
  navProfile: string;
  navSecurity: string;
  navUpgradePlan: string;
  navResources: string;
  navSettings: string;
  logout: string;
}

export const translations: Record<Language, Translations> = {
  es: {
    brandName: "SecureX Auth",
    brandTagline: "SECURE ACCESS",
    
    signIn: "Iniciar sesion",
    signUp: "Registrarse",
    themeToggle: "Cambiar tema",
    languageSelect: "Español",
    
    serviceStatus: "SERVICIO OPERATIVO",
    heroTitle1: "Tus accesos,",
    heroTitle2: "licencias y apps",
    heroTitleHighlight: "bajo control.",
    heroDescription: "Un espacio seguro para administrar autenticación, clientes y suscripciones con la claridad que tu negocio necesita.",
    
    featureProtectedAccess: "Acceso protegido",
    featureCentralizedManagement: "Gestión centralizada",
    featureRealtimeLicenses: "Licencias en tiempo real",
    featureClearControl: "Control claro del negocio",
    
    statActiveSessions: "SESIONES ACTIVAS",
    statActiveLicenses: "LICENCIAS ACTIVAS",
    statApiStatus: "ESTADO DE LA API",
    statOnline: "ONLINE",
    
    encryptedConnection: "Conexión cifrada",
    builtForTeams: "Creado para equipos en crecimiento",
    
    securityNotice: "Tus credenciales viajan mediante una conexión cifrada y están protegidas por controles de sesión seguros.",
    oauthDiscord: "Discord",
    oauthGoogle: "Google",
    
    loginBadge: "SECUREX AUTH",
    loginTitle: "Bienvenido de vuelta",
    loginSubtitle: "Inicia sesión para continuar",
    savedAccounts: "Cuentas guardadas",
    savedAccountsHint: "Selecciona una cuenta guardada para entrar más rápido.",
    resellerAccess: "Acceso vendedor",
    adminAccess: "Acceso desarrollador",
    userLabel: "Usuario",
    userPlaceholder: "Ingresa tu usuario",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Ingresa tu contraseña",
    rememberUser: "Recordar usuario",
    forgotPassword: "¿Olvidaste la contraseña?",
    signInButton: "Entrar",
    loggingIn: "Iniciando sesión...",
    loginOauthDivider: "SECUREX AUTH OAUTH",
    noAccountPrompt: "¿No tienes una cuenta?",
    noAccountLink: "Registrarse",
    
    registerBadge: "SECUREX AUTH",
    registerTitle: "Crear cuenta",
    registerSubtitle: "Regístrate y verifica tu correo para entrar.",
    emailLabel: "Correo",
    emailPlaceholder: "tu@correo.com",
    confirmPasswordLabel: "Confirmar contraseña",
    confirmPasswordPlaceholder: "Repite tu contraseña",
    signUpButton: "Crear cuenta",
    creatingAccount: "Creando cuenta...",
    registerOauthDivider: "REGÍSTRATE CON OAUTH",
    hasAccountPrompt: "¿Ya tienes una cuenta?",
    hasAccountLink: "Iniciar sesion",
    
    errPasswordMismatch: "Las contraseñas no coinciden",
    errPasswordLength: "La contraseña debe tener al menos 5 caracteres",
    errUsernameLength: "El usuario debe tener al menos 3 caracteres",
    errInvalidEmail: "Por favor ingresa un correo electrónico válido",
    errServer: "Error al procesar la solicitud",
    errNetwork: "Error de conexión con el servidor",

    // Dashboard
    dashboardTitle: "CENTRO DE MANDO",
    dashboardWelcome: "Bienvenido, Newdavis García",
    dashboardDesc: "Tu panel está activo y listo para operar con el nuevo dominio oficial de SecureX Auth.",
    quickActions: "ACCESOS RÁPIDOS",
    createLicense: "Crear Licencia",
    createUser: "Crear usuario",
    viewResources: "Ver recursos",
    osTitle: "SISTEMA OPERATIVO SecureX Auth",
    selectedApp: "APP SELECCIONADA",
    currentPlan: "PLAN ACTUAL",
    activeSessions: "SESIONES ACTIVAS",
    statusActive: "Activa",
    totalApps: "TOTAL APLICACIONES",
    totalUsers: "TOTAL USUARIOS",
    totalLicenses: "TOTAL LICENCIAS",
    recentActivity: "Actividad reciente",
    featuredApps: "Apps destacadas",

    // Sidebar
    navGeneral: "GENERAL",
    navCommandCenter: "Centro de Mando",
    navManageApps: "Gestionar apps",
    navBuilder: "Builder",
    navTools: "HERRAMIENTAS",
    navHexConverter: "Convertidor Hex",
    navManagement: "GESTION",
    navLicenses: "Licencias",
    navUsers: "Usuarios",
    navSubscriptions: "Suscripciones",
    navSubResellers: "Sub-resellers",
    navSessions: "Sesiones",
    navVariables: "Variables",
    navCredits: "Créditos",
    navGlobalChat: "Chat Global",
    navAccount: "CUENTA",
    navProfile: "Cuenta / Perfil",
    navSecurity: "Seguridad (2FA)",
    navUpgradePlan: "⚡ Mejorar Plan",
    navResources: "Recursos",
    navSettings: "Configuración",
    logout: "Cerrar sesión",
  },
  en: {
    brandName: "SecureX Auth",
    brandTagline: "SECURE ACCESS",
    
    signIn: "Sign in",
    signUp: "Register",
    themeToggle: "Toggle theme",
    languageSelect: "English",
    
    serviceStatus: "SERVICE OPERATIONAL",
    heroTitle1: "Your access,",
    heroTitle2: "licenses and apps",
    heroTitleHighlight: "under control.",
    heroDescription: "A secure space to manage authentication, clients, and subscriptions with the clarity your business needs.",
    
    featureProtectedAccess: "Protected access",
    featureCentralizedManagement: "Centralized management",
    featureRealtimeLicenses: "Real-time licenses",
    featureClearControl: "Clear business control",
    
    statActiveSessions: "ACTIVE SESSIONS",
    statActiveLicenses: "ACTIVE LICENSES",
    statApiStatus: "API STATUS",
    statOnline: "ONLINE",
    
    encryptedConnection: "Encrypted connection",
    builtForTeams: "Built for growing teams",
    
    securityNotice: "Your credentials travel through an encrypted connection and are protected by secure session controls.",
    oauthDiscord: "Discord",
    oauthGoogle: "Google",
    
    loginBadge: "SECUREX AUTH",
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to continue",
    savedAccounts: "Saved accounts",
    savedAccountsHint: "Select a saved account to sign in faster.",
    resellerAccess: "Reseller access",
    adminAccess: "Developer access",
    userLabel: "Username",
    userPlaceholder: "Enter your username",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    rememberUser: "Remember user",
    forgotPassword: "Forgot password?",
    signInButton: "Sign In",
    loggingIn: "Signing in...",
    loginOauthDivider: "SECUREX AUTH OAUTH",
    noAccountPrompt: "Don't have an account?",
    noAccountLink: "Register",
    
    registerBadge: "SECUREX AUTH",
    registerTitle: "Create account",
    registerSubtitle: "Register and verify your email to get started.",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    confirmPasswordLabel: "Confirm password",
    confirmPasswordPlaceholder: "Repeat your password",
    signUpButton: "Create account",
    creatingAccount: "Creating account...",
    registerOauthDivider: "REGISTER WITH OAUTH",
    hasAccountPrompt: "Already have an account?",
    hasAccountLink: "Sign in",
    
    errPasswordMismatch: "Passwords do not match",
    errPasswordLength: "Password must be at least 5 characters",
    errUsernameLength: "Username must be at least 3 characters",
    errInvalidEmail: "Please enter a valid email address",
    errServer: "Error processing request",
    errNetwork: "Network connection error",

    // Dashboard
    dashboardTitle: "COMMAND CENTER",
    dashboardWelcome: "Welcome, Newdavis García",
    dashboardDesc: "Your panel is active and ready to operate with the official SecureX Auth domain.",
    quickActions: "QUICK ACCESS",
    createLicense: "Create License",
    createUser: "Create user",
    viewResources: "View resources",
    osTitle: "OPERATING SYSTEM SecureX Auth",
    selectedApp: "SELECTED APP",
    currentPlan: "CURRENT PLAN",
    activeSessions: "ACTIVE SESSIONS",
    statusActive: "Active",
    totalApps: "TOTAL APPLICATIONS",
    totalUsers: "TOTAL USERS",
    totalLicenses: "TOTAL LICENSES",
    recentActivity: "Recent activity",
    featuredApps: "Featured apps",

    // Sidebar
    navGeneral: "GENERAL",
    navCommandCenter: "Command Center",
    navManageApps: "Manage apps",
    navBuilder: "Builder",
    navTools: "TOOLS",
    navHexConverter: "Hex Converter",
    navManagement: "MANAGEMENT",
    navLicenses: "Licenses",
    navUsers: "Users",
    navSubscriptions: "Subscriptions",
    navSubResellers: "Sub-resellers",
    navSessions: "Sessions",
    navVariables: "Variables",
    navCredits: "Credits",
    navGlobalChat: "Global Chat",
    navAccount: "ACCOUNT",
    navProfile: "Account / Profile",
    navSecurity: "Security (2FA)",
    navUpgradePlan: "⚡ Upgrade Plan",
    navResources: "Resources",
    navSettings: "Settings",
    logout: "Log out",
  },
  pt: {
    brandName: "SecureX Auth",
    brandTagline: "SECURE ACCESS",
    
    signIn: "Iniciar sessão",
    signUp: "Registrar-se",
    themeToggle: "Alternar tema",
    languageSelect: "Português",
    
    serviceStatus: "SERVIÇO OPERACIONAL",
    heroTitle1: "Seus acessos,",
    heroTitle2: "licenças e apps",
    heroTitleHighlight: "sob controle.",
    heroDescription: "Um espaço seguro para gerenciar autenticação, clientes e assinaturas com a clareza que o seu negócio precisa.",
    
    featureProtectedAccess: "Acesso protegido",
    featureCentralizedManagement: "Gestão centralizada",
    featureRealtimeLicenses: "Licenças em tempo real",
    featureClearControl: "Controle claro do negócio",
    
    statActiveSessions: "SESSÕES ATIVAS",
    statActiveLicenses: "LICENÇAS ATIVAS",
    statApiStatus: "STATUS DA API",
    statOnline: "ONLINE",
    
    encryptedConnection: "Conexão criptografada",
    builtForTeams: "Criado para equipes em crescimento",
    
    securityNotice: "Suas credenciais viajam por meio de uma conexão criptografada e estão protegidas por controles de sessão seguros.",
    oauthDiscord: "Discord",
    oauthGoogle: "Google",
    
    loginBadge: "SECUREX AUTH",
    loginTitle: "Bem-vindo de volta",
    loginSubtitle: "Inicie sessão para continuar",
    savedAccounts: "Contas salvas",
    savedAccountsHint: "Selecione uma conta salva para entrar mais rápido.",
    resellerAccess: "Acesso de vendedor",
    adminAccess: "Acesso de desenvolvedor",
    userLabel: "Usuário",
    userPlaceholder: "Digite seu usuário",
    passwordLabel: "Senha",
    passwordPlaceholder: "Digite sua senha",
    rememberUser: "Lembrar usuário",
    forgotPassword: "Esqueceu a senha?",
    signInButton: "Entrar",
    loggingIn: "Iniciando sessão...",
    loginOauthDivider: "SECUREX AUTH OAUTH",
    noAccountPrompt: "Não tem uma conta?",
    noAccountLink: "Registrar-se",
    
    registerBadge: "SECUREX AUTH",
    registerTitle: "Criar conta",
    registerSubtitle: "Cadastre-se e verifique seu e-mail para entrar.",
    emailLabel: "E-mail",
    emailPlaceholder: "seu@email.com",
    confirmPasswordLabel: "Confirmar senha",
    confirmPasswordPlaceholder: "Repita sua senha",
    signUpButton: "Criar conta",
    creatingAccount: "Criando conta...",
    registerOauthDivider: "REGISTRE-SE COM OAUTH",
    hasAccountPrompt: "Já tem uma conta?",
    hasAccountLink: "Iniciar sessão",
    
    errPasswordMismatch: "As senhas não coincidem",
    errPasswordLength: "A senha deve ter pelo menos 5 caracteres",
    errUsernameLength: "O usuário deve ter pelo menos 3 caracteres",
    errInvalidEmail: "Por favor insira um e-mail válido",
    errServer: "Erro ao processar solicitação",
    errNetwork: "Erro de conexão de rede",

    // Dashboard
    dashboardTitle: "CENTRO DE CONTROLE",
    dashboardWelcome: "Bem-vindo, Newdavis García",
    dashboardDesc: "Seu painel está ativo e pronto para operar com o domínio oficial da SecureX Auth.",
    quickActions: "ACESSOS RÁPIDOS",
    createLicense: "Criar Licença",
    createUser: "Criar usuário",
    viewResources: "Ver recursos",
    osTitle: "SISTEMA OPERACIONAL SecureX Auth",
    selectedApp: "APP SELECIONADO",
    currentPlan: "PLANO ATUAL",
    activeSessions: "SESSÕES ATIVAS",
    statusActive: "Ativa",
    totalApps: "TOTAL DE APLICATIVOS",
    totalUsers: "TOTAL DE USUÁRIOS",
    totalLicenses: "TOTAL DE LICENÇAS",
    recentActivity: "Atividade recente",
    featuredApps: "Apps em destaque",

    // Sidebar
    navGeneral: "GERAL",
    navCommandCenter: "Centro de Controle",
    navManageApps: "Gerenciar apps",
    navBuilder: "Builder",
    navTools: "FERRAMENTAS",
    navHexConverter: "Conversor Hex",
    navManagement: "GESTÃO",
    navLicenses: "Licenças",
    navUsers: "Usuários",
    navSubscriptions: "Assinaturas",
    navSubResellers: "Sub-resellers",
    navSessions: "Sessões",
    navVariables: "Variáveis",
    navCredits: "Créditos",
    navGlobalChat: "Chat Global",
    navAccount: "CONTA",
    navProfile: "Conta / Perfil",
    navSecurity: "Segurança (2FA)",
    navUpgradePlan: "⚡ Melhorar Plano",
    navResources: "Recursos",
    navSettings: "Configurações",
    logout: "Sair da conta",
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "es",
  setLang: () => {},
  t: translations.es,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("es");

  useEffect(() => {
    const saved = localStorage.getItem("ra_language") as Language;
    if (saved && (saved === "es" || saved === "en" || saved === "pt")) {
      setLangState(saved);
    }

    const handleLangEvent = (e: any) => {
      if (e.detail && (e.detail === "es" || e.detail === "en" || e.detail === "pt")) {
        setLangState(e.detail);
      }
    };
    window.addEventListener("ra_language_change", handleLangEvent);
    return () => window.removeEventListener("ra_language_change", handleLangEvent);
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("ra_language", l);
    window.dispatchEvent(new CustomEvent("ra_language_change", { detail: l }));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
