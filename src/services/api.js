const BASE = 'https://worldcup26.ir';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export const getGroups = () => get('/get/groups');
export const getTeams = () => get('/get/teams');
export const getMatches = () => get('/get/games');
