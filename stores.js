export const stores = [
  {
    name: "todepondiverse",
    home: "https://todepond.com/pondiverse/",
    addCreation: "https://pondiverse.val.run/add-creation",
    getCreation: "https://pondiverse.val.run/get-creation?id=",
    getCreationImage: "https://pondiverse.val.run/get-creation-image?id=", // `creation.image` is null
    getCreations: "https://pondiverse.val.run/get-creations", // returns `rows` instead of `items`
  },
  {
    name: "puddle",
    home: "https://iliazeus.lol/puddle/",
    addCreation: "https://api.iliazeus.lol/puddle/creations",
    getCreation: "https://api.iliazeus.lol/puddle/creations/",
    // getCreationImage: "TODO", // i have image urls inside creations currently
    getCreations: "https://api.iliazeus.lol/puddle/creations",
  },
  {
    // elouan.xyz's store, currently just a fork of the todepondiverse store
    name: "oceaniverse",
    home: "https://oceaniverse.elouan.xyz",
    addCreation: "https://theoceaniverse.val.run/add-creation",
    getCreation: "https://theoceaniverse.val.run/get-creation?id=",
    getCreationImage: "https://theoceaniverse.val.run/get-creation-image?id=",
    getCreations: "https://theoceaniverse.val.run/get-creations",
  },
];
