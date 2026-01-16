
/***********************************************************************
 ************************** DECK CLASS *********************************
 ***********************************************************************/
class Deck {
    constructor() {
        this.suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        this.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.cards = [];

        this.initializeDeck();
        this.shuffle();
    }

    initializeDeck() {
        this.cards = [];
        for (const suit of this.suits) {
            for (const rank of this.ranks) {
                this.cards.push({ suit, rank });
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    dealCard() {
        if (this.cards.length === 0) {
            this.initializeDeck();
            this.shuffle();
        }
        return this.cards.pop();
    }
}


/***********************************************************************
 ************************** PLAYER CLASS *******************************
 ***********************************************************************/
class Player {
    constructor(deck) {
        this.deck = deck;
        this.hand = [];

        this.bet = 0;
        this.balance = 10000;
        this.total_money_used = this.balance;
    }

    drawCard() {
        const card = this.deck.dealCard();
        this.hand.push(card);
        return card;
    }

    resetHand() {
        this.hand = [];
    }

    placeBet(amount) {
        if (amount > this.balance) {
            throw new Error("Insufficient balance to place bet.");
        }
        this.bet = amount;
        this.balance -= amount;
    }

    winBet(multiplier = 2) {
        const winnings = this.bet * multiplier;
        this.balance += winnings;
        this.bet = 0;
    }

    pushBet() {
        this.balance += this.bet;
        this.bet = 0;
    }

    loseBet() {
        this.bet = 0;
    }

    getHandValue() {
        let value = 0;
        let aceCount = 0;

        for (const card of this.hand) {
            if (card.rank === 'A') {
                aceCount += 1;
                value += 11;
            } else if (['K', 'Q', 'J'].includes(card.rank)) {
                value += 10;
            } else {
                value += parseInt(card.rank);
            }
        }

        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount -= 1;
        }

        return value;
    }

    isBusted() {
        return this.getHandValue() > 21;
    }

    hasWonAgainst(dealer) {
        const playerValue = this.getHandValue();
        const dealerValue = dealer.getHandValue();

        if (this.isBusted()) {
            return false;
        }
        if (dealer.isBusted()) {
            return true;
        }
        return playerValue > dealerValue;
    }

    hasTiedWith(dealer) {
        return this.getHandValue() === dealer.getHandValue();
    }
}


/***********************************************************************
 ************************** TABLE CLASS ********************************
 ***********************************************************************/
class Table {
    constructor() {
        this.dealer = new Player();
        this.player = new Player();
        this.deck = new Deck();
    }

    reset() {
        this.deck = new Deck();
        this.dealer.resetHand();
        this.player.resetHand();
    }
}


/**
 * 30 FSP canvas rendering
 */
setInterval(() => {
    const canv = document.getElementById("table-canvas");
    const ctx = canv.getContext("2d");
    ctx.fillStyle = "darkgreen";
    ctx.fillRect(0, 0, canv.width, canv.height);
}, 1000 / 30);
