//======================//
// PONDIVERSE CONSTANTS //
//======================//
// Configure these to your needs
export const DEFAULT_STORE = {
  name: "puddle",
  home: "https://iliazeus.lol/puddle/",
  addCreation: "https://api.iliazeus.lol/puddle/creations",
  getCreation: "https://api.iliazeus.lol/puddle/creations/",
  // getCreationImage: "TODO", // i have images as data URIs inside creations currently
  getCreations: "https://api.iliazeus.lol/puddle/creations",
};

const PONDIVERSE_BUTTON_STYLE = `
  .pondiverse-button-container {
    position: fixed;
    box-sizing: border-box;
    bottom: 0;
    right: 0;
    z-index: 9999;
  }

  .pondiverse-button {
    border-radius: 100%;
    background-color: #4680ff;
    border: white 3px solid;
    height: 45px;
    width: 45px;
    cursor: pointer;
    margin: 10px;
    transition: transform 0.2s;
    color: white;
    font-size: 25px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  .pondiverse-button:hover {
    transform: scale(1.1);
  }

  #pondiverse-dialog {
    color: white;
    font-size: 20px;
    text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5);
    font-family: sans-serif;
    padding: 0px;
    background-color: transparent;
    border: none;
  }

  #pondiverse-dialog a {
    color: #46ff80;
    font-weight: bold;
  }

  #pondiverse-dialog a:focus {
    outline: 2px solid #46ff80;
  }

  #pondiverse-dialog a:hover {
    background-color: #46ff80;
    color: black;
    text-shadow: none;
    text-decoration: none;
    outline: 2px solid #46ff80;
  }

  #pondiverse-dialog form {
    // box-sizing: border-box;
    background-color: #4680ff;
    border-radius: 20px;
    outline: none;
    border: 3px solid white;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  #pondiverse-dialog input[type="text"] {
    width: 100%;
    padding: 10px 15px;
    margin: 10px 0;
    border: 3px inset #3670ee;
    border-radius: 10px;
    background-color: #fff;
    color: #000;
    font-size: 16px;
  }

  #pondiverse-dialog:focus {
    outline: none;
  }

  #pondiverse-dialog input[type="text"]:focus {
    outline: 2px solid #46ff80;
    outline-offset: 0px;
  }

  #pondiverse-dialog button {
    background-color: #4680ff;
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 16px;
    color: white;
    margin-top: 10px;
    border: 3px outset #3670ee;
    user-select: none;
  }

  #pondiverse-dialog button:focus {
    border: 3px inset #3670ee;
  }

  #pondiverse-dialog hgroup.space {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  #pondiverse-dialog #preview-image {
    max-width: 100%;
    max-height: 300px;
    margin: 10px auto;
  }
  `;

//============================//
// FETCH PONDIVERSE CREATIONS //
//============================//
// For getting a page-ful of creations
export async function fetchPondiverseCreations({
  store = DEFAULT_STORE,
} = {}) {
  const response = await fetch(store.getCreations);
  const json = await response.json();
  return json.rows ?? json.items;
}

//===========================//
// FETCH PONDIVERSE CREATION //
//===========================//
// For getting a single creation by its id
export async function fetchPondiverseCreation(
  id,
  { store = DEFAULT_STORE } = {}
) {
  if (id === undefined || id === null) {
    // bad code only
    throw new Error("You need to provide an id to fetch a creation");
  }
  let url = store.getCreation + id;
  const idNumber = parseInt(id);
  if (isNaN(idNumber)) {
    if (!id.startsWith("http") && !id.startsWith("localhost")) {
      throw new Error(
        "You need to provide a valid id or a URL to fetch a creation"
      );
    }
    url = id;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await response.json();
}

//===================================//
// GET PONDIVERSE CREATION IMAGE URL //
//===================================//
// Get the image URL for a creation
export function getPondiverseCreationImageUrl(
  creation,
  { store = DEFAULT_STORE } = {}
) {
  if (creation.image) {
    return creation.image;
  }
  if (!store.getCreationImage) {
    return null;
  }
  return store.getCreationImage + creation.id;
}

//=======================//
// ADD PONDIVERSE BUTTON //
//=======================//
export function addPondiverseButton(
  getPondiverseCreation,
  { store = DEFAULT_STORE } = {}
) {
  window.getPondiverseCreation = getPondiverseCreation;
  const styleSheet = document.createElement("style");
  styleSheet.innerText = PONDIVERSE_BUTTON_STYLE;
  document.head.appendChild(styleSheet);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "pondiverse-button-container";

  const button = document.createElement("button");
  button.className = "pondiverse-button";
  button.textContent = "✶";

  buttonContainer.append(button);
  document.body.append(buttonContainer);

  const dialog = document.createElement("dialog");
  document.body.append(dialog);
  dialog.id = "pondiverse-dialog";

  dialog.innerHTML = `
  <form>
  <p>Do you want to share your creation to <a href="${store.home}">${store.name}</a>?</p>
  <p>It will then become part of the <a href="https://pondiverse.com">Pondiverse</a>.</p>
  <p><img id="preview-image" src="" alt="Thumbnail of your creation"></p>
  <label for="name">Title</label>
  <input type="text" id="name" name="name" required autocomplete="off" spellcheck="false" />
  <input type="hidden" name="data" value="" />
  <input type="hidden" name="type" value="" />
  <hgroup class="space">
    <button type="button" class="secondary" id="cancel">Cancel</button>
    <button type="submit">Publish</button>
  </hgroup>
  </form>
  `;

  const previewImage = dialog.querySelector("#preview-image");
  previewImage.onerror = () => {
    previewImage.style.display = "none";
  };
  previewImage.onload = () => {
    previewImage.style.display = "block";
  };

  const nameInput = dialog.querySelector("#name");
  nameInput.addEventListener(
    "keydown",
    (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    },
    { passive: false, bubble: false }
  );

  dialog.addEventListener(
    "keydown",
    (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    },
    { passive: false, bubble: false }
  );

  dialog.addEventListener("pointerdown", (e) => e.stopPropagation());
  button.addEventListener("pointerdown", (e) => e.stopPropagation());
  dialog.addEventListener("mousedown", (e) => e.stopPropagation());
  button.addEventListener("mousedown", (e) => e.stopPropagation());
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    openPondiverseDialog();
  });

  const cancelButton = dialog.querySelector("#cancel");
  cancelButton.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    closePondiverseDialog();
  });

  const form = dialog.querySelector("form");

  const hiddenInput = dialog.querySelector("input[name='data']");
  const typeInput = dialog.querySelector("input[name='type']");
  form.addEventListener("submit", async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const request = {
      title: nameInput.value,
      data: hiddenInput.value,
      type: typeInput.value,
      image: previewImage.src,
    };

    const publishButton = form.querySelector("button[type='submit']");
    publishButton.disabled = true;
    publishButton.textContent = "Publishing...";
    publishButton.style.cursor = "not-allowed";

    const response = await fetch(store.addCreation, {
      method: "POST",
      body: JSON.stringify(request),
    });

    if (response.ok) {
      closePondiverseDialog();
    } else {
      alert("Upload failed. Oh no!");
    }
  });

  dialog.addEventListener("wheel", (e) => {
    e.stopPropagation();
    e.preventDefault();
  });
}

//========================//
// OPEN PONDIVERSE DIALOG //
//========================//
// Use this if you want to programmatically open the dialog
export function openPondiverseDialog() {
  const dialog = document.getElementById("pondiverse-dialog");
  if (!dialog) {
    throw new Error(
      "Pondiverse dialog not found. Make sure you run addPondiverseButton() first."
    );
  }
  dialog.showModal();
  const titleInput = dialog.querySelector("#name");
  titleInput.value = "";
  const previewImage = dialog.querySelector("#preview-image");

  const getCreation = window.getPondiverseCreation;
  if (!getCreation) {
    throw new Error(
      `\n\nwindow.getPondiverseCreation() function not found.\n\nIf you want your creation to be sent to the Pondiverse, add a window.getPondiverseCreation() function that returns a JSON object. The JSON object can provide:\n- type: A string to identify what kind of creation it is. For example, "screenpond" if it's intended to be loaded into screenpond.\n- data: A string containing the data of your creation, so that it can be loaded up again.\n- image: A base64 data URL string to be used as a thumbnail for your creation.\n\nAll properties are optional.`
    );
  }

  const creation = getCreation();

  if (creation.image) {
    previewImage.src = creation.image;
  }

  const hiddenInput = dialog.querySelector("input[name='data']");
  const typeInput = dialog.querySelector("input[name='type']");
  if (creation.data) {
    hiddenInput.value = creation.data;
  }
  if (creation.type) {
    typeInput.value = creation.type;
  }
  titleInput.focus();
}

//=========================//
// CLOSE PONDIVERSE DIALOG //
//=========================//
// Use this if you want to programmatically close the dialog
export function closePondiverseDialog() {
  const dialog = document.getElementById("pondiverse-dialog");

  if (!dialog) {
    throw new Error(
      "Pondiverse dialog not found. Make sure you run addPondiverseButton() first."
    );
  }
  const publishButton = dialog.querySelector("button[type='submit']");
  publishButton.disabled = false;
  publishButton.textContent = "Publish";
  publishButton.style.cursor = "pointer";
  dialog.close();
}
