# 📋 SYSTÈME DE RECOMMANDATIONS - GUIDE COMPLET

## 🎯 Vue d'ensemble

Système de recommandations personnalisées basé sur les interactions utilisateur (clics + favoris).  
L'algorithme recommande des produits similaires par **catégorie** et **tags**.

---

## 📊 Architecture du système

### Nouvelles entités créées

1. **ProductInteraction**
   - Stocke chaque interaction (CLICK ou FAVORITE)
   - Lie user_id (Keycloak) + product_id + type + timestamp

2. **Product** (enrichi)
   - Ajout du champ `tags` (Set<String>)
   - Permet la similarité par tags

3. **InteractionType** (enum)
   - CLICK : clic sur un produit
   - FAVORITE : ajout aux favoris

---

## 🔗 API Endpoints créés

### 1️⃣ POST /api/products/{id}/click
**Enregistrer un clic sur un produit**

**Auth:** ✅ Requiert JWT (userId extrait du token)

**Exemple:**
```bash
POST http://localhost:8085/api/products/3/click
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "message": "Clic enregistré avec succès",
  "productId": "3",
  "userId": "abc-123-keycloak-uuid"
}
```

**Cas d'usage:**
- Le front appelle cet endpoint quand un user clique sur une fiche produit
- Enregistre dans la table `product_interactions`

---

### 2️⃣ POST /api/products/{id}/favorite
**Enregistrer un ajout aux favoris (interaction)**

**Auth:** ✅ Requiert JWT

**Exemple:**
```bash
POST http://localhost:8085/api/products/5/favorite
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "message": "Favori enregistré avec succès",
  "productId": "5",
  "userId": "abc-123-keycloak-uuid"
}
```

**Cas d'usage:**
- Le front appelle `/api/products/favorites/{id}` (endpoint existant) pour ajouter aux favoris
- Le `FavoriteService` appelle automatiquement `recordFavorite()` pour enregistrer l'interaction
- **Tu n'as PAS besoin d'appeler cet endpoint directement si tu utilises déjà `/favorites/{id}`**

---

### 3️⃣ GET /api/products/recommendations
**Recommandations personnalisées**

**Auth:** ✅ Requiert JWT

**Paramètres:**
- `limit` (optionnel, défaut: 10) : nombre max de produits à retourner

**Exemple:**
```bash
GET http://localhost:8085/api/products/recommendations?limit=5
Authorization: Bearer {token}
```

**Réponse:**
```json
[
  {
    "id": 12,
    "name": "iPhone 15 Pro",
    "description": "...",
    "category": "ELECTRONICS",
    "price": 1299.99,
    "imageUrl": "...",
    "stock": 50,
    "status": true,
    "tags": ["smartphone", "apple", "5g"]
  },
  {
    "id": 8,
    "name": "Samsung Galaxy S24",
    "category": "ELECTRONICS",
    "tags": ["smartphone", "samsung", "android"]
  }
]
```

**Algorithme de recommandation:**

1. Si l'utilisateur a **0 interactions** → retourne les produits populaires
2. Sinon:
   - Récupère les catégories + tags des produits avec lesquels il a interagi
   - **Priorité 1** : Produits avec des tags similaires (sauf ceux déjà vus)
   - **Priorité 2** : Produits de la même catégorie (si pas assez de résultats)
   - Filtre : uniquement les produits actifs avec stock > 0
   - Exclut les produits déjà vus/favoris

---

### 4️⃣ GET /api/products/popular
**Produits populaires (tendances)**

**Auth:** ❌ PUBLIC (pas besoin de token)

**Paramètres:**
- `limit` (optionnel, défaut: 10)

**Exemple:**
```bash
GET http://localhost:8085/api/products/popular?limit=8
```

**Réponse:** Liste de produits

**Algorithme:**
- Compte les interactions (CLICK + FAVORITE) des 30 derniers jours
- Retourne les produits les plus interagis
- Si pas assez de résultats, complète avec des produits récents

**Cas d'usage:**
- Page d'accueil : section "Produits tendances"
- Utilisateurs non connectés

---

### 5️⃣ GET /api/products/my-stats
**Statistiques d'interactions de l'utilisateur**

**Auth:** ✅ Requiert JWT

**Exemple:**
```bash
GET http://localhost:8085/api/products/my-stats
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "CLICK": 25,
  "FAVORITE": 8
}
```

**Cas d'usage:**
- Dashboard utilisateur
- Analytics/gamification

---

## 🔄 Scénario complet d'utilisation

### Étape 1 : Créer des produits avec tags

```bash
POST http://localhost:8085/api/products
Content-Type: multipart/form-data

name: iPhone 15 Pro
description: Smartphone Apple dernière génération
price: 1299.99
category: ELECTRONICS
stock: 50
file: [image]
```

**Important:** Actuellement, les tags ne sont pas dans le formulaire POST.  
Tu dois soit :
- Ajouter un champ `tags` dans ProductRestController (comma-separated : "smartphone,apple,5g")
- Ou créer un endpoint PATCH pour ajouter des tags après création

**Exemple de produits à créer:**

| Produit | Catégorie | Tags |
|---------|-----------|------|
| iPhone 15 Pro | ELECTRONICS | smartphone, apple, 5g |
| Samsung Galaxy S24 | ELECTRONICS | smartphone, samsung, android |
| MacBook Pro M3 | ELECTRONICS | laptop, apple, pro |
| AirPods Pro 2 | ELECTRONICS | audio, apple, wireless |
| Nike Air Max | FASHION | shoes, nike, sport |
| Adidas Ultraboost | FASHION | shoes, adidas, running |

---

### Étape 2 : Utilisateur se connecte (Keycloak)

Le front récupère le JWT token de Keycloak et l'envoie dans le header `Authorization: Bearer {token}`.

---

### Étape 3 : Utilisateur browse les produits

**Front:**
```javascript
// Liste des produits
const products = await fetch('/api/products');

// Quand user clique sur un produit
products.forEach(product => {
  product.addEventListener('click', async () => {
    // 1. Enregistrer le clic
    await fetch(`/api/products/${product.id}/click`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // 2. Naviguer vers la page détail
    window.location.href = `/products/${product.id}`;
  });
});
```

---

### Étape 4 : Utilisateur ajoute des favoris

**Front:**
```javascript
// Bouton favori
favoriteBtn.addEventListener('click', async () => {
  await fetch(`/api/products/favorites/${productId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Le FavoriteService enregistre automatiquement l'interaction
});
```

---

### Étape 5 : Afficher les recommandations

**Front:**
```javascript
// Section "Recommandé pour vous"
const recommendations = await fetch('/api/products/recommendations?limit=6', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Afficher dans une grille de produits
```

**Quand l'afficher:**
- Page d'accueil (après connexion)
- Page détail produit : "Produits similaires"
- Sidebar panier : "Vous aimerez aussi"

---

### Étape 6 : Afficher les produits populaires (page accueil public)

**Front:**
```javascript
// Section "Tendances" (visiteurs non connectés)
const popular = await fetch('/api/products/popular?limit=8');
```

---

## 🧪 Tests manuels (Postman/Bruno)

### Test 1 : Créer des produits
```
POST /api/products (avec images)
```

### Test 2 : Se connecter et récupérer le token JWT
```
POST http://localhost:8080/realms/{realm}/protocol/openid-connect/token
```

### Test 3 : Enregistrer des clics
```
POST /api/products/1/click
POST /api/products/2/click
POST /api/products/3/click
Authorization: Bearer {token}
```

### Test 4 : Ajouter des favoris
```
POST /api/products/favorites/2
POST /api/products/favorites/4
Authorization: Bearer {token}
```

### Test 5 : Vérifier les recommandations
```
GET /api/products/recommendations?limit=5
Authorization: Bearer {token}
```

**Résultat attendu:**  
Produits de la même catégorie que 1,2,3,4 et/ou avec des tags similaires (sauf 1,2,3,4 déjà vus).

### Test 6 : Produits populaires
```
GET /api/products/popular?limit=5
(pas de token requis)
```

### Test 7 : Mes stats
```
GET /api/products/my-stats
Authorization: Bearer {token}
```

**Résultat attendu:**
```json
{
  "CLICK": 3,
  "FAVORITE": 2
}
```

---

## 🔧 Points d'amélioration possibles

### 1. Ajouter les tags au formulaire de création

**ProductRestController:**
```java
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> saveProductWithFile(
    // ...existing params...
    @RequestParam(value = "tags", required = false) String tags
) {
    // ...
    if (tags != null && !tags.isEmpty()) {
        Set<String> tagSet = Arrays.stream(tags.split(","))
            .map(String::trim)
            .collect(Collectors.toSet());
        product.setTags(tagSet);
    }
    // ...
}
```

### 2. Endpoint pour mettre à jour les tags d'un produit

```java
@PatchMapping("/{id}/tags")
public ResponseEntity<?> updateProductTags(
    @PathVariable Long id,
    @RequestBody Set<String> tags
) {
    Product product = productService.getProductById(id);
    product.setTags(tags);
    productRepository.save(product);
    return ResponseEntity.ok(product);
}
```

### 3. Améliorer l'algorithme de recommandation

- Score de similarité (Jaccard) sur les tags
- Poids différents pour CLICK vs FAVORITE
- Décroissance temporelle (interactions récentes pèsent plus)
- Collaborative filtering (utilisateurs similaires)

### 4. Cache pour les produits populaires

```java
@Cacheable(value = "popularProducts", key = "#limit")
public List<Product> getPopularProducts(int limit) {
    // ...
}
```

---

## 📌 Notes importantes

1. **Dépendance circulaire :** `FavoriteService` → `RecommendationService`  
   Si erreur, utilise `@Lazy` sur l'injection :
   ```java
   private final RecommendationService recommendationService;
   ```

2. **Performance :** Si beaucoup d'interactions, ajouter des index sur :
   - `product_interactions.user_id`
   - `product_interactions.created_at`
   - `product_tags.product_id`

3. **Base de données :** À chaque démarrage, Spring JPA va créer automatiquement :
   - Table `product_interactions`
   - Table `product_tags`

4. **Sécurité :** Les endpoints de recommandations sont protégés par JWT (SecurityConfig configuré).

---

## 🚀 Checklist de déploiement

- [ ] Démarrer Keycloak
- [ ] Configurer `application.properties` avec les infos Keycloak
- [ ] Créer des produits de test avec différentes catégories
- [ ] Ajouter des tags aux produits (via PATCH ou modifier le POST)
- [ ] Tester les endpoints avec Postman
- [ ] Intégrer dans le front (React/Angular/Vue)
- [ ] Ajouter un loader pendant les recommandations
- [ ] Afficher "Aucune recommandation" si liste vide

---

**Auteur:** GitHub Copilot  
**Date:** 2026-02-25

