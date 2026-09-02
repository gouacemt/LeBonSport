# Feuille de route / état des fonctionnalités

Légende : ✅ fait · 🟡 partiel · ⛔ à faire

## Cœur produit

| Fonctionnalité                              | État | Notes |
| ------------------------------------------ | ---- | ----- |
| Inscription / connexion e-mail             | ✅   | + mot de passe oublié, choix du type de profil |
| Connexion Google / Apple                   | 🟡   | dépendances présentes, à finaliser |
| Onboarding (choix des sports)              | ✅   | une étape ; niveau / dispos non collectés |
| Profil : édition, avatar, galerie          | ✅   | upload avatar OK |
| Annonces : création                        | 🟡   | **upload de photos branché** ; validation extraite et testée |
| Annonces : liste + filtres (`explore`)     | ✅   | rendu `.map()` dans un ScrollView (virtualisation à prévoir) |
| Annonces : détail                          | ✅   | auteur, contact, photos |
| Annonces : mes annonces / édition / suppr. | ✅   | |
| Favoris                                    | ✅   | |
| Carte                                      | 🟡   | web = iframe ; pas de coordonnées réelles sur les annonces |
| Messagerie temps réel                      | ✅   | optimiste, accusés de lecture, non-lus par conversation, recherche |
| Candidater / rejoindre une annonce         | ⛔   | tout passe par le chat ; pas de table `candidatures` |
| Notifications in-app                       | 🟡   | écran de réglages réel ; **feed encore mock** |
| Notifications push                         | ⛔   | `expo-notifications` non intégré |
| Géolocalisation « près de chez moi »       | ⛔   | `useNearbyAthletes` = données de démo |

## Confiance & sécurité

| Fonctionnalité                    | État | Notes |
| -------------------------------- | ---- | ----- |
| Profil public d'un autre membre  | ⛔   | pas d'écran `user/[id]` |
| Avis / réputation après rencontre | ⛔   | |
| Signaler une annonce / un membre | ⛔   | |
| Bloquer un membre                | ⛔   | |
| Suppression de compte (RGPD)     | ⛔   | droit à l'effacement à implémenter |
| Export de données (RGPD)         | ⛔   | |
| Politique de confidentialité / CGU réelles | 🟡 | pages présentes, contenu à compléter |

## Qualité / exploitation

| Élément                          | État | Notes |
| ------------------------------- | ---- | ----- |
| CI (lint + types + tests)       | ✅   | `.github/workflows/ci.yml` |
| Tests unitaires (logique pure)  | 🟡   | auth + format + messageGroups + validation annonce ; hooks non couverts |
| ErrorBoundary global            | ✅   | `components/ErrorBoundary.tsx` |
| Observabilité (Sentry/analytics) | ⛔  | besoin d'un DSN |
| Accessibilité                    | ⛔   | labels/roles à ajouter sur les écrans clés |
| Déploiement démo (EAS + web)     | ⛔   | à builder + héberger avec un compte de démo |

## Idées d'ordre de traitement avant soutenance

1. Upload photo d'annonce ✅
2. Système de candidatures + notifications in-app réelles
3. Signaler / bloquer
4. Profil public + avis
5. Suppression de compte + pages RGPD
6. Géolocalisation réelle
7. Push notifications
8. Neutraliser / brancher les hooks de démo restants
9. Déploiement + compte de démo
