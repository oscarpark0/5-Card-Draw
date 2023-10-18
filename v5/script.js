const drawCardBtn = document.getElementById("draw-card");
const shuffleDeckBtn = document.getElementById("shuffle-deck"); // Define shuffleDeckBtn here
const cardContainer = document.getElementById("card-container");
const deckCountInput = document.getElementById("deck-count");
const deckCountLabel = document.getElementById("deck-count-label");
const scoreboard = {
  "Royal Flush": 0,
  "Straight Flush": 0,
  "Four of a Kind": 0,
  "Full House": 0,
  "Flush": 0,
  "Straight": 0,
  "Three of a Kind": 0,
  "Two Pair": 0,
  "One Pair": 0,
  "High Card": 0,
  "Total Cards Drawn": 0
};


let deckId = "";

async function getDeckId() {
  const deckCount = document.getElementById("deck-count").value;
  const response = await fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${deckCount}`);
  const data = await response.json();
  deckId = data.deck_id;
  document.getElementById("remaining-cards").innerText = `Remaining cards in Deck: ${data.remaining}`;
}

async function drawCard(numCards) {
  const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${numCards}`);
  const data = await response.json();
  document.getElementById("remaining-cards").innerText = `Remaining cards in Deck: ${data.remaining}`;

  // Check if there are less than 5 cards remaining
  if (data.remaining < 5) {
    await shuffleDeck();
  }

  return data.cards;
}

async function shuffleDeck() {
  const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`);
  const data = await response.json();
  document.getElementById("remaining-cards").innerText = `Remaining cards in: ${data.remaining}`;
}

shuffleDeckBtn.addEventListener("click", async () => {
  // Shuffle the deck
  await shuffleDeck();

  // Clear existing cards
  cardContainer.innerHTML = "";
});

function addCardToHistory(card, index) {
  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");
  const img = document.createElement("img");
  img.src = "https://deckofcardsapi.com/static/img/back.png"; // Initially set to back of card
  cardDiv.appendChild(img);

  // Create a placeholder for the card
  const placeholder = document.createElement("div");
  placeholder.style.display = 'inline-block';
  placeholder.style.width = '100px'; // Set to the width of a card
  placeholder.appendChild(cardDiv);
  cardContainer.appendChild(placeholder);

  // Add explosion class to the card
  cardDiv.classList.add("explosion");

  // Randomize position
  cardDiv.style.position = 'absolute';
  cardDiv.style.left = placeholder.offsetLeft + 'px'; // Use the placeholder's position
  cardDiv.style.top = placeholder.offsetTop + 'px'; // Use the placeholder's position

  // Randomize rotation
  cardDiv.style.transform = 'rotate(' + Math.random() + 'deg)';

  // After a delay, change to front of card and remove explosion class after animation
  setTimeout(() => {
    img.src = card.image; // Change to front of card
    cardDiv.classList.remove("explosion");
    cardDiv.style.position = 'static';
    cardDiv.style.transform = 'none';
  }, 500 + index * 50); // Add delay based on card index
}

function analyzeHand(cards) {
  // Sort cards by value
  cards.sort((a, b) => a.value - b.value);

  // Count occurrences of each value
  let counts = {};
  let suits = {};
  for (let card of cards) {
    if (counts[card.value]) {
      counts[card.value]++;
    } else {
      counts[card.value] = 1;
    }

    if (suits[card.suit]) {
      suits[card.suit]++;
    } else {
      suits[card.suit] = 1;
    }
  }

  // Determine hand type
  let pairs = 0;
  let threeOfAKind = false;
  let fourOfAKind = false;
  for (let count in counts) {
    if (counts[count] == 2) {
      pairs++;
    } else if (counts[count] == 3) {
      threeOfAKind = true;
    } else if (counts[count] == 4) {
      fourOfAKind = true;
    }
  }

  let flush = false;
  for (let suit in suits) {
    if (suits[suit] == 5) {
      flush = true;
    }
  }

  let straight = false;
  let values = Object.keys(counts).map(v => parseInt(v));
  values.sort((a, b) => a - b);
  if (values.length == 5 && values[4] - values[0] == 4) {
    straight = true;
  }

  if (flush && straight && values[4] == 14) {
    scoreboard["Royal Flush"]++;
    return "Royal Flush";
  } else if (flush && straight) {
    scoreboard["Straight Flush"]++;
    return "Straight Flush";
  } else if (fourOfAKind) {
    scoreboard["Four of a Kind"]++;
    return "Four of a Kind";
  } else if (threeOfAKind && pairs == 1) {
    scoreboard["Full House"]++;
    return "Full House";
  } else if (flush) {
    scoreboard["Flush"]++;
    return "Flush";
  } else if (straight) {
    scoreboard["Straight"]++;
    return "Straight";
  } else if (threeOfAKind) {
    scoreboard["Three of a Kind"]++;
    return "Three of a Kind";
  } else if (pairs == 2) {
    scoreboard["Two Pair"]++;
    return "Two Pair";
  } else if (pairs == 1) {
    scoreboard["One Pair"]++;
    return "One Pair";
  } else {
    scoreboard["High Card"]++;
    return "High Card";
    
  }
}

drawCardBtn.addEventListener("click", async () => {
  // If deckId is not set, get a new deck id
  if (!deckId) {
    await getDeckId();
    // Show the "Shuffle Deck" button
    shuffleDeckBtn.style.display = "block";

    // Hide the deck count input and its label
    deckCountInput.style.display = "none";
    deckCountLabel.style.display = "none";
  }

  // Clear existing cards
  cardContainer.innerHTML = "";

  const numCards = 5; // Set to 5 to always draw 5 cards
  const cards = await drawCard(numCards);
  cards.forEach((card, index) => {
    addCardToHistory(card, index);
  });
  const handResult = analyzeHand(cards);
  document.getElementById("hand-result").innerText = `Hand: ${handResult}`;
});

shuffleDeckBtn.addEventListener("click", async () => {
  // Shuffle the deck
  const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`);
  const data = await response.json();
  document.getElementById("remaining-cards").innerText = `Remaining cards in Deck: ${data.remaining}`;
});