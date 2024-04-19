@echo off

rem Start MongoDB shell
mongo <<EOF

use myRaffleDb

db.createCollection("raffles")
db.createCollection("draws")
db.createCollection("luckyNumbers")
db.createCollection("profile")

db.profile.insertOne({
  "_id": ObjectId("66208594a8c89804cc046e24"),
  "Username": "Sally656",
  "Email": "sally.mn1245@gmail.com",
  "Password": "gtrcvbdAePs441",
  "AccountType": "Raffle Participant"
})

db.profile.insertOne({
  "_id": ObjectId("6620a265b56fb92d60d7e18e"),
  "Username": "Martin3",
  "Email": "sally.mn1245@gmail.com",
  "Password": "uiOknedw3I62241",
  "AccountType": "Raffle Holder"
})

db.raffles.insertOne({
  "_id": ObjectId("66225d7670a8df1bf8f74cb6"),
  "name": "MRaffle",
  "prize": "1050",
  "drawDate": new Date("2024-04-25T00:00:00.000Z"),
  "user": "Martin3"
})

db.raffles.insertOne({
  "_id": ObjectId("662267abcec19b884987d123"),
  "name": "TestRaffle",
  "prize": "20000",
  "drawDate": new Date("2024-04-24T00:00:00.000Z"),
  "user": "Martin3"
})

db.draws.insertOne({
  "_id": ObjectId("6622606421ffb42f38c047da"),
  "raffle": {
    "name": "MRaffle",
    "prize": "1050£",
    "drawDate": new Date("2024-04-24T23:00:00.000Z")
  },
  "participants": [
    {
      "username": "liliya1122@abv.bg",
      "ticket": "616533"
    },
    {
      "username": "sally1122@abv.bg",
      "ticket": "666777"
    }
  ],
  "winner": 0,
  "date": new Date("2024-10-25T00:00:00.000Z")
})

EOF
