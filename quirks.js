import * as lib from "./library.js";

async function fetchJsonFromPondiverseCom(url, init) {
  url = new URL(url);

  let baseUrl =
    "https://todepond--33148208245911f0bc54569c3dd06744.web.val.run";

  if (url.pathname === "/creations") {
    url.pathname = "/get-creations";
  }

  if (url.pathname === "/get-creations") {
    let json = await lib.fetchJson(url, init);

    json.items = json.rows;
    delete json.rows;

    for (let item of json.items) {
      item.uri = `${baseUrl}/get-creation?id=${item.id}`;
      item.image = `${baseUrl}/get-creation-image?id=${item.id}`;
    }

    if (json.items.length > 0) {
      let nextUrl = new URL(url);
      nextUrl.searchParams.set(
        "page",
        +(url.searchParams.get("page") ?? 1) + 1
      );
      json.next = String(nextUrl);
    }

    return json;
  }

  return await lib.fetchJson(url, init);
}

export async function fetchJson(url, init) {
  url = new URL(url, window.location);

  if (
    url.origin ===
    "https://todepond--33148208245911f0bc54569c3dd06744.web.val.run"
  )
    return await fetchJsonFromPondiverseCom(url, init);

  return await lib.fetchJson(url, init);
}

export async function postJson(url, body, init) {
  return await lib.postJson(url, body, init);
}
