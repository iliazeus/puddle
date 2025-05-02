export async function fetchJson(url, init) {
  let response = await fetch(url, init);
  if (!response.ok) throw new Error(response.statusText);
  return await response.json();
}

export async function postJson(url, body, init) {
  if (body instanceof FormData) body = await formDataToObject(body);
  let response = await fetch(url, {
    ...init,
    method: "post",
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(response.statusText);
  return await response.json();
}

async function formDataToObject(data) {
  let json = {};
  for (let [k, v] of data) {
    if (v instanceof File && v.size > 0) v = await readFileAsDataUrl(v);
    json[k] = v;
  }
  return json;
}

function readFileAsDataUrl(file) {
  return new Promise((rs, rj) => {
    let r = new FileReader();
    r.onload = () => rs(r.result);
    r.onerror = () => rj(r.error);
    r.readAsDataURL(file);
  });
}
