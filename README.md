# Quiz Party 🎉

Jeu de société multijoueur en français, jouable directement dans le navigateur.

## Concept

Un jeu pour 3 joueurs ou plus + un Maître du jeu optionnel. Chaque manche tourne autour d'un thème avec une liste de réponses valides. Les joueurs répondent à tour de rôle. 2 erreurs = éliminé !

## Fonctionnalités

- 🎮 20 thèmes inclus (25-45 réponses chacun)
- 🎯 Interface Maître du jeu avec validation par clic
- 👀 Interface Joueur (vue sans les réponses)
- ⚙️ Paramètres configurables (vies, filtres, etc.)
- 📝 Gestionnaire de thèmes (créer, éditer, importer/exporter)
- 📊 Statistiques locales
- 🌙 Mode sombre/clair
- 📱 Responsive (mobile, tablette, desktop)

## Lancer localement

```bash
npm install
npm run dev
```

## Déployer sur GitHub Pages

Push sur `main` → le workflow GitHub Actions déploie automatiquement.

## Technologies

- React + TypeScript
- Tailwind CSS v4
- Zustand (state management)
- Vite
- GitHub Pages
