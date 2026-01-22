/***********************************************************************
 ************************** CARD CLASS *********************************
 ***********************************************************************/
class Card {
    constructor(value, x=0.0, y=0.0, width=40, height=60) {
        this.value = value;
        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        // animation keys
        this.goalX = x;
        this.goalY = y;
        this.speed = 2;
        this.needsWait = false;
    }

    getValue() {
        let out = this.value % 13;
        if (out >= 10 || out === 0) { // 13 (K) % 13 = 0
            return 10;
        } else {
            return out;
        }
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    setGoalPosition(x, y) {
        this.goalX = x;
        this.goalY = y;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    moveBy(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    process() {
        const deltaX = this.goalX - this.x;
        const deltaY = this.goalY - this.y;

        if (Math.abs(deltaX) < this.speed / 2 && Math.abs(deltaY) < this.speed / 2) {
            this.needsWait = false;
            return;
        } else {
            this.needsWait = true;
        }

        const angle = Math.atan2(deltaY, deltaX);
        this.moveBy(Math.cos(angle) * this.speed,
                    Math.sin(angle) * this.speed);
    }

    needsWaiting() {
        return this.needsWait;
    }

    draw(ctx) {
        // card and background
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // text
        ctx.fillStyle = "black";
        let fontSize = this.width / 2 + 2;
        ctx.font = `${fontSize}px Arial`;
        // Ace special case
        let val = this.getValue();
        if (val === 1) {
            val = "A";
        }
        ctx.fillText(val, this.x + this.width / 2 - fontSize / 2, this.y +  this.height / 2 + fontSize / 3);
    }
}


/***********************************************************************
 ************************** DECK CLASS *********************************
 ***********************************************************************/
class Deck {
    constructor() {
        this.cards = Array.from({ length: 52 }, (_, index) => new Card(index + 1));
        console.log(this.cards);
    }

    resetCards() {
        this.cards = [];
        this.cards = Array.from({ length: 52 }, (_, index) => new Card(index + 1));
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    dealCard() {
        if (this.cards.length === 0) {
            this.resetCards();
        }
        this.shuffle();
        return this.cards.pop();
    }

}


/***********************************************************************
 ************************** PLAYER CLASS *******************************
 ***********************************************************************/
class Player {
    constructor(deck) {
        this.deck = new Deck();
        this.hand = [];

        this.isStanding = false;

        this.bet = 0;
        this.balance = 10000;
        this.total_money_used = this.balance;

        // for animation purposes
        this.isWait = false;
    }

    // Animation control
    isWaiting() {
        for (const card of this.hand) {
            if (card.needsWaiting()) {
                return true;
            }
        }
        return false;
    }

    // Main logic
    drawCard() {
        const card = this.deck.dealCard();
        this.hand.push(card);
        return card;
    }

    hit() {
        if (!this.isStanding) {
            this.drawCard();
        }
    }

    stand() {
        this.isStanding = true;
    }

    resetHand() {
        this.hand = [];
    }

    // Money management

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

    // Game outcome evaluation

    getHandValue() {
        let value = 0;
        let aceCount = 0;

        for (const card of this.hand) {
            if (card.getValue() === 1) { // Ace
                aceCount += 1;
                value += 11;
            } else {
                value += card.getValue();
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

    // accessors

    getHands() {
        return this.hand;
    }

    getBalance() {
        return this.balance;
    }

    getBet() {
        return this.bet;
    }
}


/***********************************************************************
 ************************** TABLE CLASS ********************************
 ***********************************************************************/
class Table {
    constructor(width=800, height=600) {
        this.dealer = new Player();
        this.player = new Player();
        this.deck = new Deck();

        this.width = width;
        this.height = height;
        this.isGameOver = false;
    }

    reset() {
        this.deck = new Deck();
        this.dealer.resetHand();
        this.player.resetHand();
        this.isGameOver = false;
    }

    // update the game action
    update() {

        if (this.player.isStanding) {
            // dealer's turn
            while (this.dealer.getHandValue() < 17) {
                this.dealer.drawCard();
            }
            if (!this.dealer.isWaiting() && !this.player.isWaiting()) {
                this.isGameOver = true;
            }
        }

        if (this.player.isBusted()) {
            this.player.stand();
        }

        // card sizing
        const cardWidth = this.width / 15;
        const cardHeight = cardWidth * 1.5;
        let dealerY = this.height / 10;
        // draw dealer's cards
        for (let i = 0; i < this.dealer.hand.length; i++) {
            // initialize card
            const card = this.dealer.hand[i];

            // flat numbers
            card.setSize(cardWidth, cardHeight);
            card.setSpeed(this.width / 32); // adjust speed based on canvas size

            card.setGoalPosition(50 + i * (card.getWidth() + 10), dealerY);
            card.process();
        }

        let playerY = this.height / 2;
        // draw player's cards
        for (let i = 0; i < this.player.hand.length; i++) {
            // initialize card
            const card = this.player.hand[i];

            // flat numbers
            card.setSize(cardWidth, cardHeight);
            card.setSpeed(this.width / 30); // adjust speed based on canvas size

            card.setGoalPosition(50 + i * (card.getWidth() + 10), playerY);
            card.process();
        }


        document.getElementById("player-total").innerText = this.player.getHandValue();
        if (this.player.isBusted() || this.player.isStanding) {
            document.getElementById("dealer-total").innerText = this.dealer.getHandValue();
        }

    }

    draw() {
        // Rendering logic would go here
        const canv = document.getElementById("table-canvas");
        const ctx = canv.getContext("2d");

        // variables
        this.width = canv.width;
        this.height = canv.height;

        // background
        ctx.fillStyle = "darkgreen";
        ctx.fillRect(0, 0, this.width, this.height);

        // draw dealer's cards
        for (let i = 0; i < this.dealer.hand.length; i++) {
            const card = this.dealer.hand[i];
            card.draw(ctx);
        }

        // draw player's cards
        for (let i = 0; i < this.player.hand.length; i++) {
            const card = this.player.hand[i];
            card.draw(ctx);
        }

        if (this.isGameOver && !this.player.isWaiting() && !this.dealer.isWaiting()) {
            // display game over message
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            let message = "";
            if (this.player.isBusted()) {
                message = "21点を超えて失格。";
            } else if (this.dealer.isBusted()) {
                message = "相手が21点を超えて失格。勝ち！";
            } else if (this.player.hasWonAgainst(this.dealer)) {
                message = "勝ち！";
            } else if (this.player.hasTiedWith(this.dealer)) {
                message = "Push!";
            } else {
                message = "負け";
            }
            ctx.fillText(message, this.width / 2 - 100, this.height - 25);
        }
    }
}



const table = new Table();
document.getElementById("hit-button").addEventListener("click", () => {
    table.player.hit();
});
document.getElementById("stand-button").addEventListener("click", () => {
    table.player.stand();
});

// Main loop
setInterval(() => {
    // update the table
    table.update();
    // render the table
    table.draw();
}, 1000 / 30); // 30FPS
