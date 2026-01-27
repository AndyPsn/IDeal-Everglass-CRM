// Erreurs possibles

import { ValidationError } from "@/types"

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details: Record<string, unknown> | undefined;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);

    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details ?? undefined;

    Error.captureStackTrace(this, this.constructor);

    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Formate l'erreur pour la réponse API
   */
  toJSON() {
    const response: {
      success: boolean;
      error: {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
      };
    } = {
      success: false,
      error: {
        code: this.code,
        message: this.message,
      },
    };

    if (this.details !== undefined) {
      response.error.details = this.details;
    }

    return response;
  }
}

// 1 - Identifiant ou mot de passe incorrect
// En fonction de l'username et du mot de passe contenu dans la requête on fait un comparatif avec un utilisateur recherché en base
export class InvalidCredentialsError extends AppError{
    constructor(remainingAttemps?:number){
        const message = remainingAttemps !== undefined
        ? `Identifiant ou mot de passe incorrect ${remainingAttemps} tentative(s) restante(s).`
        :'Identifiant ou mot de passe incorrect. ';

        super(
            message,
            'INVALID_CREDENTIALS',
            401,
            remainingAttemps !== undefined ? { remainingAttemps } : undefined
        );
    }
}

// 2 - Compte bloqué nombre de tentatives trop élevé
export class AccountLockedError extends AppError {
  constructor(lockoutDurationMin?: number, lockedUntil?: Date) {
    let message: string;

    if (lockedUntil) {
      const timeStr = lockedUntil.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      message = `Compte verrouillé suite à trop de tentatives. Réessayez après ${timeStr}.`;
    } else if (lockoutDurationMin !== undefined) {
      message = `Compte verrouillé pendant ${lockoutDurationMin} minute(s).`;
    } else {
      message = 'Compte temporairement verrouillé suite à trop de tentatives.';
    }

    super(
      message,
      'ACCOUNT_LOCKED',
      423, // 423 Locked (WebDAV) ou 401 Unauthorized
      {
        ...(lockoutDurationMin !== undefined && { lockoutDurationMin }),
        ...(lockedUntil && { lockedUntil: lockedUntil.toISOString() }),
      }
    );
  }
}


// 3 - Compte inactif bloqué par un administrateur
export class AccountInactiveError extends AppError {
  constructor(reason?: string) {
    const message = reason 
      ? `Votre compte a été désactivé : ${reason}`
      : 'Votre compte a été désactivé. Contactez un administrateur.';

    super(
      message,
      'ACCOUNT_INACTIVE',
      403,
      reason ? { reason } : undefined
    );
  }
} 

// 4 - Session expirée
export class ExpiredSession extends AppError {
    constructor(inactiveTimeDuration?:number){
        const message = inactiveTimeDuration !== undefined
        ? `Le compte à été inactif pendant ${inactiveTimeDuration} minutes vous avez été deconnecté`
        : 'Le compte est rester inactif trop longtemps vous avez été deconnecté';

        super(
            message,
            'SESSION_EXPIRED',
            401,
            inactiveTimeDuration !== undefined ? { inactiveTimeDuration } : undefined
        )
    }
}

// 5 - Pas Authentifié
export class NotAuthenticatedError extends AppError {
  constructor() {
    super(
      'Authentification requise. Veuillez vous connecter.',
      'NOT_AUTHENTICATED',
      401
    );
  }
}


// 6 - Nombre de sessions maximal atteind
export class MaxSessionsReachedError extends AppError {
  constructor(maxSessions: number, currentSessions?: number) {
    const message = `Limite de ${maxSessions} session(s) active(s) atteinte. Déconnectez-vous d'un autre appareil pour continuer.`;

    super(
      message,
      'MAX_SESSIONS_REACHED',
      429,
      { 
        maxSessions,
        ...(currentSessions !== undefined && { currentSessions })
      }
    );
  }
}

// 7 - Changement de mot de passe requis 
export class PasswordChangeRequiredError extends AppError {
  constructor(reason: 'first_login' | 'admin_reset' = 'first_login') {
    const messages = {
      first_login: 'Première connexion : veuillez définir votre mot de passe personnel.',
      admin_reset: 'Votre mot de passe a été réinitialisé. Veuillez en définir un nouveau.',
    };

    super(
      messages[reason],
      'PASSWORD_CHANGE_REQUIRED',
      403,
      { reason }
    );
  }
}

// 8 - Rôle l'utilisateur inconnu
export class InvalidRoleError extends AppError {
  constructor(role?: string) {
    const message = role
      ? `Le rôle "${role}" n'est pas reconnu ou n'est pas autorisé pour cette action.`
      : 'Rôle utilisateur invalide ou non reconnu.';

    super(
      message,
      'INVALID_ROLE',
      403,
      role ? { providedRole: role } : undefined
    );
  }
}

// 9 - Niveau hiérarchique invalide ou non reconnu
export class InvalidNiveauError extends AppError {
  constructor(niveau?: string) {
    const message = niveau
      ? `Le niveau "${niveau}" n'est pas reconnu ou n'est pas autorisé pour cette action.`
      : 'Niveau hiérarchique invalide ou non reconnu.';

    super(
      message,
      'INVALID_NIVEAU',
      403,
      niveau ? { providedNiveau: niveau } : undefined
    );
  }
}

// 10 - Rôle insuffisant pour effectuer cette action
export class InsufficientRoleError extends AppError {
  constructor(requiredRoles: string[], currentRole?: string) {
    const rolesStr = requiredRoles.join(', ');
    const message = currentRole
      ? `Rôle insuffisant. Votre rôle "${currentRole}" ne permet pas cette action. Rôles requis : ${rolesStr}.`
      : `Rôle insuffisant pour cette action. Rôles requis : ${rolesStr}.`;

    super(
      message,
      'INSUFFICIENT_ROLE',
      403,
      {
        requiredRoles,
        ...(currentRole && { currentRole }),
      }
    );
  }
}

// 11 - Accès refusé à ce centre
export class CentreAccessDeniedError extends AppError {
  constructor(centreId?: number, centreName?: string) {
    let message: string;

    if (centreName) {
      message = `Vous n'avez pas accès au centre "${centreName}".`;
    } else if (centreId) {
      message = `Vous n'avez pas accès au centre #${centreId}.`;
    } else {
      message = 'Vous n\'avez pas accès à ce centre.';
    }

    super(
      message,
      'CENTRE_ACCESS_DENIED',
      403,
      {
        ...(centreId !== undefined && { centreId }),
        ...(centreName && { centreName }),
      }
    );
  }
}

// 11 - Accès refusé à cette franchise
export class FranchiseAccessDeniedError extends AppError {
  constructor(franchiseId?: number, franchiseName?: string) {
    let message: string;

    if (franchiseName) {
      message = `Vous n'avez pas accès à la franchise "${franchiseName}".`;
    } else if (franchiseId) {
      message = `Vous n'avez pas accès à la franchise #${franchiseId}.`;
    } else {
      message = 'Vous n\'avez pas accès à cette franchise.';
    }

    super(
      message,
      'FRANCHISE_ACCESS_DENIED',
      403,
      {
        ...(franchiseId !== undefined && { franchiseId }),
        ...(franchiseName && { franchiseName }),
      }
    );
  }
}

// 12 - Action non autorisée (accès page interdit)
export class ForbiddenError extends AppError {
  constructor(action?: string, resource?: string) {
    let message: string;

    if (action && resource) {
      message = `Vous n'êtes pas autorisé à ${action} sur ${resource}.`;
    } else if (action) {
      message = `Vous n'êtes pas autorisé à ${action}.`;
    } else if (resource) {
      message = `Vous n'avez pas accès à ${resource}.`;
    } else {
      message = 'Vous n\'êtes pas autorisé à effectuer cette action.';
    }

    super(
      message,
      'FORBIDDEN',
      403,
      {
        ...(action && { action }),
        ...(resource && { resource }),
      }
    );
  }
}

// 13 - Accès aux statistiques refusé
export class StatsAccessDeniedError extends AppError {
  constructor(statsType?: 'centre' | 'franchise' | 'global' | 'employe', targetId?: number) {
    const statsLabels: Record<string, string> = {
      centre: 'du centre',
      franchise: 'de la franchise',
      global: 'globales',
      employe: 'de cet employé',
    };

    let message: string;

    if (statsType) {
      message = `Vous n'avez pas accès aux statistiques ${statsLabels[statsType]}.`;
    } else {
      message = 'Vous n\'avez pas accès à ces statistiques.';
    }

    super(
      message,
      'STATS_ACCESS_DENIED',
      403,
      {
        ...(statsType && { statsType }),
        ...(targetId !== undefined && { targetId }),
      }
    );
  }
}


//  14 - Données de la requêtes invalides
export class ValidationErrorException extends AppError {
    public readonly errors: ValidationError[];

    constructor(errors: ValidationError[]){
        const fieldNames = errors.map((e)=> e.field).join(', ');
        const message = `Données invalides : ${fieldNames}`;

        super(message, 'VALIDATION_ERROR', 400, { errors });
        
        this.errors = errors; 
    }

    static singleField(field:string, message:string): ValidationErrorException {
        return new ValidationErrorException([{ field, message }]);
    }


    static fromObject(errors:Record<string, string>): ValidationErrorException {
        const validationErrors: ValidationError[] = Object.entries(errors).map(
            ([field, message]) => ({ field,message })
        );
        return new ValidationErrorException(validationErrors);
    }

    toJSON() {
        return { 
            success: false,
            error: { 
                code: this.code, 
                message: this.message, 
                errors: this.errors,
            },
        };

    }
        
} 


// 15 - Le mot de passe ne respecte pas la politique établie
export class ValidationPasswordError extends AppError{
    public readonly errors: ValidationError[];

    constructor(errors: ValidationError[], password: string){
        
         
    }
}
