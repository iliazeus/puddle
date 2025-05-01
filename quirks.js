import * as lib from "./library.js";

export async function fetchJson(url, init) {
  url = new URL(url, window.location);
  let json = await lib.fetchJson(url, init);

  if (
    url.origin ===
      "https://todepond--33148208245911f0bc54569c3dd06744.web.val.run" &&
    url.pathname.startsWith("/creations")
  ) {
    json.items = json.rows;
    delete json.rows;

    for (let item of json.items) {
      item.uri =
        "https://todepond--33148208245911f0bc54569c3dd06744.web.val.run/creations?json&c=" +
        item.id;
    }

    if (json.items.length > 0) {
      let nextUrl = new URL(url);
      nextUrl.searchParams.set("page", +(url.searchParams.get("page") ?? 1) + 1);
      json.next = String(nextUrl);
    }
  }

  return json;
}

export async function postJson(url, body, init) {
  return await lib.postJson(url, body, init);
}
