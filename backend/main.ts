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

app.get("/auth-check", auth, (c: Context) => c.json({ ok: true }));

async function saveMedia(creation: any, mediaKind: string) {
  await fs.mkdir(`./${mediaKind}`, { recursive: true });

  let blob = await (await fetch(creation[mediaKind])).blob();
  creation[mediaKind] = {
    uri: `https://api.iliazeus.lol/puddle/${mediaKind}s/${creation.id}`,
    type: blob.type,
    path: `./${mediaKind}/${creation.id}`,
  };

  let bytes = new Uint8Array(await blob.arrayBuffer());
  await fs.writeFile(creation[mediaKind].path, bytes);
}

async function loadMedia(creation: any, mediaKind: string): Promise<Blob> {
  let bytes = await fs.readFile(creation[mediaKind].path);
  return new Blob([bytes], { type: creation[mediaKind].type });
}

app.get("/creations", async function getCreations(c: Context) {
  let creations = JSON.parse(await fs.readFile("./creations.json", "utf-8"));
  if (c.req.query("all") === undefined) {
    creations.items = creations.items.filter((x: any) => !x.hidden);
  }
  for (let creation of creations.items) {
    if (creation.image) creation.image = creation.image.uri;
    if (creation.audio) creation.audio = creation.audio.uri;
    if (creation.video) creation.video = creation.video.uri;
  }
  return c.json(creations);
});

app.get("/creations/:id", async function getCreationById(c: Context) {
  let creations = JSON.parse(await fs.readFile("./creations.json", "utf-8"));

  let creation = creations.items.find((x: any) => x.id === +c.req.param("id"));
  if (!creation) return c.notFound();

  if (creation.image) creation.image = creation.image.uri;
  if (creation.audio) creation.audio = creation.audio.uri;
  if (creation.video) creation.video = creation.video.uri;

  return c.json(creation);
});

app.get("/images/:id", async function getImageById(c: Context) {
  let creations = JSON.parse(await fs.readFile("./creations.json", "utf-8"));

  let creation = creations.items.find((x: any) => x.id === +c.req.param("id"));
  if (!creation || !creation.image) return c.notFound();

  let blob = await loadMedia(creation, "image");
  c.header("Content-Type", blob.type);
  return c.body(await blob.arrayBuffer());
});

app.get("/audios/:id", async function getImageById(c: Context) {
  let creations = JSON.parse(await fs.readFile("./creations.json", "utf-8"));

  let creation = creations.items.find((x: any) => x.id === +c.req.param("id"));
  if (!creation || !creation.audio) return c.notFound();

  let blob = await loadMedia(creation, "audio");
  c.header("Content-Type", blob.type);
  return c.body(await blob.arrayBuffer());
});

app.get("/videos/:id", async function getImageById(c: Context) {
  let creations = JSON.parse(await fs.readFile("./creations.json", "utf-8"));

  let creation = creations.items.find((x: any) => x.id === +c.req.param("id"));
  if (!creation || !creation.video) return c.notFound();

  let blob = await loadMedia(creation, "video");
  c.header("Content-Type", blob.type);
  return c.body(await blob.arrayBuffer());
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
        ttl: z.number().int().optional(),
        hidden: z.boolean().optional(),
      }).strip().parse(await c.req.json());

    let creations: any = JSON.parse(
      await fs.readFile("./creations.json", "utf-8")
    );

    creations.lastId += 1;
    newCreation.id = creations.lastId;
    newCreation.uri =
      "https://api.iliazeus.lol/puddle/creations/" + newCreation.id;

    let now = new Date();
    newCreation.time = now.toISOString();

    if (newCreation.image) await saveMedia(newCreation, "image");
    if (newCreation.audio) await saveMedia(newCreation, "audio");
    if (newCreation.video) await saveMedia(newCreation, "video");

    creations.items.unshift(newCreation);

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
    creations.items = creations.items.filter(
      (x: any) => x.id !== +c.req.param("id")
    );
    await fs.writeFile("./creations.json", JSON.stringify(creations), "utf-8");
    return c.json({ ok: true });
  }
);

app.onError(async function onError(e: any, c: Context) {
  console.error(e);
  if (e instanceof HTTPException) return e.getResponse();
  if (e instanceof ZodError) return c.json(e, { status: 400 });
  if (e.name === "ValTownBlobNotFoundError") return c.notFound();
  throw e;
});

setInterval(
  async function purgeOlderCreations() {
    let now = new Date();
    let creations = JSON.parse(await fs.readFile("./creations.json", "utf-8"));
    let newItems = [];

    for (let creation of creations.items) {
      let ttl = creation.ttl ?? 25 * 60 * 60 * 1000;
      let timeOfDeath = +new Date(creation.time) + ttl;

      if (timeOfDeath <= +now) {
        if (creation.image) await fs.rm(creation.image.path);
        if (creation.audio) await fs.rm(creation.audio.path);
        if (creation.video) await fs.rm(creation.video.path);
      } else {
        newItems.push(creation);
      }
    }

    creations.items = newItems;
    await fs.writeFile("./creations.json", JSON.stringify(creations), "utf-8");
  },
  10 * 60 * 1000
);

serve({ fetch: app.fetch, port: 8003 });
