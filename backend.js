import { blob } from "https://esm.town/v/std/blob";
import { Context, Hono } from "npm:hono";

const app = new Hono();

app.get("/creations", async function getCreations(c: Context) {
  let creations = await blob.getJSON("/puddle/creations.json");
  if (!creations) {
    creations = { items: [] };
    await blob.setJSON("/puddle/creations.json", creations);
  }

  return c.json(creations);
});

export default app.fetch;