# Farmer Edith

Solo companion for **Three Sisters**. You keep the paper scoresheets. This app rolls the four dice, places them on the rondel, drafts Farmer Edith, and tells you what she crosses off.

## Play without installing

The app is already running in the Grok preview. Press **Start a season**, then **Roll four dice** each round.

## Run it on your computer

You need [Node.js 22](https://nodejs.org/).

```bash
git clone https://github.com/thirdender/farmer-edith.git
cd farmer-edith
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

## How a round works

1. Four dice group by value. The lowest group lands on Edith's pawn, then the rest sit clockwise. She steps to the space after the highest group.
2. Odd rounds you pick first. Even rounds she picks first. You each take two dice.
3. Her first die is the gold-pin Apiary space, or the next die clockwise if that space is empty.
4. The first player's second die is the lowest die still on the board. The last die goes to the other player.
5. She gardens first (tallest pumpkin, then a corn you choose, then a bean you choose), then takes the rondel action. She skips the round event.

**Notes** in the corner lists her shed, apiary, yard, and perennial maps. **Undo** steps back one choice.
