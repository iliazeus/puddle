// import { fetchJson, postJson } from "./library.js";
import { fetchJson, postJson } from "./quirks.js";

export async function addPondiverseButton(storeUri, getPondiverseCreation) {
  window.getPondiverseCreation = getPondiverseCreation;
  const store = await fetchJson(storeUri);

  const style = `
  .puddle-button-container {
    position: fixed;
    box-sizing: border-box;
    bottom: 0;
    right: 0;
    z-index: 9999;
  }

  .puddle-button {
    border-radius: 100%;
    background-color: #8f3bc0;
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

  .puddle-button:hover {
    transform: scale(1.1);
  }

  #puddle-dialog {
    color: white;
    font-size: 20px;
    text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5);
    font-family: sans-serif;
    padding: 0px;
    background-color: transparent;
    border: none;
  }

  #puddle-dialog a {
    color: #46ff80;
    font-weight: bold;
  }

  #puddle-dialog a:focus {
    outline: 2px solid #46ff80;
  }

  #puddle-dialog a:hover {
    background-color: #46ff80;
    color: black;
    text-shadow: none;
    text-decoration: none;
    outline: 2px solid #46ff80;
  }

  #puddle-dialog form {
    // box-sizing: border-box;
    background-color: #4680ff;
    border-radius: 20px;
    outline: none;
    border: 3px solid white;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  #puddle-dialog input[type="text"] {
    width: 100%;
    padding: 10px 15px;
    margin: 10px 0;
    border: 3px inset #3670ee;
    border-radius: 10px;
    background-color: #fff;
    color: #000;
    font-size: 16px;
  }

  #puddle-dialog:focus {
    outline: none;
  }

  #puddle-dialog input[type="text"]:focus {
    outline: 2px solid #46ff80;
    outline-offset: 0px;
  }

  #puddle-dialog button {
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

  #puddle-dialog button:focus {
    border: 3px inset #3670ee;
  }

  #puddle-dialog hgroup.space {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  #puddle-dialog #preview-image {
    max-width: 100%;
    max-height: 300px;
    margin: 10px auto;
  }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.innerText = style;
  document.head.appendChild(styleSheet);

  const buttonContainer =
    document.querySelector(".pondiverse-button-container") ??
    document.createElement("div");
  buttonContainer.className += "puddle-button-container";

  const button = document.createElement("button");
  button.className = "puddle-button";
  button.textContent = "✶";

  buttonContainer.append(button);
  document.body.append(buttonContainer);

  const dialog = document.createElement("dialog");
  document.body.append(dialog);
  dialog.id = "puddle-dialog";

  dialog.innerHTML = `
  <form>
  <p>Do you want to share your creation to <a href="${store.home}">${store.name}</a>?</p>
  <p>It will then become part of the <a href="https://pondiverse.com">Pondiverse</a>.</p>
  <p>All creations get deleted after 25 hours.</p>
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

    try {
      await postJson(store.creations, request);

      closePondiverseDialog();
    } catch (e) {
      alert("Upload failed. Oh no!\n" + e);
    }
  });

  dialog.addEventListener("wheel", (e) => {
    e.stopPropagation();
    e.preventDefault();
  });
}

export function openPondiverseDialog() {
  const dialog = document.getElementById("puddle-dialog");
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

export function closePondiverseDialog() {
  const dialog = document.getElementById("puddle-dialog");

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
