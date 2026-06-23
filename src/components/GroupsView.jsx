export function GroupsView({ groups, teams }) {
  const sorted = [...(groups || [])].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="groups-grid">
      {sorted.map(g => (
        <GroupCard key={g.name} group={g} teams={teams} />
      ))}
    </div>
  );
}

function GroupCard({ group, teams }) {
  const sorted = [...group.teams].sort((a, b) => {
    const pts = parseInt(b.pts) - parseInt(a.pts);
    if (pts !== 0) return pts;
    const gd = parseInt(b.gd) - parseInt(a.gd);
    if (gd !== 0) return gd;
    return parseInt(b.gf) - parseInt(a.gf);
  });

  return (
    <div className="group-card">
      <div className="group-label">Groupe {group.name}</div>
      <table className="standings-table">
        <thead>
          <tr>
            <th className="col-team">Équipe</th>
            <th title="Joués">J</th>
            <th title="Gagnés">G</th>
            <th title="Nuls">N</th>
            <th title="Perdus">P</th>
            <th title="Buts pour">Bp</th>
            <th title="Buts contre">Bc</th>
            <th title="Différence">Db</th>
            <th title="Points">Pts</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => {
            const team = teams?.[t.team_id];
            return (
              <tr key={t.team_id} className={i < 2 ? 'row-qualify' : ''}>
                <td className="col-team">
                  {team?.flag && (
                    <img src={team.flag} alt="" width={18} height={13} className="flag" />
                  )}
                  <span>{team?.name_en ?? `#${t.team_id}`}</span>
                </td>
                <td className="mono">{t.mp}</td>
                <td className="mono">{t.w}</td>
                <td className="mono">{t.d}</td>
                <td className="mono">{t.l}</td>
                <td className="mono">{t.gf}</td>
                <td className="mono">{t.ga}</td>
                <td className="mono">{parseInt(t.gd) > 0 ? `+${t.gd}` : t.gd}</td>
                <td className="mono pts">{t.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
