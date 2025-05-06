export async function formDataToObject(data) {
  let json = {};
  for (let [k, v] of data) {
    if (v instanceof File && v.size > 0) {
      v = await readFileAsDataUrl(v);
      json[k] = v;
    } else if (typeof v === "string") {
      json[k] = v;
    }
  }
  return json;
}

export function readFileAsDataUrl(file) {
  return new Promise((rs, rj) => {
    let r = new FileReader();
    r.onload = () => rs(r.result);
    r.onerror = () => rj(r.error);
    r.readAsDataURL(file);
  });
}

// echo -n "your secret" | sha256sum
export async function hashToHex(algo, data) {
  if (typeof data === "string") data = new TextEncoder().encode(data);
  let hash = await crypto.subtle.digest(algo, data);
  return hash.map((b) => b.toString(16).padStart(2, "0")).join("");
}
