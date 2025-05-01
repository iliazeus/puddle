export async function fetchJson(url, init) {
  let response = await fetch(url, init);
  if (!response.ok) throw new Error(response.statusText);
  return await response.json();
}

export async function postJson(url, body, init) {
  let response = await fetch(url, { ...init, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(response.statusText);
  return await response.json();
}
