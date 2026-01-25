// ============================================================================
// EXTENSION DES TYPES EXPRESS
// Enrichit Request avec les données de session et utilisateur
// ============================================================================

import { Employe, Role, Niveau } from '@prisma/client';

// Données utilisateur attachées à la requête (après authentification)
export interface SessionUser {
  id: number;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  niveau: Niveau;
  siegeId: number | null;
  franchiseId: number | null;
  centreId: number | null;
  isActive: boolean;
  mustChangePassword: boolean;
}

// Données stockées dans la session express-session
declare module 'express-session' {
  interface SessionData {
    userId: number;
    user: SessionUser;
    createdAt: number;      // Timestamp de création
    lastActivity: number;   // Timestamp dernière activité
  }
}

// Extension de Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}