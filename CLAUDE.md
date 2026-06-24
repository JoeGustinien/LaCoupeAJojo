# La Coupe à Jojo

Tracker FIFA World Cup 2026 en React. Interface en français, heures affichées en heure de Paris (CEST, UTC+2).

## Stack

- React 19 + Vite (ESM, pas de router)
- Pas de lib de state externe — `useState` / `useMemo` suffit
- CSS vanilla dans `src/index.css`

## Architecture

```
src/
  App.jsx              # Racine : onglets, data fetching, dark mode
  services/api.js      # fetch wrapper → worldcup26.ir
  hooks/useApi.js      # hook polling générique (interval optionnel)
  utils/parsers.js     # conversions dates/heures, parsing buteurs
  components/
    MatchesView.jsx    # Scores des matchs
    GroupsView.jsx     # Classements de groupe
    ScorersView.jsx    # Buteurs (calculés depuis les matchs)
    BracketView.jsx    # Tableau final (phase éliminatoire)
    FormatView.jsx     # Explication format 2026 + classement 3èmes en temps réel
```

## API

Base URL : `https://worldcup26.ir` — pas d'auth.

| Endpoint       | Utilisé par        | Refresh |
|----------------|--------------------|---------|
| /get/groups    | GroupsView, FormatView | 60s |
| /get/teams     | tous (via `teams` map) | une fois |
| /get/games     | MatchesView, ScorersView, BracketView | 60s |

`teams` est un objet `{ id → team }` construit dans App.jsx et passé en prop à chaque vue.

## Onglets

`TABS` dans App.jsx — clés : `matchs`, `groupes`, `buteurs`, `bracket`, `format`.

## Points clés

- **Fuseaux horaires** : 16 stades mappés dans `parsers.js` (CDT/EDT/PDT). Toutes les heures converties en CEST pour l'affichage.
- **Déduplication buteurs** : `buildTopScorers` fusionne les formats `"K. Mbappé"` et `"Kylian Mbappé"` (même initiale + même nom de famille).
- **Dark mode** : détecté via `prefers-color-scheme`, toggleable avec le bouton ☾/☀ dans le header. Classe `dark` sur `<html>`.
- **Format 2026** : `FormatView` explique le format 48 équipes et affiche en temps réel le classement des 12 troisièmes de groupe — les 8 meilleures se qualifient.
