// ============================================================================
// TYPES AUTHENTIFICATION
// Payloads de requêtes, réponses API, et types utilitaires
// ============================================================================

import { Role, Niveau } from '@prisma/client';

// =========================
// PAYLOADS DE REQUÊTES
// =========================

/** Corps de la requête POST /auth/login */
export interface LoginPayload {
  username: string;
  password: string;
}

/** Corps de la requête POST /auth/change-password */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** Corps de la requête POST /auth/reset-password (admin) */
export interface AdminResetPasswordPayload {
  employeId: number;
  newPassword: string;
}

// =========================
// RÉPONSES API
// =========================

/** Réponse standard de l'API */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ValidationError[];
}

/** Erreur de validation */
export interface ValidationError {
  field: string;
  message: string;
}

/** Données utilisateur retournées au client (sans données sensibles) */
export interface UserPublicData {
  id: number;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  role: Role;
  niveau: Niveau;
  siegeId: number | null;
  franchiseId: number | null;
  centreId: number | null;
  dateEmbauche: Date;
  lastLogin: Date | null;
  mustChangePassword: boolean;
}

/** Réponse de login réussie */
export interface LoginResponse {
  user: UserPublicData;
  expiresAt: number; // Timestamp d'expiration de la session
}

/** Réponse de GET /auth/me */
export interface MeResponse {
  user: UserPublicData;
  session: {
    createdAt: number;
    lastActivity: number;
    expiresAt: number;
  };
  permissions: UserPermissions;
}

// =========================
// PERMISSIONS
// =========================

/** Permissions calculées de l'utilisateur */
export interface UserPermissions {
  // Gestion organisationnelle
  canManageFranchises: boolean;
  canManageCentres: boolean;
  canManageEmployes: boolean;
  
  // Gestion des dossiers
  canCreateDossiers: boolean;
  canEditDossiers: boolean;
  canDeleteDossiers: boolean;
  canViewAllDossiers: boolean;
  
  // Gestion du stock
  canManageStock: boolean;
  
  // Statistiques
  canViewStats: boolean;
  canViewAllStats: boolean;
  
  // Périmètre d'accès
  accessibleCentreIds: number[];
  accessibleFranchiseIds: number[];
}

// =========================
// RÉSULTATS DE SERVICE
// =========================

/** Résultat de tentative de login */
export type LoginResult =
  | { success: true; user: UserPublicData }
  | { success: false; error: LoginErrorType; remainingAttempts?: number; lockedUntil?: Date };

/** Types d'erreurs de login */
export type LoginErrorType =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_INACTIVE'
  | 'TOO_MANY_ATTEMPTS';

/** Résultat de changement de mot de passe */
export type ChangePasswordResult =
  | { success: true }
  | { success: false; error: ChangePasswordErrorType };

/** Types d'erreurs de changement de mot de passe */
export type ChangePasswordErrorType =
  | 'INVALID_CURRENT_PASSWORD'
  | 'PASSWORD_TOO_WEAK'
  | 'PASSWORDS_DO_NOT_MATCH'
  | 'SAME_AS_CURRENT';

// =========================
// CONFIGURATION
// =========================

/** Configuration de la politique de mot de passe */
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

/** Configuration de la politique de pseudonyme */
export interface UsernamePolicy {
  minLength: number;
  maxLength: number;
  allowedPattern: RegExp; // Caractères autorisés
}

/** Configuration de sécurité auth */
export interface AuthSecurityConfig {
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
  bcryptSaltRounds: number;
  passwordPolicy: PasswordPolicy;
  usernamePolicy: UsernamePolicy;
}
