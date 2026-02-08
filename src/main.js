import { loadCharacters } from "./character-data.js";

const PhaserSceneBase = window.Phaser?.Scene || class {};

const selectionScreen = document.getElementById("selection-screen");
const gameScreen = document.getElementById("game-screen");
const characterGrid = document.getElementById("character-grid");
const confirmSelectionButton = document.getElementById("confirm-selection");
const backToSelectionButton = document.getElementById("back-to-selection");
const hudTextElement = document.getElementById("hud-text");
const sprintButtonElement = document.getElementById("sprint-btn");
const AVATAR_PREVIEW_BASE_WIDTH = 56;
const AVATAR_PREVIEW_BASE_HEIGHT = 56;
const AVATAR_PREVIEW_SCALE = 4;
const DEFAULT_AVATAR_TRAITS = {
  browStyle: "straight",
  expression: "neutral",
  nose: "short",
  gaze: "center",
  helmetStripe: "center",
  badgeStyle: "bar",
  mark: "none",
};
const AVATAR_TRAITS_BY_ID = {
  andu: { browStyle: "heavy", expression: "smirk", nose: "wide", gaze: "right", helmetStripe: "dual", badgeStyle: "alpha", mark: "scar" },
  andri: { browStyle: "angled", expression: "neutral", nose: "long", gaze: "left", helmetStripe: "center", badgeStyle: "compass", mark: "none" },
  tiago: { browStyle: "heavy", expression: "smile", nose: "short", gaze: "center", helmetStripe: "split", badgeStyle: "wave", mark: "freckles" },
  patricio: { browStyle: "straight", expression: "smile", nose: "wide", gaze: "center", helmetStripe: "center", badgeStyle: "heart", mark: "none" },
  "luki-w": { browStyle: "angled", expression: "smirk", nose: "long", gaze: "left", helmetStripe: "minimal", badgeStyle: "eclipse", mark: "none" },
  "luki-f": { browStyle: "straight", expression: "smile", nose: "short", gaze: "right", helmetStripe: "chevron", badgeStyle: "bolt", mark: "none" },
  marc: { browStyle: "heavy", expression: "neutral", nose: "wide", gaze: "right", helmetStripe: "edge", badgeStyle: "palm", mark: "mole" },
  camilo: { browStyle: "angled", expression: "smile", nose: "long", gaze: "center", helmetStripe: "dual", badgeStyle: "mountain", mark: "none" },
  peter: { browStyle: "straight", expression: "neutral", nose: "short", gaze: "center", helmetStripe: "center", badgeStyle: "cross", mark: "none" },
};

let selectedCharacterId = null;
let gameInstance = null;
let activeScene = null;
let characterDefinitions = [];
let characterLookup = new Map();
let music = null;

characterGrid.innerHTML = '<p class="loading-text">Lade Teamdaten ...</p>';
confirmSelectionButton.disabled = true;

bootstrap();

async function bootstrap() {
  characterDefinitions = await loadCharacters();
  characterLookup = new Map(characterDefinitions.map((char) => [char.id, char]));
  renderCharacterSelection();
}

confirmSelectionButton.addEventListener("click", () => {
  if (!selectedCharacterId) {
    return;
  }

  const selected = characterLookup.get(selectedCharacterId);
  if (!selected) {
    return;
  }

  startGame(selected);
});

backToSelectionButton.addEventListener("click", () => {
  shutdownGame();
  selectedCharacterId = null;
  confirmSelectionButton.disabled = true;
  highlightSelectedCard();
  gameScreen.classList.remove("active");
  selectionScreen.classList.add("active");
});

function renderCharacterSelection() {
  characterGrid.innerHTML = "";

  if (!characterDefinitions.length) {
    characterGrid.innerHTML = '<p class="loading-text">Kei Fahrerdate gefunden.</p>';
    return;
  }

  for (const character of characterDefinitions) {
    const card = document.createElement("article");
    card.className = "character-card";
    card.setAttribute("role", "listitem");
    card.dataset.characterId = character.id;

    const avatar = createAvatarNode(character);

    const cardContent = document.createElement("div");
    cardContent.className = "card-content";

    const title = document.createElement("h3");
    title.textContent = character.name;

    const bio = document.createElement("p");
    bio.className = "card-bio";
    bio.textContent = character.bio;

    const stats = document.createElement("div");
    stats.className = "stat-list";

    addStatRow(stats, `Flach ${character.stats.flat}`, character.stats.flat);
    addStatRow(stats, `Uffahrt ${character.stats.ascending}`, character.stats.ascending);
    addStatRow(stats, `Abfahrt ${character.stats.descending}`, character.stats.descending);

    const sprintPercent = Math.min(100, (character.stats.sprintMultiplier / 2) * 100);
    addStatRow(stats, `Sprint x${formatMultiplier(character.stats.sprintMultiplier)}`, sprintPercent);

    cardContent.append(title, bio, stats);
    card.append(avatar, cardContent);

    card.addEventListener("click", () => {
      selectedCharacterId = character.id;
      confirmSelectionButton.disabled = false;
      highlightSelectedCard();
    });

    characterGrid.append(card);
  }
}

function createAvatarNode(character) {
  const wrapper = document.createElement("div");
  wrapper.className = "avatar-frame";
  const previewWidth = AVATAR_PREVIEW_BASE_WIDTH * AVATAR_PREVIEW_SCALE;
  const previewHeight = AVATAR_PREVIEW_BASE_HEIGHT * AVATAR_PREVIEW_SCALE;
  wrapper.style.setProperty("--avatar-preview-width", `${previewWidth}px`);
  wrapper.style.setProperty("--avatar-preview-height", `${previewHeight}px`);
  wrapper.append(createFallbackAvatarCanvas(character));
  return wrapper;
}

function createFallbackAvatarCanvas(character) {
  const canvas = document.createElement("canvas");
  canvas.className = "avatar-canvas";
  canvas.width = AVATAR_PREVIEW_BASE_WIDTH * AVATAR_PREVIEW_SCALE;
  canvas.height = AVATAR_PREVIEW_BASE_HEIGHT * AVATAR_PREVIEW_SCALE;
  canvas.style.width = `${AVATAR_PREVIEW_BASE_WIDTH * AVATAR_PREVIEW_SCALE}px`;
  canvas.style.height = `${AVATAR_PREVIEW_BASE_HEIGHT * AVATAR_PREVIEW_SCALE}px`;
  canvas.setAttribute("aria-label", `${character.name} Figur`);
  drawHabboAvatar(canvas, character.visual, AVATAR_PREVIEW_SCALE, character.id);
  return canvas;
}

function drawHabboAvatar(canvas, visual, scale = 1, characterId = "") {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const traits = resolveAvatarTraits(characterId, visual);
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  const outline = 0x3b2f2a;
  const skin = visual.skinColor;
  const jerseyMain = visual.jerseyPrimary;
  const jerseySecondary = visual.jerseySecondary;
  const jerseyAccent = visual.jerseyAccent;
  const jerseyTertiary = visual.jerseyTertiary || visual.jerseySecondary;
  const sleeveColor = visual.sleeveColor || visual.jerseyPrimary;
  const shorts = visual.shortsColor;
  const sock = visual.sockColor;
  const shoe = visual.shoeColor;

  fillRect(ctx, 0, 0, AVATAR_PREVIEW_BASE_WIDTH, AVATAR_PREVIEW_BASE_HEIGHT, 0xf7efdf);
  fillRect(ctx, 0, 38, AVATAR_PREVIEW_BASE_WIDTH, 18, 0xe8d7b4);
  fillRect(ctx, 0, 45, AVATAR_PREVIEW_BASE_WIDTH, 11, 0xd4bb8d);
  fillRect(ctx, 0, 44, AVATAR_PREVIEW_BASE_WIDTH, 1, 0xcfb07e);
  fillRect(ctx, 24, 40, 3, 7, 0xf1e7ca, 0.6);
  fillRect(ctx, 32, 41, 2, 6, 0xf1e7ca, 0.45);
  fillRect(ctx, 8, 42, 2, 4, 0xf1e7ca, 0.32);
  fillRect(ctx, 5, 5, 8, 3, 0xffffff, 0.2);

  fillRect(ctx, 13, 49, 18, 4, 0x6a533f, 0.3);
  fillRect(ctx, 16, 51, 12, 2, 0x4f3d2e, 0.22);

  fillRect(ctx, 16, 37, 6, 12, shorts);
  fillRect(ctx, 23, 38, 6, 11, shorts);
  fillRect(ctx, 16, 37, 1, 12, shadeColor(shorts, -0.16));
  fillRect(ctx, 28, 38, 1, 11, shadeColor(shorts, -0.16));
  fillRect(ctx, 19, 37, 1, 12, shadeColor(shorts, -0.2), 0.46);
  fillRect(ctx, 25, 38, 1, 11, shadeColor(shorts, -0.2), 0.46);
  fillRect(ctx, 18, 38, 2, 2, shadeColor(shorts, 0.1));
  fillRect(ctx, 24, 39, 2, 2, shadeColor(shorts, 0.1));

  fillRect(ctx, 16, 45, 6, 3, sock);
  fillRect(ctx, 23, 46, 6, 2, sock);
  fillRect(ctx, 16, 46, 6, 1, shadeColor(sock, 0.08));
  fillRect(ctx, 23, 47, 6, 1, shadeColor(sock, 0.08));
  fillRect(ctx, 16, 45, 6, 1, shadeColor(sock, -0.14));
  fillRect(ctx, 23, 46, 6, 1, shadeColor(sock, -0.14));

  fillRect(ctx, 15, 48, 7, 3, shoe);
  fillRect(ctx, 23, 48, 7, 3, shoe);
  fillRect(ctx, 15, 50, 7, 1, shadeColor(shoe, -0.2));
  fillRect(ctx, 23, 50, 7, 1, shadeColor(shoe, -0.2));

  fillRect(ctx, 14, 22, 15, 16, jerseyMain);
  applyJerseyPattern(ctx, visual.jerseyPattern, 14, 22, 15, 16, {
    main: jerseyMain,
    secondary: jerseySecondary,
    accent: jerseyAccent,
    tertiary: jerseyTertiary,
    sleeve: sleeveColor,
  });
  drawJerseyDetails(ctx, visual, traits);

  const armTopColor = visual.sleeveStyle === "long" ? sleeveColor : skin;
  fillRect(ctx, 11, 24, 4, 10, armTopColor);
  fillRect(ctx, 29, 24, 4, 10, armTopColor);
  fillRect(ctx, 11, 24, 1, 10, shadeColor(armTopColor, -0.1));
  fillRect(ctx, 32, 24, 1, 10, shadeColor(armTopColor, -0.1));
  if (visual.sleeveStyle === "short") {
    fillRect(ctx, 11, 30, 4, 4, skin);
    fillRect(ctx, 29, 30, 4, 4, skin);
    fillRect(ctx, 11, 30, 4, 1, shadeColor(skin, -0.09));
  }

  fillRect(ctx, 10, 33, 3, 2, visual.gloveColor);
  fillRect(ctx, 31, 33, 3, 2, visual.gloveColor);
  fillRect(ctx, 10, 34, 3, 1, shadeColor(visual.gloveColor, -0.16));
  fillRect(ctx, 31, 34, 3, 1, shadeColor(visual.gloveColor, -0.16));

  fillRect(ctx, 20, 22, 5, 2, shadeColor(skin, -0.12));
  fillRect(ctx, 17, 11, 12, 12, skin);
  fillRect(ctx, 16, 16, 1, 4, skin);
  fillRect(ctx, 29, 16, 1, 4, skin);
  fillRect(ctx, 17, 11, 12, 1, shadeColor(skin, 0.08));
  fillRect(ctx, 28, 14, 1, 7, shadeColor(skin, -0.12));
  fillRect(ctx, 17, 14, 1, 7, shadeColor(skin, -0.08));
  fillRect(ctx, 16, 16, 1, 3, shadeColor(skin, -0.08));
  fillRect(ctx, 29, 16, 1, 3, shadeColor(skin, -0.08));
  fillRect(ctx, 20, 12, 6, 1, shadeColor(skin, 0.12));
  fillRect(ctx, 18, 20, 10, 1, shadeColor(skin, 0.06), 0.4);
  drawFacialDetails(ctx, visual, traits, skin);

  if (visual.beardStyle === "stubble") {
    fillRect(ctx, 20, 20, 6, 1, shadeColor(traits.beardColor, -0.08));
  } else if (visual.beardStyle === "full") {
    fillRect(ctx, 19, 19, 7, 3, traits.beardColor);
    fillRect(ctx, 19, 21, 7, 1, shadeColor(traits.beardColor, -0.14));
  }

  fillRect(ctx, 15, 8, 15, 5, visual.helmetColor);
  fillRect(ctx, 16, 7, 13, 2, visual.helmetColor);
  fillRect(ctx, 15, 12, 15, 1, shadeColor(visual.helmetColor, -0.22));
  fillRect(ctx, 18, 12, 10, 1, shadeColor(visual.helmetAccent, -0.18), 0.35);
  drawHelmetDetails(ctx, visual, traits);

  if (visual.glassesStyle === "sport") {
    fillRect(ctx, 20, 14, 6, 2, visual.visorColor);
    fillRect(ctx, 19, 14, 1, 2, outline);
    fillRect(ctx, 26, 14, 1, 2, outline);
    fillRect(ctx, 20, 14, 2, 1, 0xffffff, 0.22);
  } else if (visual.glassesStyle === "visor") {
    fillRect(ctx, 18, 13, 9, 3, visual.visorColor);
    fillRect(ctx, 17, 13, 1, 2, outline);
    fillRect(ctx, 27, 13, 1, 2, outline);
    fillRect(ctx, 19, 13, 4, 1, 0xffffff, 0.22);
  }

  fillRect(ctx, 18, 19, 1, 5, shadeColor(visual.helmetAccent, -0.26));
  fillRect(ctx, 27, 19, 1, 5, shadeColor(visual.helmetAccent, -0.26));

  drawRoadBikePreview(ctx, visual, traits, "back");
  drawHabboOutline(ctx, outline);
  drawRoadBikePreview(ctx, visual, traits, "front");
}

function resolveAvatarTraits(characterId, visual) {
  const preset = AVATAR_TRAITS_BY_ID[characterId] || {};
  return {
    ...DEFAULT_AVATAR_TRAITS,
    ...preset,
    browColor: preset.browColor || shadeColor(visual.helmetAccent, -0.12),
    beardColor: preset.beardColor || shadeColor(visual.helmetAccent, -0.28),
    badgeColor: preset.badgeColor || shadeColor(visual.jerseyAccent, 0.05),
  };
}

function drawJerseyDetails(ctx, visual, traits) {
  fillRect(ctx, 14, 22, 2, 16, shadeColor(visual.jerseyPrimary, -0.14));
  fillRect(ctx, 27, 22, 2, 16, shadeColor(visual.jerseyPrimary, -0.14));
  fillRect(ctx, 20, 22, 3, 2, shadeColor(visual.jerseySecondary, 0.2));
  fillRect(ctx, 21, 24, 1, 12, shadeColor(visual.jerseySecondary, 0.34));
  fillRect(ctx, 21, 24, 1, 12, 0xffffff, 0.16);
  fillRect(ctx, 17, 24, 10, 1, shadeColor(visual.jerseyPrimary, -0.14));
  fillRect(ctx, 17, 29, 10, 1, shadeColor(visual.jerseyPrimary, -0.08), 0.5);
  fillRect(ctx, 17, 32, 10, 1, shadeColor(visual.jerseyPrimary, -0.08), 0.45);
  fillRect(ctx, 17, 34, 10, 1, shadeColor(visual.jerseyPrimary, -0.1));
  fillRect(ctx, 20, 36, 3, 1, shadeColor(visual.jerseySecondary, 0.26), 0.5);
  fillRect(ctx, 16, 27, 1, 5, shadeColor(visual.jerseyPrimary, -0.18), 0.4);
  fillRect(ctx, 26, 27, 1, 5, shadeColor(visual.jerseyPrimary, -0.18), 0.4);
  drawBadgeSymbol(ctx, 24, 25, traits.badgeStyle, traits.badgeColor);
  drawBadgeSymbol(ctx, 17, 26, "bar", shadeColor(visual.jerseyAccent, -0.08));
}

function drawBadgeSymbol(ctx, x, y, style, color) {
  switch (style) {
    case "alpha":
      fillRect(ctx, x, y + 1, 1, 3, color);
      fillRect(ctx, x + 3, y + 1, 1, 3, color);
      fillRect(ctx, x + 1, y, 2, 1, color);
      fillRect(ctx, x + 1, y + 2, 2, 1, color);
      break;
    case "compass":
      fillRect(ctx, x + 1, y, 2, 1, color);
      fillRect(ctx, x, y + 1, 4, 1, color);
      fillRect(ctx, x + 1, y + 2, 2, 2, color);
      break;
    case "wave":
      fillRect(ctx, x, y + 2, 2, 1, color);
      fillRect(ctx, x + 1, y + 1, 2, 1, color);
      fillRect(ctx, x + 2, y + 2, 2, 1, color);
      break;
    case "heart":
      fillRect(ctx, x, y + 1, 1, 1, color);
      fillRect(ctx, x + 2, y + 1, 1, 1, color);
      fillRect(ctx, x + 1, y + 1, 1, 1, color);
      fillRect(ctx, x, y + 2, 3, 1, color);
      fillRect(ctx, x + 1, y + 3, 1, 1, color);
      break;
    case "eclipse":
      fillRect(ctx, x + 1, y, 2, 1, color);
      fillRect(ctx, x, y + 1, 4, 2, color);
      fillRect(ctx, x + 2, y + 1, 2, 2, shadeColor(color, -0.28));
      fillRect(ctx, x + 1, y + 3, 2, 1, color);
      break;
    case "bolt":
      fillRect(ctx, x + 1, y, 2, 1, color);
      fillRect(ctx, x + 1, y + 1, 1, 1, color);
      fillRect(ctx, x + 2, y + 1, 1, 2, color);
      fillRect(ctx, x + 1, y + 3, 1, 1, color);
      break;
    case "palm":
      fillRect(ctx, x + 1, y, 2, 1, color);
      fillRect(ctx, x + 1, y + 1, 1, 2, color);
      fillRect(ctx, x + 2, y + 1, 1, 2, color);
      fillRect(ctx, x + 1, y + 3, 2, 1, color);
      break;
    case "mountain":
      fillRect(ctx, x, y + 3, 4, 1, color);
      fillRect(ctx, x + 1, y + 2, 2, 1, color);
      fillRect(ctx, x + 1, y + 1, 1, 1, color);
      fillRect(ctx, x + 2, y + 1, 1, 1, shadeColor(color, -0.2));
      break;
    case "cross":
      fillRect(ctx, x + 1, y, 2, 1, color);
      fillRect(ctx, x, y + 1, 4, 1, color);
      fillRect(ctx, x + 1, y + 2, 2, 1, color);
      fillRect(ctx, x + 1, y + 3, 2, 1, color);
      break;
    default:
      fillRect(ctx, x, y + 1, 4, 1, color);
      fillRect(ctx, x, y + 3, 4, 1, color);
      break;
  }
}

function drawFacialDetails(ctx, visual, traits, skin) {
  const eyeWhite = 0xf8f6ef;
  const iris = shadeColor(visual.visorColor, -0.24);
  const browColor = traits.browColor;
  const noseColor = shadeColor(skin, -0.24);
  const mouthColor = shadeColor(skin, -0.45);
  const gazeOffset = traits.gaze === "left" ? -1 : traits.gaze === "right" ? 1 : 0;

  if (traits.browStyle === "heavy") {
    fillRect(ctx, 19, 13, 4, 1, browColor);
    fillRect(ctx, 23, 13, 4, 1, browColor);
  } else if (traits.browStyle === "angled") {
    fillRect(ctx, 19, 13, 3, 1, browColor);
    fillRect(ctx, 24, 12, 3, 1, browColor);
    fillRect(ctx, 24, 13, 1, 1, browColor);
  } else {
    fillRect(ctx, 19, 13, 3, 1, browColor);
    fillRect(ctx, 24, 13, 3, 1, browColor);
  }

  fillRect(ctx, 20, 15, 2, 1, eyeWhite);
  fillRect(ctx, 24, 15, 2, 1, eyeWhite);
  fillRect(ctx, 20, 14, 2, 1, shadeColor(skin, -0.14), 0.2);
  fillRect(ctx, 24, 14, 2, 1, shadeColor(skin, -0.14), 0.2);
  fillRect(ctx, 20 + gazeOffset, 15, 1, 1, iris);
  fillRect(ctx, 24 + gazeOffset, 15, 1, 1, iris);
  fillRect(ctx, 20 + gazeOffset, 15, 1, 1, shadeColor(iris, -0.22), 0.8);
  fillRect(ctx, 24 + gazeOffset, 15, 1, 1, shadeColor(iris, -0.22), 0.8);

  switch (traits.nose) {
    case "wide":
      fillRect(ctx, 22, 17, 2, 2, noseColor);
      break;
    case "long":
      fillRect(ctx, 23, 16, 1, 3, noseColor);
      break;
    default:
      fillRect(ctx, 23, 17, 1, 2, noseColor);
      break;
  }

  if (traits.expression === "smile") {
    fillRect(ctx, 21, 20, 6, 1, mouthColor);
    fillRect(ctx, 22, 21, 4, 1, mouthColor);
  } else if (traits.expression === "smirk") {
    fillRect(ctx, 22, 20, 5, 1, mouthColor);
    fillRect(ctx, 25, 21, 2, 1, mouthColor);
  } else {
    fillRect(ctx, 22, 20, 4, 1, mouthColor);
  }

  fillRect(ctx, 20, 19, 2, 1, shadeColor(skin, -0.1), 0.28);
  fillRect(ctx, 24, 19, 2, 1, shadeColor(skin, -0.1), 0.28);
  fillRect(ctx, 21, 22, 5, 1, shadeColor(skin, 0.12), 0.45);

  if (traits.mark === "scar") {
    fillRect(ctx, 27, 16, 1, 3, shadeColor(skin, -0.35));
  } else if (traits.mark === "freckles") {
    fillRect(ctx, 19, 18, 1, 1, shadeColor(skin, -0.3));
    fillRect(ctx, 27, 18, 1, 1, shadeColor(skin, -0.3));
  } else if (traits.mark === "mole") {
    fillRect(ctx, 27, 20, 1, 1, shadeColor(skin, -0.45));
  }
}

function drawHelmetDetails(ctx, visual, traits) {
  fillRect(ctx, 17, 8, 11, 1, shadeColor(visual.helmetColor, 0.08));
  fillRect(ctx, 18, 9, 1, 2, shadeColor(visual.helmetColor, -0.2));
  fillRect(ctx, 20, 9, 1, 2, shadeColor(visual.helmetColor, -0.2));
  fillRect(ctx, 22, 9, 1, 2, shadeColor(visual.helmetColor, -0.2));
  fillRect(ctx, 24, 9, 1, 2, shadeColor(visual.helmetColor, -0.2));
  fillRect(ctx, 26, 9, 1, 2, shadeColor(visual.helmetColor, -0.2));

  switch (traits.helmetStripe) {
    case "dual":
      fillRect(ctx, 18, 7, 1, 6, visual.helmetAccent);
      fillRect(ctx, 25, 7, 1, 6, visual.helmetAccent);
      break;
    case "split":
      fillRect(ctx, 21, 7, 1, 6, visual.helmetAccent);
      fillRect(ctx, 23, 7, 1, 6, visual.helmetAccent);
      break;
    case "chevron":
      fillRect(ctx, 21, 7, 2, 2, visual.helmetAccent);
      fillRect(ctx, 20, 9, 4, 2, visual.helmetAccent);
      fillRect(ctx, 19, 11, 6, 2, visual.helmetAccent);
      break;
    case "minimal":
      fillRect(ctx, 21, 7, 1, 5, visual.helmetAccent);
      break;
    case "edge":
      fillRect(ctx, 17, 7, 1, 5, visual.helmetAccent);
      fillRect(ctx, 27, 7, 1, 5, visual.helmetAccent);
      break;
    default:
      fillRect(ctx, 21, 7, 2, 6, visual.helmetAccent);
      break;
  }

  fillRect(ctx, 16, 12, 2, 1, visual.helmetAccent);
  fillRect(ctx, 27, 12, 2, 1, visual.helmetAccent);
  fillRect(ctx, 16, 13, 1, 3, shadeColor(visual.helmetAccent, -0.14));
  fillRect(ctx, 28, 13, 1, 3, shadeColor(visual.helmetAccent, -0.14));
}

function drawRoadBikePreview(ctx, visual, traits, pass = "full") {
  const drawBack = pass === "full" || pass === "back";
  const drawFront = pass === "full" || pass === "front";
  const tireColor = shadeColor(visual.bikeColor, -0.42);
  const rimColor = shadeColor(visual.bikeAccent, 0.08);
  const spokeColor = shadeColor(visual.bikeAccent, 0.24);
  const frameMain = visual.bikeColor;
  const frameAccent = shadeColor(visual.bikeAccent, 0.1);
  const chainColor = shadeColor(visual.bikeAccent, -0.12);
  const metal = 0xc8ced4;
  const tape = shadeColor(visual.helmetAccent, 0.05);
  const saddle = shadeColor(visual.bikeColor, -0.12);
  const wheelRadius = 6;

  const rear = { x: 32, y: 46 };
  const front = { x: 49, y: 46 };
  const bb = { x: 40, y: 40 };
  const seat = { x: 37, y: 33 };
  const head = { x: 46, y: 33 };

  if (drawBack) {
    drawBikeWheel(ctx, rear.x, rear.y, wheelRadius, tireColor, rimColor, spokeColor);

    drawPixelLine(ctx, rear.x + 1, rear.y - 4, seat.x, seat.y, frameMain);
    drawPixelLine(ctx, rear.x, rear.y, bb.x, bb.y, frameMain);
    drawPixelLine(ctx, bb.x, bb.y, seat.x, seat.y, frameAccent);
    drawPixelLine(ctx, seat.x, seat.y, head.x, head.y, frameMain);
    drawPixelLine(ctx, bb.x, bb.y, head.x, head.y, frameMain);

    drawPixelLine(ctx, seat.x - 2, seat.y - 1, seat.x + 3, seat.y - 1, saddle);
    drawPixelLine(ctx, seat.x, seat.y, seat.x, seat.y - 1, metal);
    fillRect(ctx, seat.x - 1, seat.y - 2, 2, 1, shadeColor(saddle, 0.1));

    fillRect(ctx, bb.x - 1, bb.y - 1, 3, 3, metal);
    fillRect(ctx, bb.x + 4, bb.y + 2, 2, 1, shadeColor(metal, -0.15));
    fillRect(ctx, bb.x - 3, bb.y + 2, 2, 1, shadeColor(metal, -0.15));
    drawPixelLine(ctx, rear.x + 2, rear.y, bb.x + 3, bb.y + 2, chainColor, 0.65);
  }

  if (drawFront) {
    drawBikeWheel(ctx, front.x, front.y, wheelRadius, tireColor, rimColor, spokeColor);

    drawPixelLine(ctx, bb.x, bb.y, front.x - 1, front.y - 4, frameMain);
    drawPixelLine(ctx, head.x, head.y, front.x - 1, front.y - 4, frameMain);
    drawPixelLine(ctx, head.x + 1, head.y - 1, 52, 32, metal);
    drawPixelLine(ctx, 52, 32, 53, 35, tape);
    drawPixelLine(ctx, 53, 35, 50, 38, tape);

    drawPixelLine(ctx, bb.x, bb.y, bb.x + 4, bb.y + 2, metal);
    drawPixelLine(ctx, bb.x, bb.y, bb.x - 2, bb.y + 3, metal);
    fillRect(ctx, bb.x - 1, bb.y - 1, 3, 3, metal);
    fillRect(ctx, bb.x + 4, bb.y + 2, 2, 1, shadeColor(metal, -0.15));
    fillRect(ctx, bb.x - 3, bb.y + 3, 2, 1, shadeColor(metal, -0.15));

    fillRect(ctx, 42, 38, 3, 5, shadeColor(frameAccent, -0.08));
    fillRect(ctx, 42, 40, 3, 1, traits.badgeColor, 0.85);
    fillRect(ctx, 43, 36, 2, 2, shadeColor(frameAccent, 0.16));
    fillRect(ctx, 44, 37, 1, 4, shadeColor(visual.jerseyAccent, 0.08));
    fillRect(ctx, 44, 38, 1, 1, 0xffffff, 0.25);
    fillRect(ctx, 50, 35, 1, 2, metal);
    fillRect(ctx, 52, 35, 1, 2, metal);
  }
}

function drawBikeWheel(ctx, cx, cy, radius, tireColor, rimColor, spokeColor) {
  for (let dy = -radius; dy <= radius; dy += 1) {
    const span = Math.floor(Math.sqrt(radius * radius - dy * dy));
    fillRect(ctx, cx - span, cy + dy, span * 2 + 1, 1, tireColor);
  }

  const innerRadius = Math.max(1, radius - 1);
  for (let dy = -innerRadius; dy <= innerRadius; dy += 1) {
    const span = Math.floor(Math.sqrt(innerRadius * innerRadius - dy * dy));
    fillRect(ctx, cx - span, cy + dy, span * 2 + 1, 1, rimColor);
  }

  fillRect(ctx, cx - 1, cy - 1, 3, 3, shadeColor(spokeColor, -0.2));
  drawPixelLine(ctx, cx - radius + 1, cy, cx + radius - 1, cy, spokeColor, 0.4);
  drawPixelLine(ctx, cx, cy - radius + 1, cx, cy + radius - 1, spokeColor, 0.4);
  drawPixelLine(ctx, cx - radius + 1, cy - radius + 1, cx + radius - 1, cy + radius - 1, spokeColor, 0.2);
  drawPixelLine(ctx, cx - radius + 1, cy + radius - 1, cx + radius - 1, cy - radius + 1, spokeColor, 0.2);
  drawPixelLine(ctx, cx - radius + 2, cy - 1, cx + radius - 2, cy - 1, spokeColor, 0.25);
  drawPixelLine(ctx, cx - 1, cy - radius + 2, cx - 1, cy + radius - 2, spokeColor, 0.25);
}

function drawPixelLine(ctx, x0, y0, x1, y1, color, alpha = 1) {
  let cx = x0;
  let cy = y0;
  const dx = Math.abs(x1 - cx);
  const sx = cx < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - cy);
  const sy = cy < y1 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    fillRect(ctx, cx, cy, 1, 1, color, alpha);
    if (cx === x1 && cy === y1) {
      break;
    }

    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      cx += sx;
    }
    if (e2 <= dx) {
      err += dx;
      cy += sy;
    }
  }
}

function applyJerseyPattern(ctx, pattern, x, y, w, h, colors) {
  switch (pattern) {
    case "soudal":
      fillRect(ctx, x, y, w, 4, colors.tertiary);
      fillRect(ctx, x, y + 4, w, 7, colors.secondary);
      fillRect(ctx, x, y + 11, w, 3, colors.accent);
      break;
    case "vest":
      fillRect(ctx, x, y, w, 4, colors.sleeve);
      fillRect(ctx, x + 2, y + 3, w - 4, h - 3, colors.secondary);
      fillRect(ctx, x + 6, y + 4, 2, h - 5, colors.accent);
      break;
    case "white-minimal":
      fillRect(ctx, x, y + 11, w, 3, colors.secondary);
      fillRect(ctx, x + 6, y + 2, 2, h - 2, colors.tertiary);
      break;
    case "neon":
      fillRect(ctx, x, y + 2, w, 4, colors.tertiary);
      fillRect(ctx, x, y + 9, w, 2, colors.accent);
      break;
    case "all-black":
      fillRect(ctx, x, y + 6, w, 4, colors.secondary);
      fillRect(ctx, x + 1, y + 3, w - 2, 2, colors.accent);
      break;
    case "alpha":
      fillRect(ctx, x, y + 6, w, 6, colors.secondary);
      fillRect(ctx, x, y + 5, w, 1, colors.accent);
      fillRect(ctx, x + 5, y + 3, 4, 2, colors.tertiary);
      break;
    case "colombia":
      fillRect(ctx, x, y + 6, w, 2, colors.accent);
      fillRect(ctx, x, y + 8, w, 2, colors.tertiary);
      fillRect(ctx, x, y + 10, w, 4, colors.secondary);
      break;
    case "castelli":
      fillRect(ctx, x, y + 8, w, 6, colors.secondary);
      fillRect(ctx, x + 5, y + 4, 5, 5, colors.accent);
      break;
    case "movistar":
      fillRect(ctx, x + 1, y + 3, 3, 3, colors.accent);
      fillRect(ctx, x + 6, y + 7, 3, 3, colors.accent);
      fillRect(ctx, x, y + 10, w, 4, colors.tertiary);
      break;
    default:
      fillRect(ctx, x, y + 6, w, 3, colors.secondary);
      fillRect(ctx, x, y + 11, w, 2, colors.accent);
      break;
  }
}

function drawHabboOutline(ctx, color) {
  const c = toHex(color);
  ctx.fillStyle = c;

  const outlinePixels = [
    [16, 11, 13, 1],
    [15, 12, 1, 11],
    [29, 12, 1, 11],
    [16, 23, 13, 1],
    [11, 24, 1, 10],
    [32, 24, 1, 10],
    [13, 21, 1, 17],
    [29, 21, 1, 17],
    [16, 37, 13, 1],
    [16, 45, 6, 1],
    [23, 46, 6, 1],
    [15, 48, 15, 1],
    [15, 51, 7, 1],
    [23, 51, 7, 1],
  ];

  for (const [x, y, w, h] of outlinePixels) {
    ctx.fillRect(x, y, w, h);
  }
}

function fillRect(ctx, x, y, w, h, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = toHex(color);
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function shadeColor(color, delta) {
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;

  const d = Math.round(255 * delta);
  const nr = Math.max(0, Math.min(255, r + d));
  const ng = Math.max(0, Math.min(255, g + d));
  const nb = Math.max(0, Math.min(255, b + d));

  return (nr << 16) | (ng << 8) | nb;
}

function addStatRow(parent, label, value) {
  const row = document.createElement("div");
  row.className = "stat-row";

  const labelElement = document.createElement("span");
  labelElement.textContent = label;

  const bar = document.createElement("div");
  bar.className = "stat-bar";

  const fill = document.createElement("div");
  fill.className = "stat-fill";
  fill.style.width = `${value}%`;

  bar.append(fill);
  row.append(labelElement, bar);
  parent.append(row);
}

function formatMultiplier(multiplier) {
  if (Number.isInteger(multiplier)) {
    return String(multiplier);
  }

  return multiplier.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function highlightSelectedCard() {
  const cards = characterGrid.querySelectorAll(".character-card");
  cards.forEach((card) => {
    const isSelected = card.dataset.characterId === selectedCharacterId;
    card.classList.toggle("selected", isSelected);
  });
}

function startGame(selected) {
  if (!window.Phaser) {
    hudTextElement.textContent = "Phaser isch nöd glade worde. Bitte neu lade.";
    return;
  }

  shutdownGame();

  selectionScreen.classList.remove("active");
  gameScreen.classList.add("active");

  const npcCharacters = characterDefinitions.filter((character) => character.id !== selected.id).map((character) => ({
    ...character,
    dialogues: [...character.dialogues],
  }));

  const scene = new RideScene(
    {
      selectedCharacter: {
        ...selected,
        dialogues: [...selected.dialogues],
      },
      allCharacters: characterDefinitions,
      npcCharacters,
      music,
      isTouchDevice: window.matchMedia("(pointer: coarse)").matches,
    },
    {
      hudTextElement,
      sprintButtonElement,
    },
  );

  gameInstance = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-canvas-container",
    backgroundColor: "#8fc1dc",
    pixelArt: true,
    antialias: false,
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    scene: [scene],
  });

  activeScene = scene;
  window.requestAnimationFrame(() => {
    if (gameInstance?.scale) {
      gameInstance.scale.resize(window.innerWidth, window.innerHeight);
    }
  });

  music.start();
  music.resume();
}

function shutdownGame() {
  if (activeScene && typeof activeScene.releaseDomBindings === "function") {
    activeScene.releaseDomBindings();
  }

  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }

  activeScene = null;
  music.stop();
  sprintButtonElement.textContent = "Sprint 🔥";
  hudTextElement.textContent = "Pause";
}

class RideScene extends PhaserSceneBase {
  constructor(runtime, uiRefs) {
    super("RideScene");
    this.runtime = runtime;
    this.uiRefs = uiRefs;

    this.tileWidth = 64;
    this.tileHeight = 32;
    this.mapWidth = 84;
    this.mapHeight = 84;
    this.isoOriginX = (this.mapHeight * this.tileWidth) / 2 + this.tileWidth;
    this.isoOriginY = this.tileHeight * 2;

    this.player = null;
    this.npcs = [];
    this.obstacles = [];
    this.sprintTimeLeft = 0;
    this.lastHudUpdateMs = 0;

    this.loopCenter = { x: this.mapWidth / 2, y: this.mapHeight / 2 };
    this.loopOuterRadius = { x: this.mapWidth * 0.36, y: this.mapHeight * 0.32 };
    this.loopInnerRadius = { x: this.mapWidth * 0.27, y: this.mapHeight * 0.23 };
    this.socialHub = { x: this.loopCenter.x - 2.2, y: this.loopCenter.y + 2, radiusX: 10, radiusY: 7 };
    this.passSectionAngles = { start: Math.PI, end: Math.PI * 1.5 };
    this.descentSectionAngles = { start: Math.PI * 1.5, end: Math.PI * 2 };
    this.connectorRoads = [
      {
        x1: this.loopCenter.x - 12,
        y1: this.loopCenter.y + 2,
        x2: this.loopCenter.x + 12,
        y2: this.loopCenter.y + 2,
        halfWidth: 1.7,
      },
      {
        x1: this.loopCenter.x - 3,
        y1: this.loopCenter.y - 12,
        x2: this.loopCenter.x - 3,
        y2: this.loopCenter.y + 12,
        halfWidth: 1.5,
      },
      {
        x1: this.loopCenter.x - 8,
        y1: this.loopCenter.y - 8,
        x2: this.loopCenter.x + 7,
        y2: this.loopCenter.y + 7,
        halfWidth: 1.4,
      },
    ];

    this.boundSprintHandler = null;
    this.cleanupBound = false;
  }

  create() {
    try {
      this.runtime.music.resume();
      this.createControls();
      this.createSharedTextures();
      this.drawGround();
      this.createTerrainLabels();
      this.createObstacleLayout();

      const occupiedPositions = [];
      this.player = this.createRiderEntity(this.runtime.selectedCharacter, true, occupiedPositions, true);
      this.npcs = this.runtime.npcCharacters.map((character, index) =>
        this.createRiderEntity(character, false, occupiedPositions, index < Math.ceil(this.runtime.npcCharacters.length * 0.45)),
      );

      this.playerAura = this.add.ellipse(0, 0, 30, 12, 0xf5f1c4, 0.52);
      this.playerAura.setStrokeStyle(2, 0xe07f36, 1);

      this.cameras.main.setRoundPixels(true);
      this.updateCameraCenter();

      this.bindDomControls();
      this.events.on("shutdown", this.releaseDomBindings, this);
      this.events.on("destroy", this.releaseDomBindings, this);
    } catch (error) {
      const message = error?.message || String(error || "unknown error");
      this.uiRefs.hudTextElement.textContent = `Scene error: ${message}`;
      console.error("RideScene create error:", error);
    }
  }

  createControls() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys("W,A,S,D,SPACE");
      this.input.keyboard.on("keydown", () => {
        this.runtime.music.resume();
      });
    }

    this.input.on("pointerdown", () => {
      this.runtime.music.resume();
    });
  }

  bindDomControls() {
    this.boundSprintHandler = (event) => {
      event.preventDefault();
      this.tryActivateSprint();
    };

    this.uiRefs.sprintButtonElement.addEventListener("pointerdown", this.boundSprintHandler);
  }

  releaseDomBindings() {
    if (this.cleanupBound) {
      return;
    }

    this.cleanupBound = true;

    if (this.boundSprintHandler) {
      this.uiRefs.sprintButtonElement.removeEventListener("pointerdown", this.boundSprintHandler);
      this.boundSprintHandler = null;
    }
  }

  createSharedTextures() {
    if (!this.textures.exists("shadow-oval")) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x121212, 1);
      g.fillEllipse(12, 6, 24, 10);
      g.generateTexture("shadow-oval", 24, 12);
      g.destroy();
    }

    for (const character of this.runtime.allCharacters) {
      const textureBaseKey = `rider-${character.id}`;

      for (let frameIndex = 0; frameIndex < 2; frameIndex += 1) {
        const textureKey = `${textureBaseKey}-${frameIndex}`;
        if (this.textures.exists(textureKey)) {
          continue;
        }

        this.drawRiderTexture(textureKey, character.visual, frameIndex);
      }
    }
  }

  drawRiderTexture(textureKey, visual, frameIndex) {
    const g = this.make.graphics({ add: false });
    const wheelY = 30;
    const rearWheelX = 11;
    const frontWheelX = 29;
    const crankX = 20;
    const crankY = 24;
    const pedalForward = frameIndex === 0;

    g.fillStyle(0x0f0f0f, 1);
    g.fillCircle(rearWheelX, wheelY, 6);
    g.fillCircle(frontWheelX, wheelY, 6);

    g.fillStyle(visual.bikeAccent, 1);
    g.fillCircle(rearWheelX, wheelY, 5);
    g.fillCircle(frontWheelX, wheelY, 5);
    g.fillStyle(0x232323, 1);
    g.fillCircle(rearWheelX, wheelY, 3);
    g.fillCircle(frontWheelX, wheelY, 3);

    g.lineStyle(1, 0x8b8b8b, 0.6);
    g.lineBetween(rearWheelX, wheelY - 5, rearWheelX, wheelY + 5);
    g.lineBetween(rearWheelX - 5, wheelY, rearWheelX + 5, wheelY);
    g.lineBetween(frontWheelX, wheelY - 5, frontWheelX, wheelY + 5);
    g.lineBetween(frontWheelX - 5, wheelY, frontWheelX + 5, wheelY);

    g.lineStyle(2, visual.bikeColor, 1);
    g.lineBetween(rearWheelX, wheelY, crankX, crankY);
    g.lineBetween(crankX, crankY, frontWheelX, wheelY - 1);
    g.lineBetween(rearWheelX + 1, wheelY - 3, frontWheelX - 3, wheelY - 4);
    g.lineBetween(frontWheelX - 3, wheelY - 4, frontWheelX, wheelY - 1);
    g.lineBetween(crankX, crankY, crankX + 2, wheelY - 7);
    g.lineBetween(frontWheelX - 2, wheelY - 8, frontWheelX + 2, wheelY - 8);

    g.lineStyle(1, visual.bikeAccent, 1);
    g.lineBetween(rearWheelX + 1, wheelY - 2, crankX + 1, crankY - 1);
    g.lineBetween(crankX, crankY - 1, frontWheelX - 1, wheelY - 2);

    g.fillStyle(visual.skinColor, 1);
    if (pedalForward) {
      g.fillRect(crankX - 4, crankY - 1, 3, 8);
      g.fillRect(crankX + 2, crankY - 3, 3, 10);
    } else {
      g.fillRect(crankX - 4, crankY - 3, 3, 10);
      g.fillRect(crankX + 2, crankY - 1, 3, 8);
    }

    g.fillStyle(visual.sockColor, 1);
    if (pedalForward) {
      g.fillRect(crankX - 4, crankY + 6, 3, 2);
      g.fillRect(crankX + 2, crankY + 7, 3, 2);
    } else {
      g.fillRect(crankX - 4, crankY + 7, 3, 2);
      g.fillRect(crankX + 2, crankY + 6, 3, 2);
    }

    g.fillStyle(visual.shoeColor, 1);
    if (pedalForward) {
      g.fillRect(crankX - 4, crankY + 8, 3, 2);
      g.fillRect(crankX + 2, crankY + 9, 3, 2);
    } else {
      g.fillRect(crankX - 4, crankY + 9, 3, 2);
      g.fillRect(crankX + 2, crankY + 8, 3, 2);
    }

    g.fillStyle(visual.shortsColor, 1);
    g.fillRect(15, 18, 10, 6);

    const jerseyX = 14;
    const jerseyY = 12;
    const jerseyW = 12;
    const jerseyH = 7;

    g.fillStyle(visual.jerseyPrimary, 1);
    g.fillRect(jerseyX, jerseyY, jerseyW, jerseyH);

    switch (visual.jerseyPattern) {
      case "soudal":
        g.fillStyle(visual.jerseyTertiary, 1);
        g.fillRect(jerseyX, jerseyY, jerseyW, 2);
        g.fillStyle(visual.jerseySecondary, 1);
        g.fillRect(jerseyX, jerseyY + 2, jerseyW, 3);
        g.fillStyle(visual.jerseyAccent, 1);
        g.fillRect(jerseyX, jerseyY + 5, jerseyW, 2);
        break;
      case "vest":
        g.fillStyle(visual.sleeveColor, 1);
        g.fillRect(jerseyX, jerseyY, jerseyW, 2);
        g.fillStyle(visual.jerseySecondary, 1);
        g.fillRect(jerseyX + 2, jerseyY + 1, jerseyW - 4, jerseyH - 1);
        g.fillStyle(visual.jerseyAccent, 1);
        g.fillRect(jerseyX + 5, jerseyY + 1, 2, jerseyH - 1);
        break;
      case "white-minimal":
        g.fillStyle(visual.jerseySecondary, 1);
        g.fillRect(jerseyX, jerseyY + 5, jerseyW, 2);
        g.fillStyle(visual.jerseyTertiary, 1);
        g.fillRect(jerseyX + 5, jerseyY, 2, jerseyH);
        break;
      case "neon":
        g.fillStyle(visual.jerseyTertiary, 1);
        g.fillRect(jerseyX, jerseyY + 1, jerseyW, 2);
        g.fillStyle(visual.jerseyAccent, 1);
        g.fillRect(jerseyX, jerseyY + 4, jerseyW, 1);
        break;
      case "all-black":
        g.fillStyle(visual.jerseySecondary, 1);
        g.fillRect(jerseyX, jerseyY + 3, jerseyW, 2);
        g.fillStyle(visual.jerseyAccent, 1);
        g.fillRect(jerseyX + 1, jerseyY + 1, jerseyW - 2, 1);
        break;
      case "alpha":
        g.fillStyle(visual.jerseySecondary, 1);
        g.fillRect(jerseyX, jerseyY + 3, jerseyW, 4);
        g.fillStyle(visual.jerseyAccent, 1);
        g.fillRect(jerseyX, jerseyY + 2, jerseyW, 1);
        g.fillStyle(visual.jerseyTertiary, 1);
        g.fillRect(jerseyX + 4, jerseyY, 4, 1);
        break;
      case "colombia":
        g.fillStyle(visual.jerseyAccent, 1);
        g.fillRect(jerseyX, jerseyY + 3, jerseyW, 1);
        g.fillStyle(visual.jerseyTertiary, 1);
        g.fillRect(jerseyX, jerseyY + 4, jerseyW, 1);
        g.fillStyle(visual.jerseySecondary, 1);
        g.fillRect(jerseyX, jerseyY + 5, jerseyW, 2);
        break;
      case "castelli":
        g.fillStyle(visual.jerseySecondary, 1);
        g.fillRect(jerseyX, jerseyY + 4, jerseyW, 3);
        g.fillStyle(visual.jerseyAccent, 1);
        g.fillRect(jerseyX + 4, jerseyY + 1, 4, 4);
        break;
      case "movistar":
        g.fillStyle(visual.jerseyAccent, 1);
        g.fillRect(jerseyX + 1, jerseyY + 1, 3, 2);
        g.fillRect(jerseyX + 5, jerseyY + 3, 3, 2);
        g.fillStyle(visual.jerseyTertiary, 1);
        g.fillRect(jerseyX, jerseyY + 5, jerseyW, 2);
        break;
      default:
        g.fillStyle(visual.jerseySecondary, 1);
        g.fillRect(jerseyX, jerseyY + 3, jerseyW, 2);
        g.fillStyle(visual.jerseyAccent, 1);
        g.fillRect(jerseyX, jerseyY + 5, jerseyW, 1);
        break;
    }

    const armColor = visual.sleeveStyle === "long" ? visual.sleeveColor : visual.skinColor;
    g.fillStyle(armColor, 1);
    g.fillRect(12, 14, 3, 3);
    g.fillRect(26, 14, 3, 3);

    if (visual.sleeveStyle === "short") {
      g.fillStyle(visual.skinColor, 1);
      g.fillRect(12, 16, 3, 1);
      g.fillRect(26, 16, 3, 1);
    }

    g.fillStyle(visual.gloveColor, 1);
    g.fillRect(11, 16, 2, 2);
    g.fillRect(28, 16, 2, 2);

    g.fillStyle(visual.skinColor, 1);
    g.fillCircle(20, 9, 4);

    g.fillStyle(visual.helmetColor, 1);
    g.fillRect(16, 4, 8, 3);
    g.fillRect(15, 6, 10, 1);
    g.fillStyle(visual.helmetAccent, 1);
    g.fillRect(19, 4, 2, 3);
    g.fillRect(15, 6, 1, 1);
    g.fillRect(24, 6, 1, 1);

    if (visual.glassesStyle === "sport") {
      g.fillStyle(visual.visorColor, 1);
      g.fillRect(17, 8, 6, 2);
      g.fillStyle(0x111111, 1);
      g.fillRect(16, 8, 1, 2);
      g.fillRect(23, 8, 1, 2);
    } else if (visual.glassesStyle === "visor") {
      g.fillStyle(visual.visorColor, 1);
      g.fillRect(16, 7, 8, 3);
      g.fillStyle(0x121212, 1);
      g.fillRect(15, 7, 1, 2);
      g.fillRect(24, 7, 1, 2);
    }

    if (visual.beardStyle === "stubble") {
      g.fillStyle(0x31231b, 1);
      g.fillRect(18, 11, 4, 1);
    } else if (visual.beardStyle === "full") {
      g.fillStyle(0x2a201a, 1);
      g.fillRect(18, 10, 4, 3);
      g.fillRect(19, 9, 2, 1);
    }

    g.generateTexture(textureKey, 40, 40);
    g.destroy();
  }

  drawGround() {
    const mapGraphics = this.add.graphics();

    for (let y = 0; y < this.mapHeight; y += 1) {
      for (let x = 0; x < this.mapWidth; x += 1) {
        const iso = this.toIso(x, y);
        const isRoad = this.isRoad(x, y);
        const inSocialHub = this.isInSocialHub(x + 0.5, y + 0.5);
        const terrainType = this.getTerrainTypeAt(x + 0.5, y + 0.5);

        let fill = isRoad ? 0x69635d : 0x6f8165;
        let stroke = isRoad ? 0x554f4a : 0x5a6d52;

        if (terrainType === "ascending") {
          fill = isRoad ? 0x76624f : 0x857b66;
          stroke = isRoad ? 0x624f3e : 0x706653;
        } else if (terrainType === "descending") {
          fill = isRoad ? 0x5b6c79 : 0x657f83;
          stroke = isRoad ? 0x4d5c67 : 0x576f73;
        }

        if (isRoad && inSocialHub) {
          fill = 0x7a766e;
          stroke = 0x635f57;
        }

        this.drawIsoDiamond(mapGraphics, iso.x, iso.y, this.tileWidth, this.tileHeight, fill, stroke);
      }
    }

    mapGraphics.setDepth(-1000);
  }

  createTerrainLabels() {
    const socialPoint = this.toIso(this.socialHub.x, this.socialHub.y);
    const climbPoint = this.toIso(...this.getLoopPointAtAngle((this.passSectionAngles.start + this.passSectionAngles.end) / 2));
    const descentPoint = this.toIso(...this.getLoopPointAtAngle(Math.PI * 1.75));

    const socialText = this.add
      .text(socialPoint.x, socialPoint.y - 28, "Social/Meeting Section", {
        fontFamily: "Verdana",
        fontSize: "12px",
        color: "#f4f0db",
        stroke: "#344831",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(socialPoint.y + 130);

    const uphillText = this.add
      .text(climbPoint.x, climbPoint.y - 30, "Climb/Pass Section", {
        fontFamily: "Verdana",
        fontSize: "12px",
        color: "#f4f0db",
        stroke: "#4a3b2e",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(climbPoint.y + 130);

    const downhillText = this.add
      .text(descentPoint.x, descentPoint.y - 30, "Abfahrt", {
        fontFamily: "Verdana",
        fontSize: "13px",
        color: "#f4f0db",
        stroke: "#2f4952",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(descentPoint.y + 130);

    this.zoneLabels = [socialText, uphillText, downhillText];
  }

  createObstacleLayout() {
    const centerX = this.loopCenter.x;
    const centerY = this.loopCenter.y;

    this.obstacles = [
      { id: "hut-1", type: "building", x: centerX - 22, y: centerY - 23, w: 8, h: 7, label: "Passhütte" },
      { id: "hut-2", type: "building", x: centerX + 13, y: centerY + 12, w: 8, h: 7, label: "Tal Cafi" },
      { id: "hut-3", type: "building", x: centerX - 5, y: centerY + 20, w: 8, h: 7, label: "Aussicht" },
      { id: "van-1", type: "car", x: centerX + 4.8, y: centerY - 19, w: 2.6, h: 1.7 },
      { id: "van-2", type: "car", x: centerX - 18.5, y: centerY + 6.4, w: 2.6, h: 1.7 },
    ];

    for (const obstacle of this.obstacles) {
      this.drawObstacle(obstacle);
    }
  }

  drawObstacle(obstacle) {
    const g = this.add.graphics();

    const p1 = this.toIso(obstacle.x, obstacle.y);
    const p2 = this.toIso(obstacle.x + obstacle.w, obstacle.y);
    const p3 = this.toIso(obstacle.x + obstacle.w, obstacle.y + obstacle.h);
    const p4 = this.toIso(obstacle.x, obstacle.y + obstacle.h);

    const height = obstacle.type === "building" ? 84 : 22;

    let topColor = 0xc6b68f;
    let leftColor = 0x8d7b5f;
    let rightColor = 0x75674f;

    if (obstacle.type === "car") {
      topColor = 0xd44f3e;
      leftColor = 0xa03b30;
      rightColor = 0x7f2f28;
    }

    const t1 = { x: p1.x, y: p1.y - height };
    const t2 = { x: p2.x, y: p2.y - height };
    const t3 = { x: p3.x, y: p3.y - height };
    const t4 = { x: p4.x, y: p4.y - height };

    g.fillStyle(leftColor, 1);
    g.beginPath();
    g.moveTo(p4.x, p4.y);
    g.lineTo(p1.x, p1.y);
    g.lineTo(t1.x, t1.y);
    g.lineTo(t4.x, t4.y);
    g.closePath();
    g.fillPath();

    g.fillStyle(rightColor, 1);
    g.beginPath();
    g.moveTo(p3.x, p3.y);
    g.lineTo(p4.x, p4.y);
    g.lineTo(t4.x, t4.y);
    g.lineTo(t3.x, t3.y);
    g.closePath();
    g.fillPath();

    g.fillStyle(topColor, 1);
    g.beginPath();
    g.moveTo(t1.x, t1.y);
    g.lineTo(t2.x, t2.y);
    g.lineTo(t3.x, t3.y);
    g.lineTo(t4.x, t4.y);
    g.closePath();
    g.fillPath();

    g.lineStyle(2, 0x312621, 0.55);
    g.strokePath();

    g.setDepth(Math.max(p3.y, p4.y) + 40);

    obstacle.visual = g;

    if (obstacle.type === "building" && obstacle.label) {
      const center = this.toIso(obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h / 2);
      obstacle.labelText = this.add
        .text(center.x, center.y - height - 12, obstacle.label, {
          fontFamily: "Verdana",
          fontSize: "11px",
          color: "#fff7d8",
          stroke: "#34251f",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setDepth(Math.max(p3.y, p4.y) + 120);
    }
  }

  drawIsoDiamond(graphics, x, y, width, height, fillColor, strokeColor) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    graphics.fillStyle(fillColor, 1);
    graphics.beginPath();
    graphics.moveTo(x, y);
    graphics.lineTo(x + halfWidth, y + halfHeight);
    graphics.lineTo(x, y + height);
    graphics.lineTo(x - halfWidth, y + halfHeight);
    graphics.closePath();
    graphics.fillPath();

    graphics.lineStyle(1, strokeColor, 0.62);
    graphics.strokePath();
  }

  createRiderEntity(character, isPlayer, occupiedPositions, preferSocialHub = isPlayer) {
    const spawnPoint = this.findSpawnPoint(occupiedPositions, preferSocialHub);
    occupiedPositions.push({ x: spawnPoint.x, y: spawnPoint.y });

    const textureBaseKey = `rider-${character.id}`;

    const shadow = this.add.image(0, 0, "shadow-oval").setAlpha(isPlayer ? 0.45 : 0.32);
    const sprite = this.add.image(0, 0, `${textureBaseKey}-0`).setOrigin(0.5, 0.8);
    const nameTag = this.add
      .text(0, 0, character.name, {
        fontFamily: "Verdana",
        fontSize: "11px",
        color: isPlayer ? "#fff6c8" : "#f6f1ea",
        stroke: "#2b2525",
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1);

    const bubbleContainer = this.add.container(0, 0).setVisible(false);
    const bubbleBackground = this.add.graphics();
    const bubbleText = this.add
      .text(0, 0, "", {
        fontFamily: "Verdana",
        fontSize: "12px",
        color: "#1f1c1a",
      })
      .setOrigin(0.5, 0.5);

    bubbleContainer.add([bubbleBackground, bubbleText]);

    const entity = {
      character,
      isPlayer,
      x: spawnPoint.x,
      y: spawnPoint.y,
      vx: 0,
      vy: 0,
      radius: 0.46,
      aiTimer: Phaser.Math.FloatBetween(0.25, 1.35),
      aiDirection: { x: 0, y: 0 },
      shadow,
      sprite,
      nameTag,
      bubbleContainer,
      bubbleBackground,
      bubbleText,
      bubbleTimer: 0,
      wasCollidingWithPlayer: false,
      dialogueBag: [],
      frameIndex: 0,
      frameTimer: 0,
      textureBaseKey,
    };

    if (isPlayer) {
      sprite.setTint(0xffffff);
    }

    this.updateEntityDisplay(entity);
    return entity;
  }

  findSpawnPoint(occupiedPositions, nearCenter) {
    const margin = 4;

    for (let attempt = 0; attempt < 420; attempt += 1) {
      let x = Phaser.Math.FloatBetween(margin, this.mapWidth - margin);
      let y = Phaser.Math.FloatBetween(margin, this.mapHeight - margin);

      if (nearCenter) {
        const social = this.getRandomPointInSocialHub();
        x = social.x;
        y = social.y;
      } else if (Math.random() < 0.7) {
        const loopPoint = this.getRandomPointOnLoopRoad();
        x = loopPoint.x;
        y = loopPoint.y;
      }

      if (!this.isRoad(Math.floor(x), Math.floor(y))) {
        continue;
      }

      if (this.collidesObstacle(x, y, 0.6)) {
        continue;
      }

      const tooClose = occupiedPositions.some((position) => Phaser.Math.Distance.Between(position.x, position.y, x, y) < 3.4);
      if (tooClose) {
        continue;
      }

      return { x, y };
    }

    return { x: this.mapWidth / 2, y: this.mapHeight / 2 };
  }

  update(_time, deltaMs) {
    const dt = Math.min(0.034, deltaMs / 1000);

    if (this.inputEnabled()) {
      this.updateSprintState(dt);
      this.updatePlayer(dt);
      this.updateNpcs(dt);
      this.checkPlayerNpcCollisions();
    }

    this.updateEntityDisplay(this.player);
    for (const npc of this.npcs) {
      this.updateEntityDisplay(npc);
      this.updateBubbleState(npc, dt);
    }

    this.updateCameraCenter();
    this.updateHud(deltaMs);
  }

  inputEnabled() {
    const rotateOverlay = document.getElementById("rotate-overlay");
    if (!rotateOverlay) {
      return true;
    }

    return window.getComputedStyle(rotateOverlay).display === "none";
  }

  updateSprintState(dt) {
    const spacePressed =
      (this.keys?.SPACE && Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) ||
      (this.cursors?.space && Phaser.Input.Keyboard.JustDown(this.cursors.space));

    if (spacePressed) {
      this.tryActivateSprint();
    }

    if (this.sprintTimeLeft > 0) {
      this.sprintTimeLeft = Math.max(0, this.sprintTimeLeft - dt);
      this.uiRefs.sprintButtonElement.textContent = `Sprint ${this.sprintTimeLeft.toFixed(1)}s`;
      return;
    }

    this.uiRefs.sprintButtonElement.textContent = "Sprint 🔥";
  }

  tryActivateSprint() {
    if (this.sprintTimeLeft > 0) {
      return;
    }

    this.sprintTimeLeft = 3;
    this.runtime.music.playSfx("sprint");
  }

  updatePlayer(dt) {
    const inputDirection = this.getPlayerInputDirection();
    this.stepEntity(this.player, inputDirection, dt, true);
  }

  updateNpcs(dt) {
    for (const npc of this.npcs) {
      npc.aiTimer -= dt;

      if (npc.aiTimer <= 0) {
        this.pickNpcDirection(npc);
      }

      this.stepEntity(npc, npc.aiDirection, dt, false);

      if (Math.abs(npc.vx) + Math.abs(npc.vy) < 0.01 && npc.aiTimer > 0.2) {
        npc.aiTimer = 0.2;
      }
    }
  }

  pickNpcDirection(npc) {
    npc.aiTimer = Phaser.Math.FloatBetween(0.7, 2.8);

    if (Math.random() < 0.22) {
      npc.aiDirection = { x: 0, y: 0 };
      return;
    }

    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    npc.aiDirection = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  }

  stepEntity(entity, direction, dt, canSprint) {
    const hasDirection = Math.abs(direction.x) > 0.0001 || Math.abs(direction.y) > 0.0001;

    const terrain = this.getTerrainTypeAt(entity.x, entity.y);
    const onRoad = this.isRoad(Math.floor(entity.x), Math.floor(entity.y));

    const maxSpeed = this.getMaxSpeed(entity.character.stats, terrain, onRoad, canSprint && this.sprintTimeLeft > 0);
    const acceleration = onRoad ? 13.8 : 10.2;
    const deceleration = 12.6;

    if (hasDirection) {
      entity.vx += direction.x * acceleration * dt;
      entity.vy += direction.y * acceleration * dt;
    } else {
      const currentSpeed = Math.hypot(entity.vx, entity.vy);
      if (currentSpeed > 0) {
        const reducedSpeed = Math.max(0, currentSpeed - deceleration * dt);
        const scale = reducedSpeed / currentSpeed;
        entity.vx *= scale;
        entity.vy *= scale;
      }
    }

    const speed = Math.hypot(entity.vx, entity.vy);
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      entity.vx *= scale;
      entity.vy *= scale;
    }

    this.moveEntityWithCollisions(entity, dt);
  }

  moveEntityWithCollisions(entity, dt) {
    const boundsMin = 0.4;
    const boundsMaxX = this.mapWidth - 0.4;
    const boundsMaxY = this.mapHeight - 0.4;

    const nextX = Phaser.Math.Clamp(entity.x + entity.vx * dt, boundsMin, boundsMaxX);
    if (!this.collidesObstacle(nextX, entity.y, entity.radius)) {
      entity.x = nextX;
    } else {
      entity.vx = 0;
    }

    const nextY = Phaser.Math.Clamp(entity.y + entity.vy * dt, boundsMin, boundsMaxY);
    if (!this.collidesObstacle(entity.x, nextY, entity.radius)) {
      entity.y = nextY;
    } else {
      entity.vy = 0;
    }
  }

  getMaxSpeed(stats, terrain, onRoad, sprinting) {
    let baseSpeed = 0;

    if (terrain === "ascending") {
      baseSpeed = 1.4 + stats.ascending * 0.031;
    } else if (terrain === "descending") {
      baseSpeed = 2.7 + stats.descending * 0.058;
    } else {
      baseSpeed = 2.0 + stats.flat * 0.05;
    }

    if (!onRoad) {
      baseSpeed *= 0.7;
    }

    if (sprinting) {
      baseSpeed *= stats.sprintMultiplier;
    }

    return baseSpeed;
  }

  getPlayerInputDirection() {
    if (this.runtime.isTouchDevice) {
      const pointer = this.input.activePointer;
      if (!pointer.isDown) {
        return { x: 0, y: 0 };
      }

      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2;
      const screenX = pointer.x - centerX;
      const screenY = pointer.y - centerY;

      return this.screenDirectionToWorldDirection(screenX, screenY, false);
    }

    let screenX = 0;
    let screenY = 0;

    if ((this.cursors?.left && this.cursors.left.isDown) || (this.keys?.A && this.keys.A.isDown)) {
      screenX -= 1;
    }

    if ((this.cursors?.right && this.cursors.right.isDown) || (this.keys?.D && this.keys.D.isDown)) {
      screenX += 1;
    }

    if ((this.cursors?.up && this.cursors.up.isDown) || (this.keys?.W && this.keys.W.isDown)) {
      screenY -= 1;
    }

    if ((this.cursors?.down && this.cursors.down.isDown) || (this.keys?.S && this.keys.S.isDown)) {
      screenY += 1;
    }

    return this.screenDirectionToWorldDirection(screenX, screenY, true);
  }

  screenDirectionToWorldDirection(screenX, screenY, isKeyboard) {
    if (screenX === 0 && screenY === 0) {
      return { x: 0, y: 0 };
    }

    let normalizedX = screenX;
    let normalizedY = screenY;

    if (!isKeyboard) {
      const pointerMagnitude = Math.hypot(screenX, screenY);
      if (pointerMagnitude < 20) {
        return { x: 0, y: 0 };
      }

      normalizedX /= pointerMagnitude;
      normalizedY /= pointerMagnitude;
    }

    const a = normalizedX / (this.tileWidth / 2);
    const b = normalizedY / (this.tileHeight / 2);

    let worldX = (a + b) / 2;
    let worldY = (b - a) / 2;

    const magnitude = Math.hypot(worldX, worldY);
    if (magnitude === 0) {
      return { x: 0, y: 0 };
    }

    worldX /= magnitude;
    worldY /= magnitude;

    return { x: worldX, y: worldY };
  }

  checkPlayerNpcCollisions() {
    for (const npc of this.npcs) {
      const collisionDistance = this.player.radius + npc.radius;
      const distanceSquared = Phaser.Math.Distance.Squared(this.player.x, this.player.y, npc.x, npc.y);
      const colliding = distanceSquared <= collisionDistance * collisionDistance;

      if (colliding && !npc.wasCollidingWithPlayer) {
        const line = this.getNextDialogueLine(npc);
        this.showBubble(npc, line);
        this.runtime.music.playSfx("hit");
      }

      npc.wasCollidingWithPlayer = colliding;
    }
  }

  getNextDialogueLine(npc) {
    if (!npc.dialogueBag || npc.dialogueBag.length === 0) {
      npc.dialogueBag = Phaser.Utils.Array.Shuffle([...npc.character.dialogues]);
    }

    return npc.dialogueBag.pop();
  }

  showBubble(entity, message) {
    entity.bubbleText.setText(message);

    const paddingX = 8;
    const paddingY = 6;
    const width = entity.bubbleText.width + paddingX * 2;
    const height = entity.bubbleText.height + paddingY * 2;

    const bg = entity.bubbleBackground;
    bg.clear();
    bg.fillStyle(0xfff9ed, 0.95);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    bg.lineStyle(2, 0x3e2f2a, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);

    bg.fillStyle(0xfff9ed, 0.95);
    bg.fillTriangle(-6, height / 2 - 1, 6, height / 2 - 1, 0, height / 2 + 9);
    bg.lineBetween(-6, height / 2 - 1, 0, height / 2 + 9);
    bg.lineBetween(6, height / 2 - 1, 0, height / 2 + 9);

    entity.bubbleContainer.setVisible(true);
    entity.bubbleTimer = 1.7;
  }

  updateBubbleState(entity, dt) {
    if (entity.bubbleTimer <= 0) {
      entity.bubbleContainer.setVisible(false);
      return;
    }

    entity.bubbleTimer -= dt;
    if (entity.bubbleTimer <= 0) {
      entity.bubbleContainer.setVisible(false);
      return;
    }

    const iso = this.toIso(entity.x, entity.y);
    entity.bubbleContainer.setPosition(iso.x, iso.y - 58);
    entity.bubbleContainer.setDepth(iso.y + 500);
  }

  updateEntityDisplay(entity) {
    const iso = this.toIso(entity.x, entity.y);

    entity.shadow.setPosition(iso.x, iso.y + 7);
    entity.shadow.setDepth(iso.y + 3);

    entity.sprite.setPosition(iso.x, iso.y - 5);
    entity.sprite.setDepth(iso.y + 12);

    const speed = Math.hypot(entity.vx, entity.vy);
    if (speed > 0.05) {
      entity.sprite.setRotation(Math.atan2(entity.vy, entity.vx) + Math.PI / 4);

      entity.frameTimer += this.game.loop.delta;
      const frameDuration = speed > 3.4 ? 95 : 135;
      if (entity.frameTimer >= frameDuration) {
        entity.frameTimer = 0;
        entity.frameIndex = (entity.frameIndex + 1) % 2;
        entity.sprite.setTexture(`${entity.textureBaseKey}-${entity.frameIndex}`);
      }
    } else if (entity.frameIndex !== 0) {
      entity.frameIndex = 0;
      entity.frameTimer = 0;
      entity.sprite.setTexture(`${entity.textureBaseKey}-0`);
    }

    entity.nameTag.setPosition(iso.x, iso.y - 32);
    entity.nameTag.setDepth(iso.y + 18);

    if (entity.isPlayer && this.playerAura) {
      this.playerAura.setPosition(iso.x, iso.y + 6);
      this.playerAura.setDepth(iso.y + 4);
    }
  }

  updateCameraCenter() {
    if (!this.player) {
      return;
    }

    const cam = this.cameras.main;
    const playerIso = this.toIso(this.player.x, this.player.y);

    cam.scrollX = playerIso.x - cam.width / 2;
    cam.scrollY = playerIso.y - cam.height / 2;
  }

  updateHud(deltaMs) {
    this.lastHudUpdateMs += deltaMs;
    if (this.lastHudUpdateMs < 80) {
      return;
    }

    this.lastHudUpdateMs = 0;

    const terrain = this.getTerrainTypeAt(this.player.x, this.player.y);
    const terrainText = terrain === "ascending" ? "Ufwärts" : terrain === "descending" ? "Abwärts" : "Flach";
    const sectionText = this.getSectionNameAt(this.player.x, this.player.y);
    const onRoad = this.isRoad(Math.floor(this.player.x), Math.floor(this.player.y));

    const sprintInfo = this.sprintTimeLeft > 0 ? `Sprint aktiv: ${this.sprintTimeLeft.toFixed(1)}s` : "Sprint bereit";

    this.uiRefs.hudTextElement.textContent = `${this.player.character.name} | Area: ${sectionText} | Terrain: ${terrainText} | ${onRoad ? "Strass" : "Nebe de Strass"} | ${sprintInfo}`;
  }

  toIso(worldX, worldY) {
    return {
      x: (worldX - worldY) * (this.tileWidth / 2) + this.isoOriginX,
      y: (worldX + worldY) * (this.tileHeight / 2) + this.isoOriginY,
    };
  }

  getLoopPointAtAngle(angle) {
    const radiusX = (this.loopOuterRadius.x + this.loopInnerRadius.x) / 2;
    const radiusY = (this.loopOuterRadius.y + this.loopInnerRadius.y) / 2;
    return [this.loopCenter.x + Math.cos(angle) * radiusX, this.loopCenter.y + Math.sin(angle) * radiusY];
  }

  getRandomPointInSocialHub() {
    for (let i = 0; i < 16; i += 1) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const radius = Math.sqrt(Math.random());
      const x = this.socialHub.x + Math.cos(angle) * this.socialHub.radiusX * radius;
      const y = this.socialHub.y + Math.sin(angle) * this.socialHub.radiusY * radius;
      if (this.isInSocialHub(x, y)) {
        return { x, y };
      }
    }

    return { x: this.socialHub.x, y: this.socialHub.y };
  }

  getRandomPointOnLoopRoad() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const t = Phaser.Math.FloatBetween(0, 1);
    const radiusX = Phaser.Math.Linear(this.loopInnerRadius.x + 0.7, this.loopOuterRadius.x - 0.7, t);
    const radiusY = Phaser.Math.Linear(this.loopInnerRadius.y + 0.7, this.loopOuterRadius.y - 0.7, t);
    return {
      x: this.loopCenter.x + Math.cos(angle) * radiusX,
      y: this.loopCenter.y + Math.sin(angle) * radiusY,
    };
  }

  isRoad(tileX, tileY) {
    const worldX = tileX + 0.5;
    const worldY = tileY + 0.5;
    return this.isOnLoopRoad(worldX, worldY) || this.isOnConnectorRoad(worldX, worldY) || this.isInSocialHub(worldX, worldY);
  }

  isOnLoopRoad(worldX, worldY) {
    const dx = worldX - this.loopCenter.x;
    const dy = worldY - this.loopCenter.y;

    const outerNorm =
      (dx * dx) / (this.loopOuterRadius.x * this.loopOuterRadius.x) +
      (dy * dy) / (this.loopOuterRadius.y * this.loopOuterRadius.y);
    const innerNorm =
      (dx * dx) / (this.loopInnerRadius.x * this.loopInnerRadius.x) +
      (dy * dy) / (this.loopInnerRadius.y * this.loopInnerRadius.y);

    return outerNorm <= 1.04 && innerNorm >= 0.92;
  }

  isInSocialHub(worldX, worldY) {
    const dx = worldX - this.socialHub.x;
    const dy = worldY - this.socialHub.y;
    const norm = (dx * dx) / (this.socialHub.radiusX * this.socialHub.radiusX) + (dy * dy) / (this.socialHub.radiusY * this.socialHub.radiusY);
    return norm <= 1;
  }

  isOnConnectorRoad(worldX, worldY) {
    return this.connectorRoads.some(
      (road) =>
        this.distanceToSegment(worldX, worldY, road.x1, road.y1, road.x2, road.y2) <= road.halfWidth,
    );
  }

  distanceToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const segmentLengthSquared = dx * dx + dy * dy;
    if (segmentLengthSquared === 0) {
      return Math.hypot(px - x1, py - y1);
    }

    const projection = ((px - x1) * dx + (py - y1) * dy) / segmentLengthSquared;
    const t = Phaser.Math.Clamp(projection, 0, 1);
    const closestX = x1 + dx * t;
    const closestY = y1 + dy * t;
    return Math.hypot(px - closestX, py - closestY);
  }

  getLoopAngle(worldX, worldY) {
    return (Math.atan2(worldY - this.loopCenter.y, worldX - this.loopCenter.x) + Math.PI * 2) % (Math.PI * 2);
  }

  getTerrainTypeAt(worldX, worldY) {
    if (this.isInSocialHub(worldX, worldY)) {
      return "flat";
    }

    if (!this.isOnLoopRoad(worldX, worldY)) {
      return "flat";
    }

    const angle = this.getLoopAngle(worldX, worldY);
    if (angle >= this.passSectionAngles.start && angle < this.passSectionAngles.end) {
      return "ascending";
    }

    if (angle >= this.descentSectionAngles.start && angle < this.descentSectionAngles.end) {
      return "descending";
    }

    return "flat";
  }

  getSectionNameAt(worldX, worldY) {
    if (this.isInSocialHub(worldX, worldY)) {
      return "Social/Meeting";
    }

    if (this.isOnLoopRoad(worldX, worldY)) {
      const angle = this.getLoopAngle(worldX, worldY);
      if (angle >= this.passSectionAngles.start && angle < this.passSectionAngles.end) {
        return "Climb/Pass";
      }
      if (angle >= this.descentSectionAngles.start && angle < this.descentSectionAngles.end) {
        return "Descent";
      }
      return "Flat Loop";
    }

    if (this.isOnConnectorRoad(worldX, worldY)) {
      return "Connector";
    }

    return "Open Terrain";
  }

  collidesObstacle(worldX, worldY, radius) {
    for (const obstacle of this.obstacles) {
      const nearestX = Phaser.Math.Clamp(worldX, obstacle.x, obstacle.x + obstacle.w);
      const nearestY = Phaser.Math.Clamp(worldY, obstacle.y, obstacle.y + obstacle.h);
      const distanceSquared = Phaser.Math.Distance.Squared(worldX, worldY, nearestX, nearestY);

      if (distanceSquared < radius * radius) {
        return true;
      }
    }

    return false;
  }
}

class ChiptuneAudio {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.started = false;
    this.step = 0;
    this.timer = null;

    this.melody = [76, 78, 79, 83, 81, 79, 78, 76, 74, 76, 78, 79, 78, 76, 74, 71];
    this.bass = [48, 48, 50, 50, 53, 53, 50, 50, 46, 46, 48, 48, 50, 50, 45, 45];
  }

  start() {
    if (this.started) {
      this.resume();
      this.beginLoop();
      return;
    }

    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      return;
    }

    this.context = new AudioContextConstructor();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.07;
    this.masterGain.connect(this.context.destination);

    this.started = true;
    this.resume();
    this.beginLoop();
  }

  stop() {
    if (!this.context || !this.started) {
      return;
    }

    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }

    if (this.context.state === "running") {
      this.context.suspend();
    }
  }

  resume() {
    if (this.context && this.context.state === "suspended") {
      this.context.resume();
    }
  }

  beginLoop() {
    if (!this.context || this.timer) {
      return;
    }

    this.timer = window.setInterval(() => {
      this.tick();
    }, 165);
  }

  tick() {
    if (!this.context || this.context.state !== "running") {
      return;
    }

    const now = this.context.currentTime;
    const melodyNote = this.melody[this.step % this.melody.length];
    const bassNote = this.bass[this.step % this.bass.length];

    this.playTone(melodyNote, now, 0.13, "square", 0.048);

    if (this.step % 2 === 0) {
      this.playTone(bassNote, now, 0.16, "triangle", 0.033);
    }

    if (this.step % 4 === 0) {
      this.playKick(now);
    }

    this.step += 1;
  }

  playSfx(type) {
    if (!this.context || this.context.state !== "running") {
      return;
    }

    const now = this.context.currentTime;

    if (type === "hit") {
      this.playTone(88, now, 0.05, "square", 0.06);
      this.playTone(82, now + 0.06, 0.05, "square", 0.04);
      return;
    }

    if (type === "sprint") {
      this.playTone(72, now, 0.07, "square", 0.055);
      this.playTone(79, now + 0.07, 0.07, "square", 0.055);
      this.playTone(84, now + 0.14, 0.1, "square", 0.05);
    }
  }

  playTone(midi, startTime, duration, oscillatorType, gainAmount) {
    const frequency = 440 * 2 ** ((midi - 69) / 12);

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.type = oscillatorType;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(gainAmount, startTime + 0.012);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }

  playKick(startTime) {
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(180, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(48, startTime + 0.09);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(0.055, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.11);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.13);
  }
}

music = new ChiptuneAudio();

function toHex(number) {
  return `#${number.toString(16).padStart(6, "0")}`;
}
