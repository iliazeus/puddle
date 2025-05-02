import { blob } from "https://esm.town/v/std/blob";

import { Context, Hono } from "npm:hono";
import { bearerAuth } from "npm:hono/bearer-auth";
import { HTTPException } from "npm:hono/http-exception";

import { z, ZodError } from "npm:zod";

const trusted = [
  "https://iliazeus.lol/puddle/",
  "https://pondiverse.com/",
  "https://todepond--33148208245911f0bc54569c3dd06744.web.val.run/",
];

let app = new Hono();

let auth = bearerAuth({
  // adapted from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
  async verifyToken(token: string, c: Context) {
    const msgUint8 = new TextEncoder().encode(token); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""); // convert bytes to hex string
    return hashHex === "57aafd0cb532573de7afb519a1d83002b51cf6f689f43b9a6281ee88df9de9b2";
  },
});

app.get("/creations", async function getCreations(c: Context) {
  let creations = await blob.getJSON("/puddle/creations.json");
  return c.json(creations);
});

app.get("/creations/:id", async function getCreationById(c: Context) {
  let creations = await blob.getJSON("/puddle/creations.json");

  let creation = creations.items.find((x) => x.uri === c.req.url);
  if (!creation) return c.notFound();

  return c.json(creation);
});

app.post("/creations", async function addCreation(c: Context) {
  let newCreation = z.object({
    type: z.string().max(64),
    title: z.string().max(100),
    text: z.string().max(20 * 1024).optional(),
    image: z.string().url().startsWith("data:").max(200 * 1024).optional(),
  }).strip().parse(await c.req.json());

  let creations = await blob.getJSON("/puddle/creations.json");

  let lastId = creations.items.at(-1)?.id ?? 0;
  newCreation.id = lastId + 1;
  newCreation.uri = "https://iliazeus-puddle.web.val.run/creations/" + newCreation.id;

  let now = new Date();
  newCreation.time = now.toISOString();

  creations.items.unshift(newCreation);

  creations.items = creations.items.filter(
    (x) => +now - +(new Date(x.time)) <= 25 * 60 * 60 * 1000,
  );

  await blob.setJSON("/puddle/creations.json", creations);

  return c.json(newCreation);
});

app.delete("/creations", auth, async function deleteAllCreations(c: Context) {
  await blob.setJSON("/puddle/creations.json", { items: [] });
  return c.json({ ok: true });
});

app.delete("/creations/:id", auth, async function deleteCreationById(c: Context) {
  let creations = await blob.getJSON("/puddle/creations.json");
  creations.items = creations.items.filter((x) => x.uri !== c.req.url);
  await blob.setJSON("/puddle/creations.json", creations);
  return c.json({ ok: true });
});

app.onError(async function onError(e: any, c: Context) {
  if (e instanceof HTTPException) return e.getResponse();
  if (e instanceof ZodError) return c.json(e, { status: 400 });
  if (e.name === "ValTownBlobNotFoundError") return c.notFound();
  throw e;
});

export default app.fetch;