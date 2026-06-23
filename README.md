# La Coupe à Jojo

Tableau de bord de suivi de la Coupe du Monde FIFA 2026, pensé pour suivre le tournoi en heure française.

## Fonctionnalités

- **Matchs** — scores en direct, résultats et calendrier à venir, filtrables (en cours / aujourd'hui / terminés / à venir). Scorers affichés sous chaque match.
- **Groupes** — classement des 12 groupes (A→L) avec drapeaux, points, buts pour/contre, différence de buts. Les 2 premiers qualifiés sont mis en évidence.
- **Buteurs** — top scorers calculés depuis les données de match, avec fusion automatique des variantes de noms (ex. `K. Mbappé` et `Kylian Mbappé` → même entrée).
- **Bracket** — phases éliminatoires (Seizièmes → Finale), avec les équipes TBD affichées dès que la qualification est connue.
- **Heure de Paris** — tous les horaires sont convertis en CEST (UTC+2) en tenant compte du fuseau horaire de chaque stade (EDT/CDT/PDT).
- **Dark mode** — toggle jour/nuit, suit les préférences système par défaut.
- Refresh automatique toutes les 60 secondes.

## Stack

- React + Vite
- CSS custom properties (pas de framework UI)
- API : [worldcup26.ir](https://worldcup26.ir) — open source, sans clé requise

## Lancer en local

```bash
npm install
npm run dev
```

## Déployer

```bash
npm run build
# Le dossier dist/ est prêt pour Netlify, Vercel, ou n'importe quel hébergeur statique.
```

## Structure

```
src/
├── components/
│   ├── BracketView.jsx     # Phases éliminatoires
│   ├── GroupsView.jsx      # Classements de groupes
│   ├── MatchesView.jsx     # Liste des matchs
│   └── ScorersView.jsx     # Top buteurs
├── hooks/
│   └── useApi.js           # Fetch générique avec auto-refresh
├── services/
│   └── api.js              # Appels API worldcup26.ir
├── utils/
│   └── parsers.js          # Parsing scorers, conversion timezone Paris, merge noms
└── App.jsx
```
