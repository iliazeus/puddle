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

function readFileAsDataUrl(file) {
  return new Promise((rs, rj) => {
    let r = new FileReader();
    r.onload = () => rs(r.result);
    r.onerror = () => rj(r.error);
    r.readAsDataURL(file);
  });
}
