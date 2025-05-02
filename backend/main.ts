import * as fs from "node:fs/promises";

import { Context, Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { bodyLimit } from "hono/body-limit";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";
import { serve } from "@hono/node-server";

import { z, ZodError } from "zod";

let app = new Hono();
app.use(logger());

let auth = bearerAuth({
  // adapted from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
  async verifyToken(token: string, c: Context) {
    const msgUint8 = new TextEncoder().encode(token); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""); // convert bytes to hex string
    return (
      hashHex ===
      "57aafd0cb532573de7afb519a1d83002b51cf6f689f43b9a6281ee88df9de9b2"
    );
  },
});

app.get("/creations", async function getCreations(c: Context) {
  let creations = JSON.parse(await fs.readFile("./creations.json", "utf-8"));
  return c.json(creations);
});

app.get("/creations/:id", async function getCreationById(c: Context) {
  let creations = JSON.parse(await fs.readFile("./creations.json", "utf-8"));

  let creation = creations.items.find((x: any) => x.uri === c.req.url);
  if (!creation) return c.notFound();

  return c.json(creation);
});

app.post(
  "/creations",
  bodyLimit({ maxSize: 500 * 1024 }),
  async function addCreation(c: Context) {
    // prettier-ignore
    let newCreation: any = z.object({
        type: z.string().max(64),
        title: z.string().max(100),
        text: z.string().max(20 * 1024).optional(),
        image: z.string().url().startsWith("data:").optional(),
        audio: z.string().url().startsWith("data:").optional(),
        video: z.string().url().startsWith("data:").optional(),
        data: z.string().optional(),
      }).strip().parse(await c.req.json());

    let creations: any = JSON.parse(
      await fs.readFile("./creations.json", "utf-8")
    );

    newCreation.id = creations.lastId + 1;
    newCreation.uri =
      "https://api.iliazeus.lol/puddle/creations/" + newCreation.id;

    let now = new Date();
    newCreation.time = now.toISOString();

    creations.items.unshift(newCreation);

    creations.items = creations.items.filter(
      (x: any) => +now - +new Date(x.time) <= 25 * 60 * 60 * 1000
    );

    await fs.writeFile("./creations.json", JSON.stringify(creations), "utf-8");

    return c.json(newCreation);
  }
);

app.delete(
  "/creations/:id",
  auth,
  async function deleteCreationById(c: Context) {
    let creations: any = JSON.parse(
      await fs.readFile("./creations.json", "utf-8")
    );
    creations.items = creations.items.filter((x: any) => x.uri !== c.req.url);
    await fs.writeFile("./creations.json", JSON.stringify(creations), "utf-8");
    return c.json({ ok: true });
  }
);

app.onError(async function onError(e: any, c: Context) {
  if (e instanceof HTTPException) return e.getResponse();
  if (e instanceof ZodError) return c.json(e, { status: 400 });
  if (e.name === "ValTownBlobNotFoundError") return c.notFound();
  throw e;
});

serve({ fetch: app.fetch, port: 8003 });
