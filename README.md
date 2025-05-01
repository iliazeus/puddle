## the language that puddle speaks

Things are described with JSON.

Things have IDs, which are URIs. Fetching a thing's URI should return this thing.

Things link to other things and places using URIs.

An _instance_ is a thing:

```jsonc
{
  "uri": "...", // the URI of an instance
  "creations": "...", // a URI of an endpoint to get and post creations
}
```

For an example, see https://iliazeus.lol/puddle/instance.json.

When `instance.creations` URI is fetched, it should return a _page_;
the `items` of this page are _creations_.

A _page_ looks like this:

```jsonc
{
  "items": [], // a list of things
  "next": "...", // a URI of the next page; might be missing if page is last
}
```

A _creation_ looks like this:

```jsonc
{
  "uri": "...",
  "type": "...", // type is a string, short and lowercase
  "title": "...", // a human-readable title

  // additional media; all of it may be considered optional
  "data": "...", // any string; meaning depends on the type
  "text": "...", // human-readable text
  "image": "...", // a URI (can be data: URI) of an image
  // TODO: other media
}
```

A `POST` request to an `instance.creations` endpoint makes a new creation.

The body of this request should include the creation as described above, but without the `uri`.
The instance assigns the `uri` itself, and returns the creation back, possibly modified.
