# Configuration GitHub pour CI/CD Automatique

## 🔧 Étape 1 : Configurer les Secrets GitHub

Tu dois ajouter les secrets suivants à ton repository GitHub :

### Comment ajouter les secrets :
1. Va sur ton repository GitHub
2. Clique sur **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
3. Ajoute chaque secret avec son nom exact

### Secrets Requis :

#### `DOCKERHUB_USERNAME`
- **Valeur** : `mohamedazizsaid`
- **Description** : Ton nom d'utilisateur Docker Hub

#### `DOCKERHUB_TOKEN`
- **Valeur** : [Ton token Docker Hub personnel]
- **Comment l'obtenir** :
  1. Va sur https://hub.docker.com/settings/security
  2. Clique sur **New Access Token**
  3. Donne un nom (ex: "github-actions")
  4. Sélectionne **Read, Write** permissions
  5. Clique **Generate**
  6. Copie le token et ajoute-le comme secret

---

## 📊 Pipeline CI/CD Automatique

### Quand ça se déclenche ?

**Automatiquement** :
- À chaque **push** sur les branches `main` ou `master`

### Stages du Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│ 1️⃣  BUILD (ci.yml)                                          │
│    ├─ Java Build (7 microservices Maven)                   │
│    └─ Node Build (2 services npm)                          │
└────────┬────────────────────────────────────────────────────┘
         │ (Si succès)
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2️⃣  DOCKER BUILD & PUSH (docker.yml)                        │
│    ├─ Build 7 services Java → Docker images                │
│    ├─ Build Frontend → Docker image                        │
│    └─ Push tous les images vers Docker Hub                 │
└────────┬────────────────────────────────────────────────────┘
         │ (Si succès)
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3️⃣  KUBERNETES DEPLOY (k8s-deploy.yml)                      │
│    ├─ Crée namespace micro-platform                        │
│    ├─ Deploy infrastructure (MySQL, Mongo, RabbitMQ, etc)  │
│    ├─ Deploy 9 microservices                               │
│    ├─ Deploy observabilité (SonarQube, Prometheus, Grafana)│
│    └─ Vérifie deployment status                            │
└─────────────────────────────────────────────────────────────┘
```

### Jobs Parallèles dans chaque Stage

#### Stage 1 - Build
- **java-build** : 7 services Matrix
  - eureka
  - gateway
  - microservice_authentification
  - microservice_products
  - microservice_Commande
  - microservice_forum
  - microservice_reclamation

- **node-build** : 2 services Matrix
  - microservice_events
  - E-Commerce Platform Template

#### Stage 2 - Docker
- **build-and-push** : 9 images Matrix
  - eureka:latest
  - gateway:latest
  - microservice_authentification:latest
  - microservice_products:latest
  - microservice_commande:latest
  - microservice_forum:latest
  - microservice_reclamation:latest
  - microservice_events:latest
  - frontend:latest

**Images poussées vers** : `mohamedazizsaid/<service-name>:latest`

#### Stage 3 - K8s Deploy
- Déploie tout sur ta machine **self-hosted runner** (ta machine locale avec Minikube)

---

## 🚀 Utilisation

### Pour déclencher le CI/CD automatiquement :

```bash
# Fais simplement un push sur main ou master
git add .
git commit -m "feat: nouvelle feature"
git push origin main
```

### Ou manuellement (sans passer par Build) :

Tu peux déclencher manuellement chaque workflow via l'interface GitHub :
1. Va sur **Actions** dans ton repository
2. Sélectionne le workflow
3. Clique **Run workflow**

---

## 📱 Visualiser l'Exécution

### En temps réel :
1. Va sur ton repository GitHub → **Actions**
2. Tu verras le pipeline s'exécuter en cascade
3. Clique sur chaque job pour voir les logs détaillés

### Exemple de vue :
```
✅ ci.yml > java-build [7/7 completed]
✅ ci.yml > node-build [2/2 completed]
  ↓
🔄 docker.yml > build-and-push [En cours... 3/9]
  - ✅ eureka:latest pushed
  - ✅ gateway:latest pushed
  - 🔄 microservice_authentification:latest building...
```

---

## ⚙️ Configuration Runner Self-Hosted

**Important** : Le stage 3 (k8s-deploy.yml) s'exécute sur `self-hosted` runner.

### Si tu n'as pas encore de self-hosted runner :

1. Va sur **Settings** → **Actions** → **Runners**
2. Clique **New self-hosted runner**
3. Suis les instructions pour télécharger et configurer sur ta machine
4. Sur ta machine, lance le runner :
   ```bash
   # Dans le dossier du runner
   ./run.sh  # Linux/Mac
   # ou
   run.cmd   # Windows
   ```

**Alternative** : Tu peux changer `runs-on: self-hosted` en `runs-on: ubuntu-latest` dans k8s-deploy.yml, mais ça ne marchera que si ton cluster k8s est accessible depuis GitHub (publique).

---

## 🔍 Troubleshooting

### Le Docker.yml ne démarre pas après Build ?
- Vérifie que tu as les secrets `DOCKERHUB_USERNAME` et `DOCKERHUB_TOKEN` configurés
- Regarde les logs du ci.yml pour vérifier qu'il s'est bien exécuté

### Les images ne se poussent pas sur Docker Hub ?
- Vérifie ton Docker Hub token : https://hub.docker.com/settings/security
- Assure-toi que tu as `Write` permission sur ton Docker Hub

### k8s-deploy échoue ?
- Vérifie que le self-hosted runner est bien connecté à GitHub (`Status: idle`)
- Vérifie que `kubectl` et `minikube` sont bien installés sur ta machine

---

## 📝 Checklist de Configuration

- [ ] ✅ Ajouter secret `DOCKERHUB_USERNAME` = `mohamedazizsaid`
- [ ] ✅ Ajouter secret `DOCKERHUB_TOKEN` = [Ton token]
- [ ] ✅ Configurer self-hosted runner (ou changer `runs-on`)
- [ ] ✅ Faire un test : `git push origin main`
- [ ] ✅ Vérifier l'exécution sur GitHub Actions

---

## 📚 Fichiers Workflows

- [.github/workflows/ci.yml](.github/workflows/ci.yml) - Build verification
- [.github/workflows/docker.yml](.github/workflows/docker.yml) - Docker build & push
- [.github/workflows/k8s-deploy.yml](.github/workflows/k8s-deploy.yml) - Kubernetes deploy

---

**Une fois configuré, ton CI/CD est complètement automatisé ! 🎉**
À chaque push → Build → Docker → K8s Deploy en cascade.
