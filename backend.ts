import { blob } from "https://esm.town/v/std/blob";

import { Context, Hono } from "npm:hono";
import { bearerAuth } from "npm:hono/bearer-auth";
import { HTTPException } from "npm:hono/http-exception";

import { z, ZodError } from "npm:zod";

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
    type: z.string(),
    text: z.string().optional(),
  }).strip().parse(await c.req.json());

  let creations = await blob.getJSON("/puddle/creations.json");

  let lastId = creations.items.at(-1)?.id;
  newCreation.id = lastId + 1;
  newCreation.uri = "https://iliazeus-puddle.web.val.run/creations/" + newCreation.id;

  creations.items.push(newCreation);
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