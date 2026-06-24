import { useMemo } from 'react';
import { isLive, toParisTime } from '../utils/parsers';

const ROUNDS = [
  { key: 'r32',   label: 'Seizièmes de finale' },
  { key: 'r16',   label: 'Huitièmes de finale' },
  { key: 'qf',    label: 'Quarts de finale' },
  { key: 'sf',    label: 'Demi-finales' },
  { key: 'third', label: 'Troisième place' },
  { key: 'final', label: 'Finale' },
];

function translateLabel(label) {
  if (!label) return label;
  return label
    .replace(/\bWinner\b/g, 'Vainqueur')
    .replace(/\bLoser\b/g, 'Perdant')
    .replace(/\bMatch\b/g, 'Match')
    .replace(/\bGroup\b/g, 'Groupe');
}

export function BracketView({ matches, teams }) {
  const byRound = useMemo(() => {
    const map = {};
    (matches || []).forEach(m => {
      if (m.type !== 'group') (map[m.type] ??= []).push(m);
    });
    return map;
  }, [matches]);

  return (
    <div className="bracket-wrap">
      {ROUNDS.map(({ key, label }) => {
        const games = byRound[key];
        if (!games?.length) return null;
        return (
          <section key={key} className="bracket-round">
            <div className="round-label">{label}</div>
            <div className="round-matches">
              {games.map(m => <BracketMatch key={m.id} match={m} teams={teams} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function BracketMatch({ match: m, teams }) {
  const finished = m.finished === 'TRUE';
  const live = isLive(m);
  const tbd = m.home_team_id === '0' || !m.home_team_id;
  const paris = toParisTime(m.local_date, m.stadium_id);
  const homeTeam = !tbd ? teams?.[m.home_team_id] : null;
  const awayTeam = !tbd ? teams?.[m.away_team_id] : null;

  return (
    <div className={`bracket-match${live ? ' match-live' : ''}`}>
      <div className="bm-date">
        {live ? (
          <span className="badge-live">LIVE {m.time_elapsed}</span>
        ) : finished ? (
          <span className="badge-finished">FIN</span>
        ) : paris ? (
          <span className="badge-upcoming">{paris.hhmm} <span className="tz-label">Paris</span></span>
        ) : null}
      </div>

      <div className={`bm-team${finished && parseInt(m.home_score) > parseInt(m.away_score) ? ' bm-winner' : ''}`}>
        <span className="bm-team-name">
          {homeTeam?.flag && <img src={homeTeam.flag} alt="" width={18} height={13} className="flag" />}
          {m.home_team_name_en || translateLabel(m.home_team_label) || '?'}
        </span>
        <span className="mono">{!tbd && (finished || live) ? m.home_score : ''}</span>
      </div>

      <div className="bm-sep" />

      <div className={`bm-team${finished && parseInt(m.away_score) > parseInt(m.home_score) ? ' bm-winner' : ''}`}>
        <span className="bm-team-name">
          {awayTeam?.flag && <img src={awayTeam.flag} alt="" width={18} height={13} className="flag" />}
          {m.away_team_name_en || translateLabel(m.away_team_label) || '?'}
        </span>
        <span className="mono">{!tbd && (finished || live) ? m.away_score : ''}</span>
      </div>
    </div>
  );
}
