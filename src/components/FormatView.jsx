import { useMemo } from 'react';

export function FormatView({ groups, teams }) {
  const thirds = useMemo(() => {
    if (!groups) return [];
    return groups
      .map(g => {
        const sorted = [...g.teams].sort((a, b) => {
          const pts = parseInt(b.pts) - parseInt(a.pts);
          if (pts !== 0) return pts;
          const gd = parseInt(b.gd) - parseInt(a.gd);
          if (gd !== 0) return gd;
          return parseInt(b.gf) - parseInt(a.gf);
        });
        const third = sorted[2];
        if (!third) return null;
        const team = teams?.[third.team_id];
        return { ...third, group: g.name, teamName: team?.name_en ?? `#${third.team_id}`, flag: team?.flag };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const pts = parseInt(b.pts) - parseInt(a.pts);
        if (pts !== 0) return pts;
        const gd = parseInt(b.gd) - parseInt(a.gd);
        if (gd !== 0) return gd;
        return parseInt(b.gf) - parseInt(a.gf);
      });
  }, [groups, teams]);

  return (
    <div className="format-wrap">

      <section className="format-section">
        <h2 className="format-title">Nouveau format 2026</h2>
        <p className="format-intro">
          La Coupe du Monde 2026 passe à <strong>48 équipes</strong> pour la première fois.
          Le format change en profondeur par rapport aux éditions précédentes.
        </p>

        <div className="format-steps">
          <div className="format-step">
            <div className="step-num">1</div>
            <div className="step-body">
              <div className="step-label">Phase de groupes</div>
              <div className="step-desc">
                12 groupes de 4 équipes. Chaque équipe joue 3 matchs.
                Les <strong>2 premiers</strong> de chaque groupe sont directement qualifiés (24 équipes).
              </div>
            </div>
          </div>

          <div className="format-step highlight-step">
            <div className="step-num">2</div>
            <div className="step-body">
              <div className="step-label">Les 8 meilleurs 3èmes</div>
              <div className="step-desc">
                Il y a 12 équipes classées 3èmes (une par groupe).
                Les <strong>8 meilleures</strong> parmi ces 12 se qualifient également.
                Classement par : points → différence de buts → buts marqués → fair-play.
              </div>
            </div>
          </div>

          <div className="format-step">
            <div className="step-num">3</div>
            <div className="step-body">
              <div className="step-label">Phase éliminatoire</div>
              <div className="step-desc">
                32 équipes qualifiées au total.
                Seizièmes → Huitièmes → Quarts → Demi-finales → Finale.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="format-section">
        <h2 className="format-title">Classement des 3èmes en temps réel</h2>
        <p className="format-intro">
          Les 8 équipes sur fond bleu seraient qualifiées si la phase de groupes s'arrêtait maintenant.
        </p>

        {thirds.length === 0 ? (
          <p className="empty">Données non disponibles.</p>
        ) : (
          <table className="standings-table thirds-table">
            <thead>
              <tr>
                <th>#</th>
                <th className="col-team">Équipe</th>
                <th>Grp</th>
                <th title="Joués">J</th>
                <th title="Points">Pts</th>
                <th title="Buts pour">Bp</th>
                <th title="Buts contre">Bc</th>
                <th title="Différence">Db</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {thirds.map((t, i) => (
                <tr key={t.team_id} className={i < 8 ? 'row-qualify' : ''}>
                  <td className="mono">{i + 1}</td>
                  <td className="col-team">
                    {t.flag && <img src={t.flag} alt="" width={18} height={13} className="flag" />}
                    <span>{t.teamName}</span>
                  </td>
                  <td className="mono">{t.group}</td>
                  <td className="mono">{t.mp}</td>
                  <td className="mono pts">{t.pts}</td>
                  <td className="mono">{t.gf}</td>
                  <td className="mono">{t.ga}</td>
                  <td className="mono">{parseInt(t.gd) > 0 ? `+${t.gd}` : t.gd}</td>
                  <td>
                    {i < 8
                      ? <span className="badge-qualify">Qualifié</span>
                      : <span className="badge-out">Éliminé</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

    </div>
  );
}
