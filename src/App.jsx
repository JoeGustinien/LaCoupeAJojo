import { useState, useMemo, useEffect } from 'react';
import { useApi } from './hooks/useApi';
import { getGroups, getTeams, getMatches } from './services/api';
import { GroupsView } from './components/GroupsView';
import { MatchesView } from './components/MatchesView';
import { ScorersView } from './components/ScorersView';
import { BracketView } from './components/BracketView';
import { FormatView } from './components/FormatView';

const TABS = [
  { key: 'matchs',  label: 'Matchs' },
  { key: 'groupes', label: 'Groupes' },
  { key: 'buteurs', label: 'Buteurs' },
  { key: 'bracket', label: 'Bracket' },
  { key: 'format',  label: 'Format & règles' },
];

export default function App() {
  const [tab, setTab] = useState('matchs');
  const [dark, setDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const { data: groupsData, loading: gl } = useApi(getGroups, 60_000);
  const { data: teamsData, loading: tl } = useApi(getTeams);
  const { data: matchesData, loading: ml } = useApi(getMatches, 60_000);
  const teams = useMemo(() => {
    if (!teamsData?.teams) return {};
    return Object.fromEntries(teamsData.teams.map(t => [t.id, t]));
  }, [teamsData]);

  const loading = gl || tl || ml;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-title">
            <span className="title-main">La Coupe à Jojo</span>
            <span className="title-sub">FIFA World Cup 2026</span>
          </div>
          <button
            className="dark-toggle"
            onClick={() => setDark(d => !d)}
            aria-label="Thème"
          >
            {dark ? '☀' : '☾'}
          </button>
        </div>
      </header>

      <nav className="app-nav">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`nav-btn${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {loading && <div className="loader">Chargement…</div>}

        {!loading && tab === 'matchs'  && <MatchesView matches={matchesData?.games} teams={teams} />}
        {!loading && tab === 'groupes' && <GroupsView groups={groupsData?.groups} teams={teams} />}
        {!loading && tab === 'buteurs' && <ScorersView matches={matchesData?.games} teams={teams} />}
        {!loading && tab === 'bracket' && <BracketView matches={matchesData?.games} teams={teams} />}
        {!loading && tab === 'format'  && <FormatView groups={groupsData?.groups} teams={teams} />}
      </main>

      <footer className="app-footer">
        Données : worldcup26.ir · zafronix.com · Actualisation automatique toutes les 60s
      </footer>
    </div>
  );
}
