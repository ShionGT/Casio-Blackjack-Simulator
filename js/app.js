class Table {
    constructor() {
        this.player = new Player();
        this.dealer = new Dealer();
        this.deck = new Deck();

        function draw() {
            canv = document.getElementById("table-canvas");
            ctx = canv.getContext("2d");
            ctx.fillStyle = "darkgreen";
            ctx.fillRect(0, 0, canv.width, canv.height);
        }

        draw();
    }



}
