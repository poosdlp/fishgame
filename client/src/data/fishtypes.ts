import type { FishTemplate } from "../types/fish";

export const fishTypes: FishTemplate[] = [

  // ─── Common ───────────────────────────────────────────────────────────────
  {
    name: "Eastern Mosquitofish",
    rarity: "common",
    journalEntry: "The most common freshwater fish in Florida. Tiny but everywhere — blink and you'll miss it.",
  },
  {
    name: "Bluefin Killifish",
    rarity: "common",
    journalEntry: "A slender little topminnow with a striking red-orange tail. Loves vegetated ditches and slow backwaters.",
  },
  {
    name: "Golden Topminnow",
    rarity: "common",
    journalEntry: "Shimmers like a fleck of sunlight near the surface. One of the prettiest common fish in Florida.",
  },
  {
    name: "Flagfish",
    rarity: "common",
    journalEntry: "Native only to Florida. Its red-and-white striped sides supposedly resemble the American flag.",
  },
  {
    name: "Least Killifish",
    rarity: "common",
    journalEntry: "One of the smallest vertebrates on the planet. Hard to believe something this tiny counts as a catch.",
  },
  {
    name: "Bluegill",
    rarity: "common",
    journalEntry: "The quintessential Florida sunfish. If you grew up fishing in Florida, your first catch was probably one of these.",
  },
  {
    name: "Redear Sunfish",
    rarity: "common",
    journalEntry: "Called the Shellcracker for its habit of crushing snails with its back teeth. A Florida angler staple.",
  },
  {
    name: "Brown Bullhead",
    rarity: "common",
    journalEntry: "A bottom-dwelling catfish with mottled brown skin and sharp spines. Tougher than it looks.",
  },
  {
    name: "Pirate Perch",
    rarity: "common",
    journalEntry: "Oddly, its anus is located near its throat. Scientists still argue about why. The fish doesn't seem to care.",
  },
  {
    name: "Lake Chubsucker",
    rarity: "common",
    journalEntry: "A thick-bodied sucker that vacuums up detritus from the lake floor. Not glamorous, but effective.",
  },

  // ─── Uncommon ─────────────────────────────────────────────────────────────
  {
    name: "Largemouth Bass",
    rarity: "uncommon",
    journalEntry: "The king of Florida sport fishing. Explosive strikes, acrobatic jumps — every angler chases this one.",
  },
  {
    name: "Warmouth",
    rarity: "uncommon",
    journalEntry: "A tough, aggressive little sunfish with a wide mouth and a mean streak. Loves dark, tannic water.",
  },
  {
    name: "Redbreast Sunfish",
    rarity: "uncommon",
    journalEntry: "Bright orange-red belly, built for fast-moving rivers. One of the most colorful fish in Florida.",
  },
  {
    name: "Spotted Sunfish",
    rarity: "uncommon",
    journalEntry: "Dark olive body covered in rows of small black and brown spots. A Florida favorite that rarely gets the credit it deserves.",
  },
  {
    name: "Flier",
    rarity: "uncommon",
    journalEntry: "A deep-bodied sunfish of blackwater swamps. Rows of black spots give it an almost polka-dotted look.",
  },
  {
    name: "Yellow Bullhead",
    rarity: "uncommon",
    journalEntry: "Lighter colored than its brown cousin, with white chin barbels. Hunts by smell in murky water.",
  },
  {
    name: "White Catfish",
    rarity: "uncommon",
    journalEntry: "A medium-sized catfish common in tidal rivers and coastal streams. Mild-mannered compared to flatheads.",
  },
  {
    name: "Redfin Pickerel",
    rarity: "uncommon",
    journalEntry: "The smallest of Florida's pickerels, but every bit as toothy and aggressive as its bigger relatives.",
  },
  {
    name: "Spotted Bass",
    rarity: "uncommon",
    journalEntry: "Often mistaken for a largemouth, but leaner and more at home in clear, flowing water.",
  },
  {
    name: "Banded Topminnow",
    rarity: "uncommon",
    journalEntry: "An olive-green topminnow with rows of small brown to red spots and clear to red-orange fins. Skims the surface of quiet backwaters near vegetation.",
  },

  // ─── Rare ─────────────────────────────────────────────────────────────────
  {
    name: "Bowfin",
    rarity: "rare",
    journalEntry: "A living fossil — its lineage stretches back over 150 million years. It breathes air and bites hard.",
  },
  {
    name: "Florida Gar",
    rarity: "rare",
    journalEntry: "An armored ambush predator with a snout full of needle-like teeth. Native to Florida's lowland lakes.",
  },
  {
    name: "Longnose Gar",
    rarity: "rare",
    journalEntry: "Its snout is more than twice the length of the rest of its head. Ancient design, still working perfectly.",
  },
  {
    name: "Chain Pickerel",
    rarity: "rare",
    journalEntry: "Named for the chain-link pattern along its sides. A fast, aggressive ambush hunter of weedy shallows.",
  },
  {
    name: "American Eel",
    rarity: "rare",
    journalEntry: "Born in the Sargasso Sea, travels thousands of miles to reach Florida's rivers. Slippery in every sense.",
  },
  {
    name: "Swamp Darter",
    rarity: "rare",
    journalEntry: "A master of slow, weedy backwaters. Its incomplete lateral line is strongly arched — a subtle field mark most anglers never notice.",
  },
  {
    name: "Spotted Sucker",
    rarity: "rare",
    journalEntry: "Rows of dark spots along each scale give it a dotted, almost painted look. A bottom feeder of clean, flowing Panhandle rivers.",
  },
  {
    name: "Blackbanded Darter",
    rarity: "rare",
    journalEntry: "A tiny, jewel-like perch of Panhandle streams. Blink and you might mistake it for a pebble darting across the gravel.",
  },
  {
    name: "Crystal Darter",
    rarity: "rare",
    journalEntry: "Nearly transparent and almost invisible against sandy riverbeds. Found only in a handful of Panhandle rivers.",
  },
  {
    name: "Cypress Darter",
    rarity: "rare",
    journalEntry: "A tiny darter that hides among cypress roots in slow, tannic streams. Blink and it's gone.",
  },

  // ─── Legendary ────────────────────────────────────────────────────────────
  {
    name: "Suwannee Bass",
    rarity: "legendary",
    journalEntry: "Found in only two river systems in the entire world — the Suwannee and Santa Fe. A true Florida original.",
  },
  {
    name: "Shoal Bass",
    rarity: "legendary",
    journalEntry: "Lives exclusively in the rocky shoals of the Apalachicola drainage. Powerful, fast, and fiercely territorial.",
  },
  {
    name: "Shadow Bass",
    rarity: "legendary",
    journalEntry: "A secretive bass of dark, tannin-stained Panhandle streams. Rarely seen, rarely caught.",
  },
  {
    name: "Spotted Bullhead",
    rarity: "legendary",
    journalEntry: "White spots on a dark body — unmistakable if you're lucky enough to find one. Restricted to a handful of Panhandle drainages.",
  },
  {
    name: "Spotted Gar",
    rarity: "legendary",
    journalEntry: "Covered in dark spots on both body and fins. Restricted to the western Panhandle — a rare find in Florida.",
  },
  {
    name: "Alligator Gar",
    rarity: "legendary",
    journalEntry: "The largest scaled freshwater fish in North America. Near-extirpated from Florida — if you see one, you won't forget it.",
  },
  {
    name: "Snail Bullhead",
    rarity: "legendary",
    journalEntry: "A bottom-dweller of swift, rocky Panhandle streams. Named for its diet of snails — it crushes shells like they're nothing.",
  },
  {
    name: "Blacktail Redhorse",
    rarity: "legendary",
    journalEntry: "A strikingly colored sucker with a vivid red caudal fin trimmed in a bold black band. Found in only a few clean Panhandle river drainages.",
  },
  {
    name: "Longear Sunfish",
    rarity: "legendary",
    journalEntry: "Arguably the most beautiful sunfish in Florida — orange and turquoise, with a dramatically long ear flap.",
  },
  {
    name: "River Redhorse",
    rarity: "legendary",
    journalEntry: "A large sucker with a brilliant red caudal fin and molarlike teeth built for crushing mollusks. Needs clean, gravel-bottomed rivers — increasingly hard to find.",
  },

  // ─── Mythical ─────────────────────────────────────────────────────────────
  {
    name: "Gulf Sturgeon",
    rarity: "mythical",
    journalEntry: "A federally threatened giant that has existed since the age of dinosaurs. It leaps completely out of the water — no one knows why.",
  },
  {
    name: "Atlantic Sturgeon",
    rarity: "mythical",
    journalEntry: "Critically endangered. Once so abundant they fed colonial settlers. Now a ghost of Florida's rivers.",
  },
  {
    name: "Shortnose Sturgeon",
    rarity: "mythical",
    journalEntry: "The smallest of Florida's sturgeons and the most endangered. Rarely documented in Florida waters at all.",
  },
  {
    name: "Okaloosa Darter",
    rarity: "mythical",
    journalEntry: "Federally threatened. Lives in exactly six small streams in Okaloosa and Walton counties — nowhere else on Earth.",
  },
  {
    name: "Goldstripe Darter",
    rarity: "mythical",
    journalEntry: "A Florida endemic with a vivid gold lateral line. Found only in spring-fed headwaters and creeks of the Panhandle.",
  },
  {
    name: "Everglades Pygmy Sunfish",
    rarity: "mythical",
    journalEntry: "Barely an inch long, native only to South Florida. Finding one in the sawgrass is like finding a needle in a haystack.",
  },
  {
    name: "Gulf Coast Pygmy Sunfish",
    rarity: "mythical",
    journalEntry: "A 2009 species discovery — science only officially named it recently. Tiny, secretive, and almost entirely overlooked.",
  },
  {
    name: "Okefenokee Pygmy Sunfish",
    rarity: "mythical",
    journalEntry: "A tiny jewel of blackwater swamps. Named for the Okefenokee — ancient, dark, and barely touched by time.",
  },
  {
    name: "Southern Brook Lamprey",
    rarity: "mythical",
    journalEntry: "A jawless fish older than dinosaurs. Non-parasitic as an adult — it doesn't even eat. It exists only to spawn and disappear.",
  },
  {
    name: "Banded Pygmy Sunfish",
    rarity: "mythical",
    journalEntry: "Seven to twelve black bars on a tiny brown body. Haunts the tannic backwaters of Panhandle streams where few anglers ever look.",
  },

  // ─── The One That Got Away ─────────────────────────────────────────────────
  { name: "livia fish",  rarity: "the one that got away", length: 170, weight: "how rude to ask", journalEntry: "" },
  { name: "axel fish",   rarity: "the one that got away", length: 177, weight: "how rude to ask", journalEntry: "" },
  { name: "marcus fish", rarity: "the one that got away", length: 180, weight: "how rude to ask", journalEntry: "" },
  { name: "jake fish",   rarity: "the one that got away", length: 187, weight: "how rude to ask", journalEntry: "" },
  { name: "josh fish",   rarity: "the one that got away", length: 180, weight: "how rude to ask", journalEntry: "" },
];