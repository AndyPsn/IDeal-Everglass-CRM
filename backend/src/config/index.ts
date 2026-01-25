// ============================================================================
// INDEX CONFIGURATION
// Point d'entrée unique pour toute la configuration
// ============================================================================

// Prisma
export { prisma, disconnectPrisma, checkDatabaseConnection } from './prisma';

// Session
export {
  sessionMiddleware,
  sessionConfig,
  authConfig,
  cleanExpiredSessions,
  invalidateUserSessions,
  countUserActiveSessions,
} from './session';

// Réexport des types de config
export type { AuthSecurityConfig, PasswordPolicy } from '../types/auth.types';