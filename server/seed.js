const { MongoClient } = require('mongodb');

const url = 'mongodb://database:27017';
const client = new MongoClient(url);
const dbName = 'myapp';

async function fish() {
  try {
    await client.connect();
    const db = client.db(dbName);

    await db.collection('fish').drop().catch(() => {});
    await db.collection('users').drop().catch(() => {});
    await db.collection('players').drop().catch(() => {});

    // fish catalog
    await db.collection('fish').insertMany([
      { name: 'Beer Can',              image: 'beercan.png',              count: 0,   rarity: 50, pool: 'flowing freshwater' },
      { name: 'Nile Tilapia',          image: 'niletilapia.png',          count: 3,   rarity: 45, pool: 'flowing freshwater' },
      { name: 'Mozambique Tilapia',    image: 'mozambiquetilapia.png',    count: 9,   rarity: 30, pool: 'flowing freshwater' },
      { name: 'Blue Tilapia',          image: 'bluetilapia.png',          count: 21,  rarity: 15, pool: 'flowing freshwater' },
      { name: 'Blackbanded Darter',    image: 'blackbandeddarter.png',    count: 42,  rarity: 8,  pool: 'flowing freshwater' },
      { name: 'Saddleback Darter',     image: 'saddlebackdarter.png',     count: 86,  rarity: 4,  pool: 'flowing freshwater' },
      { name: 'Midas Cichlid',         image: 'midascichlid.png',         count: 121, rarity: 1,  pool: 'flowing freshwater' },

      { name: 'Old Tire',              image: 'oldtire.png',              count: 0,   rarity: 50, pool: 'non-flowing freshwater' },
      { name: 'Chanchita',             image: 'chanchita.png',            count: 2,   rarity: 45, pool: 'non-flowing freshwater' },
      { name: 'Bowfin',                image: 'bowfin.png',               count: 7,   rarity: 30, pool: 'non-flowing freshwater' },
      { name: 'Goldline Snakehead',    image: 'goldlinesnakehead.png',    count: 19,  rarity: 15, pool: 'non-flowing freshwater' },
      { name: 'Redhead Cichlid',       image: 'redheadcichlid.png',       count: 37,  rarity: 8,  pool: 'non-flowing freshwater' },
      { name: 'Fat Sleeper',           image: 'fatsleeper.png',           count: 76,  rarity: 4,  pool: 'non-flowing freshwater' },
      { name: 'Croaking Gourami',      image: 'croakinggourami.png',      count: 112, rarity: 1,  pool: 'non-flowing freshwater' },

      { name: 'Water Bottle',          image: 'waterbottle.png',          count: 0,   rarity: 50, pool: 'coastal' },
      { name: 'Hogchoker',             image: 'hogchoker.png',            count: 5,   rarity: 45, pool: 'coastal' },
      { name: 'Southern Flounder',     image: 'southernflounder.png',     count: 11,  rarity: 30, pool: 'coastal' },
      { name: 'Clown Goby',            image: 'clowngoby.png',            count: 31,  rarity: 15, pool: 'coastal' },
      { name: 'Red Drum',              image: 'reddrum.png',              count: 49,  rarity: 8,  pool: 'coastal' },
      { name: 'Atlantic Croaker',      image: 'atlanticcroaker.png',      count: 92,  rarity: 4,  pool: 'coastal' },
      { name: 'Silver Perch',          image: 'silverperch.png',          count: 134, rarity: 1,  pool: 'coastal' },
    ]);

    // dummy users
    const users = await db.collection('users').insertMany([
      { username: 'KnightSlayer424', email: 'jamesdock@test.com', password: 'hashed1', emailVerified: true  },
      { username: 'KingDynamo', email: 'alex@test.com', password: 'hashed2', emailVerified: true  },
      { username: 'LostChild42',  email: 'sam@test.com',  password: 'hashed3', emailVerified: false },
    ]);

    const ids = Object.values(users.insertedIds);

    // players linked to users
    await db.collection('players').insertMany([
      {
        userId: ids[0],
        totalFishCount: 277,
        fishCaught: { 'Nile Tilapia': 10, 'Bowfin': 4, 'Red Drum': 2, 'Midas Cichlid': 1 }
      },
      {
        userId: ids[1],
        totalFishCount: 105,
        fishCaught: { 'Hogchoker': 5, 'Chanchita': 2, 'Fat Sleeper': 1 }
      },
      {
        userId: ids[2],
        totalFishCount: 0,
        fishCaught: {}
      },
    ]);

    console.log('Seeded successfully!');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await client.close();
  }
}

fish();