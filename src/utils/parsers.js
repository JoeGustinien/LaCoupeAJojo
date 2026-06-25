// Stadium UTC offsets in summer (CEST period: June-July)
// EDT = UTC-4, CDT = UTC-5, PDT = UTC-7
const STADIUM_TZ = {
  '1':  -5, '2':  -5, '3':  -5, // Mexico (Azteca, Akron, BBVA) — CDT
  '4':  -5, '5':  -5, '6':  -5, // Dallas, Houston, Kansas City — CDT
  '7':  -4, '8':  -4, '9':  -4, // Atlanta, Miami, Boston — EDT
  '10': -4, '11': -4, '12': -4, // Philadelphia, New York, Toronto — EDT
  '13': -7, '14': -7,            // Vancouver, Seattle — PDT
  '15': -7, '16': -7,            // San Francisco, Los Angeles — PDT
};

const PARIS_OFFSET = 2; // CEST (UTC+2) in June-July

export function toParisTime(localDate, stadiumId) {
  if (!localDate || !stadiumId) return null;
  const [datePart, timePart] = localDate.split(' ');
  if (!timePart) return null;
  const [mm, dd, yyyy] = datePart.split('/').map(Number);
  const [hh, min] = timePart.split(':').map(Number);
  const venueOffset = STADIUM_TZ[String(stadiumId)] ?? -5;
  // local → UTC → Paris
  const baseMs = Date.UTC(yyyy, mm - 1, dd, hh, min);
  const parisMs = baseMs + (PARIS_OFFSET - venueOffset) * 3_600_000;
  const pd = new Date(parisMs);
  return {
    hhmm:    `${String(pd.getUTCHours()).padStart(2,'0')}:${String(pd.getUTCMinutes()).padStart(2,'0')}`,
    dateKey: `${String(pd.getUTCMonth()+1).padStart(2,'0')}/${String(pd.getUTCDate()).padStart(2,'0')}/${pd.getUTCFullYear()}`,
    ms:      parisMs,
  };
}

function parisNowKey() {
  return new Date().toLocaleDateString('en-US', {
    timeZone: 'Europe/Paris',
    month: '2-digit', day: '2-digit', year: 'numeric',
  }); // "MM/DD/YYYY"
}

export function parseScorers(str) {
  if (!str || str === 'null') return [];
  // Normalize Unicode curly quotes (U+201C/U+201D) to ASCII quotes
  const s = str.replace(/[\u201C\u201D]/g, '"');
  const found = s.match(/"([^"]+)"/g);
  if (found?.length) return found.map(m => m.replace(/"/g, '').trim()).filter(Boolean);
  // fallback: unquoted comma-separated inside braces
  const inner = s.replace(/^\{|\}$/g, '').replace(/"/g, '').trim();
  return inner ? inner.split(',').map(s => s.trim()).filter(Boolean) : [];
}

export function playerName(entry) {
  // Strip minute notation and anything after (handles 45', 45+2', 45'+5', 45'+5'(p), (OG), etc.)
  return entry.replace(/\s+\d+.*$/, '').trim();
}

// Corrections manuelles pour les noms corrompus par l'API (translittération cassée)
// Clé = nom tel que renvoyé par l'API, valeur = nom correct
const NAME_CORRECTIONS = {
  'Dniz Avndav':         'Deniz Undav',        // Allemagne
  'Kvdi Khakpv':         'Cody Gakpo',          // Pays-Bas
  'Dnil Mvnvz':          'Daniel Muñoz',        // Colombie
  'Lviiz Diaz':          'Luis Díaz',           // Colombie
  'Rvbn Vargas':         'Rubén Vargas',        // Suisse (aussi présent sans corruption)
  'Jvhan Mnzambi':       'Johan Manzambi',      // Suisse
  'Kail Larin':          'Cyle Larin',          // Canada (aussi en "C. Larin")
  'Jvlian Kviinvnz':    'Julián Quiñones',     // Mexique (aussi en "J. Quiñones")
  'Markvs Hlmgrn Pdrsn': 'Markus Holmgren Pedersen', // Norvège
  'Asmaail Saibari':     'Ismail Saibari',      // Maroc (aussi en "I. Saibari")
  'Nvnv Mndz':           'Nuno Mendes',         // Portugal
  'Prvmis Divid':        'Promise David',       // Canada
  'Armin Mhmich':        'Ermin Mahmić',        // Bosnie-Herzégovine
  'Aiash Ivida':         'Ayase Ueda',          // Japon
};

// Extrait le nom de famille en ignorant initiales et particules courtes
// "K. Mbappé" → "Mbappé", "Y.Ayari" → "Ayari", "I.B. Hwang" → "Hwang"
function extractSurname(name) {
  const parts = name.split(/[\s.]+/).filter(p => p.length > 1);
  return parts.at(-1) ?? name;
}

// Détecte un nom au format initial : "K.", "Y.", "I.B.", "H.G."
const IS_INITIAL = /^[A-ZÀÁÂÄÇÉÈÊËÎÏÑÓÔÙÚÛÜ]\./;

export function buildTopScorers(matches) {
  const tally = {};
  matches.forEach(m => {
    const tag = (scorersStr, teamName) =>
      parseScorers(scorersStr).forEach(e => {
        if (/\(og\)/i.test(e)) return; // buts contre son camp
        const raw = playerName(e);
        if (!raw) return;
        const name = NAME_CORRECTIONS[raw] ?? raw;
        if (!tally[name]) tally[name] = { name, team: teamName, goals: 0 };
        tally[name].goals++;
      });
    tag(m.home_scorers, m.home_team_name_en);
    tag(m.away_scorers, m.away_team_name_en);
  });

  // Fusionne "K. Mbappé" / "Y.Ayari" dans le nom complet si même initiale + même nom de famille
  const bySurname = {};
  Object.values(tally).forEach(e => {
    (bySurname[extractSurname(e.name)] ??= []).push(e);
  });
  Object.values(bySurname).forEach(group => {
    if (group.length < 2) return;
    const initials = group.filter(e => IS_INITIAL.test(e.name));
    const fulls    = group.filter(e => !IS_INITIAL.test(e.name));
    initials.forEach(init => {
      const letter = init.name[0].toUpperCase();
      const match = fulls.find(f => f.name[0].toUpperCase() === letter);
      if (match) {
        match.goals += init.goals;
        delete tally[init.name];
      }
    });
  });

  return Object.values(tally).sort((a, b) => b.goals - a.goals);
}

export function formatDateHeader(mmddyyyy) {
  if (!mmddyyyy) return 'Date inconnue';
  const [mm, dd, yyyy] = mmddyyyy.split('/');
  const d = new Date(`${yyyy}-${mm}-${dd}`);
  const isToday = mmddyyyy === parisNowKey();
  const label = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return isToday ? `${label} — aujourd'hui` : label;
}

export function isTodayParis(localDate, stadiumId) {
  const p = toParisTime(localDate, stadiumId);
  return p ? p.dateKey === parisNowKey() : false;
}

export function isLive(match) {
  if (match.finished === 'TRUE') return false;
  const t = (match.time_elapsed || '').toLowerCase();
  return t !== '' && t !== 'notstarted' && t !== 'not_started';
}

export function compareDateKeys(a, b) {
  const toMs = (mmddyyyy) => {
    const [mm, dd, yyyy] = mmddyyyy.split('/').map(Number);
    return new Date(yyyy, mm - 1, dd).getTime();
  };
  return toMs(a) - toMs(b);
}
