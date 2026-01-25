import { PrismaClient } from '@prisma/client';

// Évite les instances multiples en développement (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configuration du logging selon l'environnement
const prismaClientOptions = {
  log:
    process.env.NODE_ENV === 'development'
      ? [
          { level: 'query' as const, emit: 'event' as const },
          { level: 'error' as const, emit: 'stdout' as const },
          { level: 'warn' as const, emit: 'stdout' as const },
        ]
      : [
          { level: 'error' as const, emit: 'stdout' as const },
        ],
};

// Création de l'instance
export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

// Log des requêtes en développement (optionnel, décommenter si besoin)
// if (process.env.NODE_ENV === 'development') {
//   prisma.$on('query', (e) => {
//     console.log('Query: ' + e.query);
//     console.log('Params: ' + e.params);
//     console.log('Duration: ' + e.duration + 'ms');
//   });
// }

// Sauvegarde pour le hot reload en développement
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Fonction de déconnexion propre (pour les tests et shutdown)
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

// Fonction de vérification de connexion
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default prisma;