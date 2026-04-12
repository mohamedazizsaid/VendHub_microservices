# 🧪 Tests API - Système de recommandations

## Configuration

**Base URL:** `http://localhost:8085`  
**Authorization:** Bearer token (récupéré depuis Keycloak)

---

## 1️⃣ Créer des produits de test (avec tags)

### Produit 1 : iPhone 15 Pro

```http
POST /api/products
Content-Type: multipart/form-data

name: iPhone 15 Pro
description: Smartphone Apple dernière génération avec puce A17 Pro
price: 1299.99
category: ELECTRONICS
stock: 50
tags: smartphone,apple,5g,premium
file: [upload image]
```

### Produit 2 : Samsung Galaxy S24

```http
POST /api/products
Content-Type: multipart/form-data

name: Samsung Galaxy S24
description: Flagship Android avec écran AMOLED 120Hz
price: 999.99
category: ELECTRONICS
stock: 40
tags: smartphone,samsung,android,5g
file: [upload image]
```

### Produit 3 : MacBook Pro M3

```http
POST /api/products
Content-Type: multipart/form-data

name: MacBook Pro M3 16"
description: Ordinateur portable professionnel Apple Silicon
price: 2499.99
category: ELECTRONICS
stock: 25
tags: laptop,apple,pro,m3
file: [upload image]
```

### Produit 4 : AirPods Pro 2

```http
POST /api/products
Content-Type: multipart/form-data

name: AirPods Pro 2
description: Écouteurs sans fil avec réduction de bruit active
price: 279.99
category: ELECTRONICS
stock: 100
tags: audio,apple,wireless,anc
file: [upload image]
```

### Produit 5 : Nike Air Max 90

```http
POST /api/products
Content-Type: multipart/form-data

name: Nike Air Max 90
description: Baskets iconiques avec amorti Air
price: 139.99
category: FASHION
stock: 60
tags: shoes,nike,sport,sneakers
file: [upload image]
```

### Produit 6 : Adidas Ultraboost

```http
POST /api/products
Content-Type: multipart/form-data

name: Adidas Ultraboost 23
description: Chaussures de running avec technologie Boost
price: 189.99
category: FASHION
stock: 45
tags: shoes,adidas,running,sport
file: [upload image]
```

---

## 2️⃣ Mettre à jour les tags d'un produit existant

```http
PATCH /api/products/1/tags
Content-Type: application/json

["smartphone", "apple", "5g", "premium", "ios"]
```

---

## 3️⃣ Scénario de test utilisateur

### Utilisateur 1 : Fan d'Apple

#### a) Enregistrer des clics

```http
POST /api/products/1/click
Authorization: Bearer {token_user1}
```

```http
POST /api/products/3/click
Authorization: Bearer {token_user1}
```

```http
POST /api/products/4/click
Authorization: Bearer {token_user1}
```

#### b) Ajouter aux favoris

```http
POST /api/products/favorites/1
Authorization: Bearer {token_user1}
```

```http
POST /api/products/favorites/4
Authorization: Bearer {token_user1}
```

#### c) Obtenir les recommandations

```http
GET /api/products/recommendations?limit=5
Authorization: Bearer {token_user1}
```

**Résultat attendu:**  
Produits Apple (MacBook, AirPods) ou avec tags similaires (smartphone, premium, wireless)  
**N'inclut PAS** les produits 1, 3, 4 (déjà vus/favoris)

---

### Utilisateur 2 : Fan de sport

#### a) Enregistrer des clics

```http
POST /api/products/5/click
Authorization: Bearer {token_user2}
```

```http
POST /api/products/6/click
Authorization: Bearer {token_user2}
```

#### b) Ajouter aux favoris

```http
POST /api/products/favorites/5
Authorization: Bearer {token_user2}
```

#### c) Obtenir les recommandations

```http
GET /api/products/recommendations?limit=5
Authorization: Bearer {token_user2}
```

**Résultat attendu:**  
Produits FASHION avec tags sport/shoes (excluant 5 et 6)

---

### Utilisateur 3 : Nouveau (aucune interaction)

#### Obtenir les recommandations

```http
GET /api/products/recommendations?limit=5
Authorization: Bearer {token_user3}
```

**Résultat attendu:**  
Produits populaires (ceux avec le plus d'interactions)

---

## 4️⃣ Endpoints publics (sans authentification)

### Produits populaires

```http
GET /api/products/popular?limit=8
```

**Résultat attendu:**  
Top 8 produits avec le plus d'interactions dans les 30 derniers jours

### Liste complète des produits

```http
GET /api/products
```

### Détail d'un produit

```http
GET /api/products/1
```

---

## 5️⃣ Statistiques utilisateur

```http
GET /api/products/my-stats
Authorization: Bearer {token}
```

**Réponse exemple:**
```json
{
  "CLICK": 15,
  "FAVORITE": 5
}
```

---

## 6️⃣ Gestion des favoris (endpoints existants)

### Ajouter aux favoris

```http
POST /api/products/favorites/3
Authorization: Bearer {token}
```

### Retirer des favoris

```http
DELETE /api/products/favorites/3
Authorization: Bearer {token}
```

### Liste de mes favoris

```http
GET /api/products/favorites
Authorization: Bearer {token}
```

### Vérifier si produit est favori

```http
GET /api/products/favorites/3
Authorization: Bearer {token}
```

**Réponse:**
- 200 OK : est favori
- 404 Not Found : n'est pas favori

---

## 🔍 Vérifications en base de données

### Vérifier les interactions enregistrées

```sql
SELECT * FROM product_interactions ORDER BY created_at DESC;
```

### Vérifier les tags des produits

```sql
SELECT p.id, p.name, t.tag 
FROM product p 
LEFT JOIN product_tags t ON p.id = t.product_id;
```

### Compter les interactions par utilisateur

```sql
SELECT user_id, type, COUNT(*) 
FROM product_interactions 
GROUP BY user_id, type;
```

### Top produits par interactions

```sql
SELECT product_id, COUNT(*) as total 
FROM product_interactions 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY product_id 
ORDER BY total DESC 
LIMIT 10;
```

---

## 🐛 Troubleshooting

### Erreur 401 Unauthorized

- Vérifier que le token JWT est valide
- Vérifier que Keycloak est démarré
- Vérifier la configuration `spring.security.oauth2.resourceserver.jwt.issuer-uri`

### Recommandations vides

- Vérifier que l'utilisateur a des interactions enregistrées
- Vérifier que les produits ont des tags
- Vérifier que les produits ont `status=true` et `stock>0`

### Produits populaires vides

- Créer des interactions de test
- Réduire la période de recherche dans `RecommendationService.getPopularProducts()`

---

## 📊 Scénario de démo complet

1. **Créer 10 produits** (5 ELECTRONICS, 5 FASHION) avec tags variés
2. **Utilisateur A** clique sur 3 produits Apple → recommandations Apple
3. **Utilisateur B** clique sur 2 produits Nike/Adidas → recommandations sport
4. **Utilisateur C** (nouveau) → reçoit les produits populaires
5. **Utilisateur A** ajoute 2 favoris → ses stats montrent `{CLICK: 3, FAVORITE: 2}`
6. **Page d'accueil public** affiche les produits populaires (les 8 plus cliqués)

---

## 🎯 Métriques à suivre

- Nombre d'interactions par utilisateur
- Taux de conversion (clicks → favoris)
- Produits les plus recommandés
- Taux de clic sur les recommandations (nécessite tracking côté front)

