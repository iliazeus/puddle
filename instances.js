export const instances = [
  {
    name: "todepondiverse",
    home: "https://pondiverse.com/",
    addCreation: "https://pondiverse.val.run/add-creation",
    getCreation: "https://pondiverse.val.run/get-creation?id=",
    getCreationImage: "https://pondiverse.val.run/get-creation-image?id=", // `creation.image` is null
    getCreations: "https://pondiverse.val.run/get-creations", // returns `rows` instead of `items`
  },
  {
    name: "puddle",
    home: "https://iliazeus.lol/puddle/",
    addCreation: "https://iliazeus-puddle.web.val.run/creations/",
    getCreation: "https://iliazeus-puddle.web.val.run/creations/",
    // getCreationImage: "TODO", // i have images as data URIs inside creations currently
    getCreations: "https://iliazeus-puddle.web.val.run/creations",
  },
];
