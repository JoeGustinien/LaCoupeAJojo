const BASE = 'https://worldcup26.ir';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export const getGroups = () => get('/get/groups');
export const getTeams = () => get('/get/teams');
export const getMatches = () => get('/get/games');

const ZAFRONIX_BASE = 'https://api.zafronix.com/fifa/worldcup/v1';
const ZAFRONIX_KEY = 'zwc_free_e7ebecb39d144fb3cb5aa499';

async function zGet(path) {
  const res = await fetch(`${ZAFRONIX_BASE}${path}`, {
    headers: { 'X-API-Key': ZAFRONIX_KEY },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export const getZafronixMatches = () => zGet('/matches?year=2026');
