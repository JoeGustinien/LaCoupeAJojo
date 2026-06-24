import { useState, useMemo } from 'react';
import { isTodayParis, isLive, formatDateHeader, compareDateKeys, parseScorers, toParisTime } from '../utils/parsers';

const FILTERS = [
  ['all', 'Tous'],
  ['live', 'En cours'],
  ['today', "Aujourd'hui"],
  ['finished', 'Terminés'],
  ['upcoming', 'À venir'],
];

export function MatchesView({ matches, teams }) {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (!matches) return [];
    switch (filter) {
      case 'live':     return matches.filter(isLive);
      case 'today':    return matches.filter(m => isTodayParis(m.local_date, m.stadium_id));
      case 'finished': return matches.filter(m => m.finished === 'TRUE');
      case 'upcoming': return matches.filter(m => m.finished === 'FALSE' && !isLive(m));
      default:         return matches;
    }
  }, [matches, filter]);

  const byDate = useMemo(() => {
    const map = {};
    filtered.forEach(m => {
      const paris = toParisTime(m.local_date, m.stadium_id);
      const key = paris?.dateKey ?? m.local_date?.split(' ')[0] ?? 'À définir';
      (map[key] ??= []).push(m);
    });
    return Object.entries(map).sort(([a], [b]) => compareDateKeys(a, b));
  }, [filtered]);

  const liveCount = useMemo(() => (matches || []).filter(isLive).length, [matches]);

  return (
    <div>
      <div className="filter-row">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            className={`filter-btn${filter === key ? ' active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
            {key === 'live' && liveCount > 0 && <span className="live-dot" />}
          </button>
        ))}
      </div>

      {byDate.length === 0 && (
        <p className="empty">Aucun match pour ce filtre.</p>
      )}

      {byDate.map(([dateKey, games]) => (
        <section key={dateKey} className="date-section">
          <div className="date-header">{formatDateHeader(dateKey)}</div>
          <div className="match-list">
            {games.map(m => <MatchCard key={m.id} match={m} teams={teams} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function MatchCard({ match: m, teams }) {
  const live = isLive(m);
  const finished = m.finished === 'TRUE';
  const homeScorers = parseScorers(m.home_scorers);
  const awayScorers = parseScorers(m.away_scorers);
  const paris = toParisTime(m.local_date, m.stadium_id);
  const homeTeam = teams?.[m.home_team_id];
  const awayTeam = teams?.[m.away_team_id];

  return (
    <div className={`match-card${live ? ' match-live' : ''}`}>
      <div className="match-meta">
        {live ? (
          <span className="badge-live">LIVE {m.time_elapsed}</span>
        ) : finished ? (
          <span className="badge-finished">FIN</span>
        ) : paris ? (
          <span className="badge-upcoming">{paris.hhmm} <span className="tz-label">Paris</span></span>
        ) : null}
        <span className="match-group">{labelForGroup(m.group, m.type)}</span>
      </div>

      <div className="match-body">
        <div className="match-team">
          <span className="match-team-name">
            {homeTeam?.flag && <img src={homeTeam.flag} alt="" width={20} height={15} className="flag match-flag" />}
            {m.home_team_name_en || m.home_team_label || '?'}
          </span>
          {homeScorers.length > 0 && (
            <div className="scorer-list">{homeScorers.join(', ')}</div>
          )}
        </div>

        <div className="match-score">
          {finished || live ? (
            <span className="score-value">{m.home_score} – {m.away_score}</span>
          ) : (
            <span className="score-vs">–</span>
          )}
        </div>

        <div className="match-team match-team-right">
          <span className="match-team-name">
            {m.away_team_name_en || m.away_team_label || '?'}
            {awayTeam?.flag && <img src={awayTeam.flag} alt="" width={20} height={15} className="flag match-flag" />}
          </span>
          {awayScorers.length > 0 && (
            <div className="scorer-list">{awayScorers.join(', ')}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function labelForGroup(group, type) {
  if (!type || type === 'group') return `Groupe ${group}`;
  const labels = { r32: 'Seizièmes', r16: 'Huitièmes', qf: 'Quarts', sf: 'Demies', third: '3e place', final: 'Finale' };
  return labels[type] ?? group;
}
