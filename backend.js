import { blob } from "https://esm.town/v/std/blob";

import { Context, Hono } from "npm:hono";
import { bearerAuth } from "npm:hono/bearer-auth";

import { z } from "npm:zod";

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

app.get("/creations/:idx", async function getCreationById(c: Context) {
  let { idx } = z.object({
    idx: z.coerce.number().int().nonnegative(),
  }).strip().parse(c.req.param());

  let creations = await blob.getJSON("/puddle/creations.json");

  let creation = creations.items[idx];
  if (!creation) return c.notFound();

  return c.json(creation);
});

app.post("/creations", async function addCreation(c: Context) {
  let newCreation = z.object({
    type: z.string().required(),
    text: z.string().optional(),
  }).strip().parse(await c.req.json());

  let creations = await blob.getJSON("/puddle/creations.json");
  newCreation.id = "https://iliazeus-puddle.web.val.run/creations/" + creations.items.length;

  creations.items.push(newCreation);
  await blob.setJSON("/puddle/creations.json", creations);

  return c.json(newCreation);
});

app.delete("/creations", auth, async function deleteAllCreations(c: Context) {
  await blob.setJSON("/puddle/creations.json", { items: [] });
  return c.json({ ok: true });
});

export default app.fetch;