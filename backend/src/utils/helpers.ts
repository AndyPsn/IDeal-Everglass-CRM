import { authConfig } from '../config';
import { ValidationError, PasswordPolicy, UsernamePolicy } from '../types';



/**
 * Valide un mot de passe 
 * Retourne un tableau d'erreurs (vide si valide)
 */
export function validatePassword(
  password: string,
  policy: PasswordPolicy = authConfig.passwordPolicy
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!password) {
    errors.push({ field: 'password', message: 'Le mot de passe est requis.' });
    return errors;
  }

  if (password.length < policy.minLength) {
    errors.push({
      field: 'password',
      message: `Le mot de passe doit contenir au moins ${policy.minLength} caractères.`,
    });
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Le mot de passe doit contenir au moins une majuscule.',
    });
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Le mot de passe doit contenir au moins une minuscule.',
    });
  }

  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Le mot de passe doit contenir au moins un chiffre.',
    });
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...).',
    });
  }

  return errors;
}


// Vérifie si un mot de passe est valide
export function isPasswordValid(password: string): boolean {
  return validatePassword(password).length === 0;
}



// Génère un message lisible des exigences du mot de passe
export function getPasswordRequirementsMessage(
  policy: PasswordPolicy = authConfig.passwordPolicy
): string {
  const requirements: string[] = [];

  requirements.push(`${policy.minLength} caractères minimum`);

  if (policy.requireUppercase) {
    requirements.push('une majuscule');
  }

  if (policy.requireLowercase) {
    requirements.push('une minuscule');
  }

  if (policy.requireNumbers) {
    requirements.push('un chiffre');
  }

  if (policy.requireSpecialChars) {
    requirements.push('un caractère spécial (!@#$%^&*...)');
  }

  return `Le mot de passe doit contenir : ${requirements.join(', ')}.`;
}


/**
 * Valide un pseudonyme selon la politique définie
 * Retourne un tableau d'erreurs (vide si valide)
 */
export function validateUsername(
  username: string,
  policy: UsernamePolicy = authConfig.usernamePolicy
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!username) {
    errors.push({ field: 'username', message: 'Le pseudonyme est requis.' });
    return errors;
  }

  if (username.length < policy.minLength) {
    errors.push({
      field: 'username',
      message: `Le pseudonyme doit contenir au moins ${policy.minLength} caractères.`,
    });
  }

  if (username.length > policy.maxLength) {
    errors.push({
      field: 'username',
      message: `Le pseudonyme ne peut pas dépasser ${policy.maxLength} caractères.`,
    });
  }

  if (!policy.allowedPattern.test(username)) {
    errors.push({
      field: 'username',
      message: 'Le pseudonyme ne peut contenir que des lettres, chiffres, tirets (-), points (.) et underscores (_).',
    });
  }

  return errors;
}


/**
 * Vérifie si un pseudonyme est valide (raccourci booléen)
 */
export function isUsernameValid(username: string): boolean {
  return validateUsername(username).length === 0;
}



/**
 * Valide les credentials de création de compte
 */
export function validateCredentials(
  username: string,
  password: string,
  confirmPassword?: string
): ValidationError[] {
  const errors: ValidationError[] = [
    ...validateUsername(username),
    ...validatePassword(password),
  ];

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Les mots de passe ne correspondent pas.',
    });
  }

  return errors;
}



/**
 * Masque partiellement un email pour l'affichage
 * exemple@test.com → exe***@test.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return '***';
  }

  const [local, domain] = email.split('@');
  
  if (!local || !domain) {
    return '***';
  }
  
  const visibleChars = Math.min(3, local.length);
  const masked = local.slice(0, visibleChars) + '***';
  
  return `${masked}@${domain}`;
}



/**
 * Formate un nom complet
 */
export function formatFullName(prenom: string, nom: string): string {
  return `${prenom} ${nom}`.trim();
}

/**
 * Génère un pseudonyme à partir du prénom et nom
 * Jean Dupont → jean.dupont
 */
export function generateUsername(prenom: string, nom: string): string {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9]/g, '');      // Garde uniquement lettres et chiffres

  return `${normalize(prenom)}.${normalize(nom)}`;
}