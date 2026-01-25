// ============================================================================
// CONFIGURATION EXPRESS-SESSION
// Sessions stockées en MySQL via Prisma
// ============================================================================

import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';
import type { AuthSecurityConfig } from '../types/auth.types';

// =========================
// CONFIGURATION SÉCURITÉ
// =========================

export const authConfig: AuthSecurityConfig = {
  // Verrouillage après tentatives échouées
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  
  // Expiration session (45 min d'inactivité)
  sessionTimeoutMinutes: 45,
  
  // Hachage mot de passe
  bcryptSaltRounds: 12,
  
  // Politique de mot de passe
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false, // Optionnel pour commencer
  },
  
  // Politique de pseudonyme
  usernamePolicy: {
    minLength: 3,
    maxLength: 30,
    allowedPattern: /^[a-zA-Z0-9_.-]+$/, // Lettres, chiffres, underscore, point, tiret
  },
};

// =========================
// SESSION STORE PRISMA
// =========================

const sessionStore = new PrismaSessionStore(prisma as unknown as PrismaClient, {
  checkPeriod: 2 * 60 * 1000,     // Nettoyage sessions expirées toutes les 2 min
  dbRecordIdIsSessionId: true,    // Utilise l'ID de session comme ID de record
  dbRecordIdFunction: undefined,  // Pas de fonction custom pour l'ID
});

// =========================
// CONFIGURATION SESSION
// =========================

// Vérifie que SESSION_SECRET est défini
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET must be defined in production environment');
}

export const sessionConfig: session.SessionOptions = {
  // Store MySQL via Prisma
  store: sessionStore,
  
  // Secret pour signer le cookie (utiliser variable d'environnement en prod)
  secret: sessionSecret || 'dev-secret-change-in-production',
  
  // Nom du cookie de session
  name: 'everglass.sid',
  
  // Ne pas resauvegarder si non modifié
  resave: false,
  
  // Ne pas créer de session tant que non nécessaire
  saveUninitialized: false,
  
  // Configuration du cookie
  cookie: {
    // Durée de vie : 45 minutes
    maxAge: authConfig.sessionTimeoutMinutes * 60 * 1000,
    
    // httpOnly : inaccessible via JavaScript (protection XSS)
    httpOnly: true,
    
    // secure : HTTPS uniquement en production
    secure: process.env.NODE_ENV === 'production',
    
    // sameSite : protection CSRF
    sameSite: 'lax',
    
    // path : cookie valide pour tout le site
    path: '/',
  },
  
  // Rolling : renouvelle l'expiration à chaque requête (reset 45 min)
  rolling: true,
};

// =========================
// MIDDLEWARE SESSION
// =========================

export const sessionMiddleware = session(sessionConfig);

// =========================
// FONCTIONS UTILITAIRES
// =========================

/**
 * Nettoie manuellement les sessions expirées
 * Utile pour un cron job ou maintenance
 */
export async function cleanExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  return result.count;
}

/**
 * Invalide toutes les sessions d'un utilisateur
 * Utile lors d'un changement de mot de passe ou déconnexion forcée
 */
export async function invalidateUserSessions(userId: number): Promise<number> {
  const sessions = await prisma.session.findMany();
  let count = 0;
  
  for (const session of sessions) {
    try {
      const data = JSON.parse(session.data);
      if (data.userId === userId) {
        await prisma.session.delete({ where: { id: session.id } });
        count++;
      }
    } catch {
      // Session mal formée, on ignore
    }
  }
  
  return count;
}

/**
 * Compte les sessions actives d'un utilisateur
 */
export async function countUserActiveSessions(userId: number): Promise<number> {
  const sessions = await prisma.session.findMany({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },
  });
  
  let count = 0;
  for (const session of sessions) {
    try {
      const data = JSON.parse(session.data);
      if (data.userId === userId) {
        count++;
      }
    } catch {
      // Session mal formée, on ignore
    }
  }
  
  return count;
}

export default sessionMiddleware;


