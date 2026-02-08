const PHOTO_OVERRIDES = {
  andu: "Ändu.PNG",
  andri: "Andri.PNG",
  tiago: "Tiago.jpg",
  patricio: "Patricio.jpg",
  "luki-w": "LukiW.JPG",
  "luki-f": "LukiF.jpg",
  marc: "Marc.PNG",
  camilo: "Camilo.jpg",
  peter: "Peter.PNG",
};

const DEFAULT_DIALOGUES = ["hey", "hey 2", "hey 3", "hey 4", "hey 5"];

const DEFAULT_VISUAL = {
  helmetColor: 0xf0f0f0,
  helmetAccent: 0x202020,
  visorColor: 0x6db4d8,
  jerseyPrimary: 0x2f6fb1,
  jerseySecondary: 0xffffff,
  jerseyAccent: 0xd84738,
  jerseyTertiary: 0x1d1d1d,
  jerseyPattern: "solid",
  sleeveColor: 0x2f6fb1,
  sleeveStyle: "short",
  shortsColor: 0x1e1e1e,
  bikeColor: 0x1d1d1d,
  bikeAccent: 0x4a4a4a,
  skinColor: 0xcf9e74,
  sockColor: 0xf5f5f5,
  shoeColor: 0xf2f2f2,
  gloveColor: 0x191919,
  beardStyle: "none",
  glassesStyle: "none",
};

const VISUAL_BY_SLUG = {
  andu: {
    helmetColor: 0xf2f2f2,
    helmetAccent: 0x202020,
    visorColor: 0xa67a3f,
    jerseyPrimary: 0xf1f1f1,
    jerseySecondary: 0x1e1e1e,
    jerseyAccent: 0x8f8f8f,
    jerseyTertiary: 0x2a2a2a,
    jerseyPattern: "alpha",
    sleeveColor: 0xefefef,
    sleeveStyle: "short",
    shortsColor: 0x232323,
    bikeColor: 0xf0f0f0,
    bikeAccent: 0x4a4a4a,
    skinColor: 0xc39167,
    sockColor: 0xececec,
    shoeColor: 0xf6f6f6,
    gloveColor: 0x161616,
    beardStyle: "stubble",
    glassesStyle: "visor",
  },
  andri: {
    helmetColor: 0x1b1d24,
    helmetAccent: 0x0f1117,
    visorColor: 0x1a1c20,
    jerseyPrimary: 0x1f2f67,
    jerseySecondary: 0x1a224a,
    jerseyAccent: 0xf0c233,
    jerseyTertiary: 0xd63a33,
    jerseyPattern: "colombia",
    sleeveColor: 0x1f2f67,
    sleeveStyle: "short",
    shortsColor: 0x141a2f,
    bikeColor: 0x101113,
    bikeAccent: 0x363840,
    skinColor: 0xd4a27b,
    sockColor: 0xf4f4f4,
    shoeColor: 0xf8f8f8,
    gloveColor: 0x1a1d22,
    beardStyle: "none",
    glassesStyle: "sport",
  },
  tiago: {
    helmetColor: 0xf3f3f3,
    helmetAccent: 0x252525,
    visorColor: 0x202020,
    jerseyPrimary: 0xc9eb40,
    jerseySecondary: 0x1f1f1f,
    jerseyAccent: 0xa4c62f,
    jerseyTertiary: 0xe8ff72,
    jerseyPattern: "neon",
    sleeveColor: 0xd4f054,
    sleeveStyle: "short",
    shortsColor: 0x1f1f1f,
    bikeColor: 0x121212,
    bikeAccent: 0x404040,
    skinColor: 0x8f6545,
    sockColor: 0xecf1ef,
    shoeColor: 0x1a1a1a,
    gloveColor: 0x242424,
    beardStyle: "full",
    glassesStyle: "sport",
  },
  patricio: {
    helmetColor: 0xf3f3f3,
    helmetAccent: 0x1b1b1b,
    visorColor: 0x76808f,
    jerseyPrimary: 0x1f387e,
    jerseySecondary: 0xffffff,
    jerseyAccent: 0xcf3c45,
    jerseyTertiary: 0x17316b,
    jerseyPattern: "soudal",
    sleeveColor: 0xffffff,
    sleeveStyle: "long",
    shortsColor: 0x1d2a4a,
    bikeColor: 0x171717,
    bikeAccent: 0x3e3e3e,
    skinColor: 0xbd8a62,
    sockColor: 0xf0f0f0,
    shoeColor: 0xf9f9f9,
    gloveColor: 0x1c1c1c,
    beardStyle: "full",
    glassesStyle: "none",
  },
  "luki-w": {
    helmetColor: 0xececec,
    helmetAccent: 0x2a2f38,
    visorColor: 0x4d9ad8,
    jerseyPrimary: 0x20242a,
    jerseySecondary: 0x13151a,
    jerseyAccent: 0x3f566f,
    jerseyTertiary: 0x29323d,
    jerseyPattern: "all-black",
    sleeveColor: 0x101215,
    sleeveStyle: "long",
    shortsColor: 0x121418,
    bikeColor: 0x0f1011,
    bikeAccent: 0x3a3a3a,
    skinColor: 0xcf9e76,
    sockColor: 0xebedf0,
    shoeColor: 0x191b1d,
    gloveColor: 0x1a1b1e,
    beardStyle: "stubble",
    glassesStyle: "sport",
  },
  "luki-f": {
    helmetColor: 0xf4f4f4,
    helmetAccent: 0x2f2f2f,
    visorColor: 0xd7d2bb,
    jerseyPrimary: 0x173b7f,
    jerseySecondary: 0x1d2b56,
    jerseyAccent: 0x4bc3d8,
    jerseyTertiary: 0x1f5fb5,
    jerseyPattern: "movistar",
    sleeveColor: 0x1d3b73,
    sleeveStyle: "short",
    shortsColor: 0x182342,
    bikeColor: 0x1a1a1a,
    bikeAccent: 0xca3333,
    skinColor: 0xd6aa86,
    sockColor: 0xf2f2f2,
    shoeColor: 0xebebeb,
    gloveColor: 0x171717,
    beardStyle: "none",
    glassesStyle: "sport",
  },
  marc: {
    helmetColor: 0x2b2f35,
    helmetAccent: 0x14161b,
    visorColor: 0x838b95,
    jerseyPrimary: 0xbec8c1,
    jerseySecondary: 0x161819,
    jerseyAccent: 0x2b2f34,
    jerseyTertiary: 0x4f595f,
    jerseyPattern: "vest",
    sleeveColor: 0xbec8c1,
    sleeveStyle: "long",
    shortsColor: 0x1d1f22,
    bikeColor: 0x2ea8ea,
    bikeAccent: 0x168ecb,
    skinColor: 0xd5a67f,
    sockColor: 0xf2f2f2,
    shoeColor: 0xf5f5f5,
    gloveColor: 0x202226,
    beardStyle: "stubble",
    glassesStyle: "none",
  },
  camilo: {
    helmetColor: 0xf0f0f0,
    helmetAccent: 0x20242a,
    visorColor: 0x3ab0d8,
    jerseyPrimary: 0xf6f6f6,
    jerseySecondary: 0x1f1f1f,
    jerseyAccent: 0xe5e5e5,
    jerseyTertiary: 0xbfd8e2,
    jerseyPattern: "white-minimal",
    sleeveColor: 0xf3f3f3,
    sleeveStyle: "short",
    shortsColor: 0x202020,
    bikeColor: 0x111111,
    bikeAccent: 0x2a2a2a,
    skinColor: 0x9d6b44,
    sockColor: 0xf5f5f5,
    shoeColor: 0xece8e0,
    gloveColor: 0x1e1e1e,
    beardStyle: "stubble",
    glassesStyle: "sport",
  },
  peter: {
    helmetColor: 0xf0f0f0,
    helmetAccent: 0x2c2c2c,
    visorColor: 0x71b5eb,
    jerseyPrimary: 0xf6f6f6,
    jerseySecondary: 0x2a2a2a,
    jerseyAccent: 0xdd5146,
    jerseyTertiary: 0xbb3e35,
    jerseyPattern: "castelli",
    sleeveColor: 0xf2f2f2,
    sleeveStyle: "short",
    shortsColor: 0x242424,
    bikeColor: 0x2b2d33,
    bikeAccent: 0x5b5f66,
    skinColor: 0xd1a072,
    sockColor: 0xfff6dd,
    shoeColor: 0xf7f7f7,
    gloveColor: 0x191919,
    beardStyle: "none",
    glassesStyle: "sport",
  },
};

const FALLBACK_CHARACTERS = [
  {
    id: "andu",
    name: "Ändu",
    bio: "Ändu vom Team Alpha Racing ist für seinen Dieselmotor im Flachen bekannt.",
    stats: { flat: 80, ascending: 50, descending: 95, sprintMultiplier: 2 },
    dialogues: ["Chömed Gielle!", "Am drucke wien e Mohre!", "Was für Vögel!", "Isch huere geil da!", "Nögst Wuchenend hani renne."],
  },
  {
    id: "andri",
    name: "Andri",
    bio: "Gesegnet mit Talent, braucht Andri eine Handvoll Ausfahrten pro Jahr, um mit dem Movistar Team mitzuhalten.",
    stats: { flat: 70, ascending: 40, descending: 100, sprintMultiplier: 2 },
    dialogues: ["Chan ich no es E-Bike miete?", "De Stelvio fahr ich am liebste vo allne Siite!"],
  },
  {
    id: "tiago",
    name: "Tiago",
    bio: "Tiago aus Portugal ist der beste Schwimmer der Gruppe.",
    stats: { flat: 60, ascending: 50, descending: 100, sprintMultiplier: 1.25 },
    dialogues: ["Bota Lumen!", "Guys, it's too fast!", "Pack with the pack!", "Can we switch to swimming?", "Guys, I will go my speed."],
  },
  {
    id: "patricio",
    name: "Patricio",
    bio: "Patricio interessiert sich neben dem Velofahren vor allem auch noch für die Menschen.",
    stats: { flat: 70, ascending: 50, descending: 90, sprintMultiplier: 1.5 },
    dialogues: ["Huch!", "Du bisch mer eine…", "hihihi", "Chunt öpper mit mir is Spa?", "Machsch du Yoga?"],
  },
  {
    id: "luki-w",
    name: "Luki W.",
    bio: "Luki W. fährt am liebesten Touren nördlich der 200km.",
    stats: { flat: 70, ascending: 50, descending: 90, sprintMultiplier: 1.5 },
    dialogues: ["Wenn fahred mer 300km?!", "Bin bullish af!", "Hey, mega coole Helm!", "Bisch öfters da?", "Jetzt müemer chli pushe!"],
  },
  {
    id: "luki-f",
    name: "Luki F.",
    bio: "Luki F. liebt gewisse Marken und hasst gewisste Marken.",
    stats: { flat: 70, ascending: 40, descending: 90, sprintMultiplier: 1.75 },
    dialogues: ["Scheiss ON!", "Ich plane mal eine Route.", "PNS isch s'hinderletcht.", "Für mich gern Bier mit Alkohol!", "Das Jahr gits mal wieder es nois Colnago!"],
  },
  {
    id: "marc",
    name: "Marc",
    bio: "Marc war länger nicht mehr auf dem Velo und lebt in Miami.",
    stats: { flat: 50, ascending: 30, descending: 90, sprintMultiplier: 1.25 },
    dialogues: ["I'm in Miami, Bitch!", "Bin momentan nöd trainiert…", "Sones chranks Velo!", "Die Community ist sich noch uneinig.", "Das Jahr ohni Unfall!"],
  },
  {
    id: "camilo",
    name: "Camilo",
    bio: "Bei Camilo heisst es: Je steiler, desto geiler",
    stats: { flat: 70, ascending: 70, descending: 80, sprintMultiplier: 1.5 },
    dialogues: ["Das ischt brutal!", "Jungs, sinder parat?", "Wann fahren wir Letras?", "Machen wir Stelvio?", "Ich bin in Verhandlungen mit Alpha."],
  },
  {
    id: "peter",
    name: "Peter",
    bio: "Peter rasiert jeden Sport den es gibt - manchmal ist er auf dem Velo.",
    stats: { flat: 70, ascending: 50, descending: 80, sprintMultiplier: 1.5 },
    dialogues: ["Chli goge d'Bei usschüttla!", "Langlaufe isch scho au schön!", "Muen chli weg em Chnüh luege…", "Hender de Mauro Schmid gseh?"],
  },
].map((character) => ({
  ...character,
  photoPath: (() => {
    const fileName = getPhotoFileName(character.name);
    return fileName ? `./characters/${fileName}` : null;
  })(),
  visual: resolveVisual(character.name),
}));

export async function loadCharacters() {
  try {
    const response = await fetch("./characters/characters.csv", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`CSV load failed (${response.status})`);
    }

    const csvText = await response.text();
    const rows = parseCsv(csvText);
    if (rows.length < 2) {
      throw new Error("CSV is empty");
    }

    const header = rows[0].map((field, index) => (index === 0 ? field.replace(/^\uFEFF/, "") : field));
    const characters = [];

    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i];
      if (!row.length || row.every((field) => field.trim() === "")) {
        continue;
      }

      const record = Object.fromEntries(header.map((name, index) => [name, (row[index] || "").trim()]));
      const name = record.Name;
      if (!name) {
        continue;
      }

      const dialogues = [
        record["Custom Line 1"],
        record["Custom Line 2"],
        record["Custom Line 3"],
        record["Custom Line 4"],
        record["Custom Line 5"],
      ].filter((line) => line && line.trim().length > 0);

      characters.push({
        id: slugify(name),
        name,
        bio: record.Bio || `${name} isch parat für dini nächsti Uusfahrt.`,
        stats: {
          flat: clamp(toNumber(record["Speed in flat"], 70), 0, 100),
          ascending: clamp(toNumber(record["Speed in ascending"], 50), 0, 100),
          descending: clamp(toNumber(record["Speed in descending"], 90), 0, 100),
          sprintMultiplier: clamp(toNumber(record["Sprinting in Flat"], 1.5), 1, 3),
        },
        dialogues: dialogues.length > 0 ? dialogues : [...DEFAULT_DIALOGUES],
        photoPath: getPhotoPath(name, record.Photo),
        visual: resolveVisual(name),
      });
    }

    if (!characters.length) {
      return FALLBACK_CHARACTERS;
    }

    return characters;
  } catch (error) {
    console.warn("Using fallback character dataset:", error);
    return FALLBACK_CHARACTERS;
  }
}

function getPhotoPath(name, csvPhotoName) {
  const override = getPhotoFileName(name);
  if (override) {
    return `./characters/${override}`;
  }

  if (!csvPhotoName) {
    return null;
  }

  return `./characters/${csvPhotoName}`;
}

function getPhotoFileName(name) {
  return PHOTO_OVERRIDES[slugify(name)] || null;
}

function resolveVisual(name) {
  const key = slugify(name);
  return {
    ...DEFAULT_VISUAL,
    ...(VISUAL_BY_SLUG[key] || {}),
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toNumber(value, fallback) {
  const parsed = Number.parseFloat(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
