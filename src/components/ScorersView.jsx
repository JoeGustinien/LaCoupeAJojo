import { useMemo } from 'react';

function buildTopScorers(matches) {
  const tally = {};
  (matches || []).forEach(m => {
    (m.goals || []).forEach(g => {
      if (g.type === 'own_goal') return;
      const team = g.team === 'home' ? m.homeTeam : m.awayTeam;
      const name = g.scorer;
      if (!name) return;
      if (!tally[name]) tally[name] = { name, team, goals: 0 };
      tally[name].goals++;
    });
  });
  return Object.values(tally).sort((a, b) => b.goals - a.goals);
}

export function ScorersView({ matches, teams }) {
  const scorers = useMemo(() => buildTopScorers(matches), [matches]);

  const teamsByName = useMemo(() => {
    if (!teams) return {};
    return Object.fromEntries(Object.values(teams).map(t => [t.name_en, t]));
  }, [teams]);

  return (
    <div className="scorers-wrap">
      <div className="section-note">
        Buteurs calculés depuis les données Zafronix. Les passes décisives ne sont pas encore disponibles.
      </div>
      <table className="scorers-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Joueur</th>
            <th>Équipe</th>
            <th>Buts</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((s, i) => {
            const team = teamsByName[s.team];
            return (
              <tr key={s.name} className={i < 3 ? 'top-scorer' : ''}>
                <td className="mono rank">{i + 1}</td>
                <td className="player-name">{s.name}</td>
                <td className="team-cell">
                  {team?.flag && <img src={team.flag} alt="" width={18} height={13} className="flag" />}
                  {s.team}
                </td>
                <td className="mono goals">{s.goals}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
