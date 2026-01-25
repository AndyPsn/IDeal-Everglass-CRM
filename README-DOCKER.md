# 🚀 Everglass CRM - Configuration Docker

## 📋 Prérequis

- Docker Desktop installé ([Télécharger](https://www.docker.com/products/docker-desktop))
- Git installé
- Node.js 18+ (pour npm en local si besoin)

---

## 🏗️ Structure du projet

```
IDeal-Everglass-CRM/
├── backend/                    # API Express + TypeScript
│   ├── src/
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── Dockerfile.dev
│   ├── .dockerignore
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React + Vite + TypeScript
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile.dev
│   ├── .dockerignore
│   ├── .env.example
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml          # Configuration Docker
└── README.md
```

---

## 🚀 Démarrage rapide (première fois)

### 1. Cloner le projet

```bash
git clone https://github.com/AndyPsn/IDeal-Everglass-CRM.git
cd IDeal-Everglass-CRM
```

### 2. Créer les fichiers .env

**Backend :**
```bash
cd backend
cp .env.example .env
# Éditer .env si nécessaire (normalement OK par défaut)
cd ..
```

**Frontend :**
```bash
cd frontend
cp .env.example .env
# Éditer .env si nécessaire (normalement OK par défaut)
cd ..
```

### 3. Lancer Docker (première fois)

```bash
# Build et démarrer tous les services
docker-compose up --build
```

⏳ **Attendez que tout démarre** (30-60 secondes la première fois)

Vous verrez :
```
✅ everglass-mysql      | ready for connections
✅ everglass-backend    | Server running on port 3000
✅ everglass-frontend   | Local: http://localhost:5173
✅ everglass-phpmyadmin | Apache started
```

### 4. Accéder aux services

| Service | URL | Identifiants |
|---------|-----|--------------|
| **Frontend** | http://localhost:5173 | - |
| **Backend API** | http://localhost:3000 | - |
| **phpMyAdmin** | http://localhost:8080 | root / rootpassword |
| **MySQL** | localhost:3306 | root / rootpassword |

---

## 🔄 Utilisation quotidienne

### Démarrer les services

```bash
# Démarrer en arrière-plan (recommandé)
docker-compose up -d

# Démarrer avec logs visibles
docker-compose up
```

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend

# MySQL uniquement
docker-compose logs -f mysql
```

### Arrêter les services

```bash
# Arrêter (garde les données)
docker-compose down

# Arrêter ET supprimer les volumes (⚠️ perd les données MySQL)
docker-compose down -v
```

### Redémarrer un service spécifique

```bash
# Redémarrer le backend
docker-compose restart backend

# Redémarrer le frontend
docker-compose restart frontend
```

---

## 🛠️ Développement

### Hot Reload automatique

**Backend (Nodemon) :**
- Modifiez `backend/src/server.ts` → Le serveur redémarre automatiquement (1-2 sec)

**Frontend (Vite HMR) :**
- Modifiez `frontend/src/App.tsx` → Le navigateur se rafraîchit instantanément

### Exécuter des commandes dans les containers

```bash
# Installer une nouvelle dépendance backend
docker-compose exec backend npm install express-session

# Installer une nouvelle dépendance frontend
docker-compose exec frontend npm install axios

# Générer le client Prisma
docker-compose exec backend npx prisma generate

# Créer une migration Prisma
docker-compose exec backend npx prisma migrate dev --name add_table_x

# Ouvrir un shell dans le container backend
docker-compose exec backend sh

# Ouvrir un shell dans le container frontend
docker-compose exec frontend sh
```

### Accéder à MySQL depuis votre machine

Vous pouvez utiliser **phpMyAdmin** (http://localhost:8080) ou un client MySQL :

```bash
mysql -h 127.0.0.1 -P 3306 -u root -prootpassword everglass_crm_dev
```

---

## 🔧 Problèmes courants

### Le frontend ne se rafraîchit pas automatiquement

**Solution :** Vérifiez que `usePolling: true` est bien dans `vite.config.ts`

### Erreur "Port already in use"

**Cause :** Un service utilise déjà le port (3000, 5173, 3306, ou 8080)

**Solution :**
```bash
# Voir qui utilise le port 3000
lsof -i :3000

# Tuer le process
kill -9 <PID>

# Ou modifier le port dans docker-compose.yml
```

### Les node_modules ne se mettent pas à jour

**Solution :**
```bash
# Rebuild les images
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### MySQL ne démarre pas

**Solution :**
```bash
# Supprimer le volume et recréer
docker-compose down -v
docker-compose up
```

### Permission denied sur fichiers

**Solution (Linux/Mac) :**
```bash
# Donner les bonnes permissions
sudo chown -R $USER:$USER backend frontend
```

---

## 🧹 Nettoyage

### Supprimer tous les containers et volumes

```bash
docker-compose down -v
```

### Supprimer les images Docker

```bash
docker-compose down --rmi all -v
```

### Nettoyer complètement Docker (⚠️ supprime tout)

```bash
docker system prune -a --volumes
```

---

## 📦 Installation de nouvelles dépendances

### Méthode 1 : Via docker-compose exec (recommandé)

```bash
# Backend
docker-compose exec backend npm install <package>

# Frontend
docker-compose exec frontend npm install <package>
```

### Méthode 2 : Rebuild complet

```bash
# Ajouter le package dans package.json manuellement
# Puis rebuild
docker-compose down
docker-compose build --no-cache backend
docker-compose up
```

---

## 🚀 Prochaines étapes

1. ✅ Configuration Docker terminée
2. ⏭️ Créer le système d'authentification backend
3. ⏭️ Créer l'AuthContext React
4. ⏭️ Implémenter les premières pages du frontend

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : `docker-compose logs -f`
2. Consulter la documentation Docker
3. Vérifier que Docker Desktop est bien lancé

---

## 🔐 Sécurité (Important)

⚠️ **Ne jamais commiter les fichiers .env dans Git**

Ces fichiers sont déjà dans `.gitignore`, mais vérifiez bien :
- `backend/.env`
- `frontend/.env`

En production, utilisez des secrets différents et sécurisés !
