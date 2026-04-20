const fishTypes = [
  { name: "Salmon", rarity: "common", journalEntry: "" },
  { name: "Tuna", rarity: "uncommon", journalEntry: "" },
  { name: "Bass", rarity: "common", journalEntry: "" },
  { name: "Pufferfish", rarity: "rare", journalEntry: "" },
  { name: "Anglerfish", rarity: "rare", journalEntry: "" },
  { name: "Golden Koi", rarity: "legendary", journalEntry: "" },
  { name: "Dragonfish", rarity: "mythical", journalEntry: "" },
  { name: "livia fish", rarity: "the one that got away", length: 170, weight: "how rude to ask", journalEntry: "" },
  { name: "axel fish", rarity: "the one that got away", length: 177, weight: "how rude to ask", journalEntry: "" },
  { name: "marcus fish", rarity: "the one that got away", length: 180, weight: "how rude to ask", journalEntry: "" },
  { name: "jake fish", rarity: "the one that got away", length: 187, weight: "how rude to ask", journalEntry: "" },
  { name: "josh fish", rarity: "the one that got away", length: 180, weight: "how rude to ask", journalEntry: "" },
];

const VALID_RARITIES = ["common", "uncommon", "rare", "legendary", "mythical", "the one that got away"];

function getRandomFish() {
  const roll = Math.random();

  let pool;
  if (roll < 0.6) {
    pool = fishTypes.filter(f => f.rarity === "common");
  } else if (roll < 0.75) {
    pool = fishTypes.filter(f => f.rarity === "uncommon");
  } else if (roll < 0.87) {
    pool = fishTypes.filter(f => f.rarity === "rare");
  } else if (roll < 0.9) {
    pool = fishTypes.filter(f => f.rarity === "legendary");
  } else if (roll < 0.99) {
    pool = fishTypes.filter(f => f.rarity === "mythical");
  } else {
    pool = fishTypes.filter(f => f.rarity === "the one that got away");
  }

  const template = pool[Math.floor(Math.random() * pool.length)];

  if (template.rarity === "the one that got away") {
    return {
      name: template.name,
      rarity: template.rarity,
      length: template.length,
      weight: template.weight,
      journalEntry: template.journalEntry,
    };
  }

  const length =
    template.rarity === "common" ? Math.floor(Math.random() * 40) + 20 :
    template.rarity === "uncommon" ? Math.floor(Math.random() * 50) + 30 :
    template.rarity === "rare" ? Math.floor(Math.random() * 60) + 40 :
    template.rarity === "legendary" ? Math.floor(Math.random() * 80) + 50 :
    Math.floor(Math.random() * 80) + 60;

  const weight = Math.round(length * (Math.random() * 0.5 + 0.02));

  return {
    name: template.name,
    rarity: template.rarity,
    length,
    weight,
    journalEntry: template.journalEntry,
  };
}

function isValidFishName(name) {
  return fishTypes.some(f => f.name === name);
}

module.exports = { fishTypes, getRandomFish, isValidFishName, VALID_RARITIES };
