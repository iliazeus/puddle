import { blob } from "https://esm.town/v/std/blob";
import { Context, Hono } from "npm:hono";
import { z } from "npm:zod";

const app = new Hono();

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

export default app.fetch;