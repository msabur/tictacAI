// you are X and computer is O
const HUMAN = "X";
const COMPUTER = "O";

let state = {
    board: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ],
    turn: HUMAN,
    score: {
        [HUMAN]: 0,
        [COMPUTER]: 0
    },
    winner: null
};

let difficulty = localStorage.getItem("difficulty") || "medium";

let winOutcomes = {
    [HUMAN]: "You won",
    [COMPUTER]: "Computer won",
    draw: "Draw"
}

function clicked(cellId) {
    // cellId is in format like "cell8"
    var index = parseInt(cellId.substring(4));
    var row = Math.floor(index / 3);
    var col = index % 3;

    if (state.winner == null && state.board[row][col] === "") {
        makeMove(row, col, "X");
        state.winner = checkWinner(state.board);
        if (state.winner != null) {
            setWinner(state.winner)
        } else {
            [row, col] = computerMove(cloneBoard(state.board));
            makeMove(row, col, "O");
            state.winner = checkWinner(state.board);
            if (state.winner != null) {
                setWinner(state.winner)
            }
            updateAnalysis();
        }
    }
}

function minimax(board, player) {
    let winnerValue = { [HUMAN]: -1, [COMPUTER]: 1, draw: 0 };

    // minimax algorithm
    // will return evaluation of board

    let winner = checkWinner(board);
    if (winner) {
        return winnerValue[winner];
    }

    if (player == COMPUTER) {
        let value = -Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] != "") {
                    continue;
                }
                board[i][j] = COMPUTER;
                value = Math.max(value, minimax(board, HUMAN));
                board[i][j] = "";
            }
        }
        return value;
    } else {
        let value = Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] != "") {
                    continue;
                }
                board[i][j] = HUMAN;
                value = Math.min(value, minimax(board, COMPUTER));
                board[i][j] = "";
            }
        }
        return value;
    }
}

function randomMove(board) {
    let empty = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === "") {
                empty.push([i, j]);
            }
        }
    }
    return empty[Math.floor(Math.random() * empty.length)];
}

function bestMove(board) {
    let bestMoves = [];
    let bestValue = -Infinity;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] != "") {
                continue;
            }
            board[i][j] = COMPUTER;
            let value = minimax(board, HUMAN);
            if (value > bestValue) {
                bestMoves = [[i, j]];
                bestValue = value;
            } else if (value == bestValue) {
                bestMoves.push([i, j]);
            }
            board[i][j] = "";
        }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function computerMove(board) {
    if (difficulty === "easy") {
        return randomMove(board);
    }
    if (difficulty === "medium") {
        if (Math.random() < 0.5) {
            return randomMove(board);
        }
    }
    return bestMove(board);
}

function makeMove(row, col, player) {
    state.board[row][col] = player;
    var cellId = "cell" + (row * 3 + col);
    document.getElementById(cellId).innerHTML = player;
}

function showOverlay(text) {
    document.getElementById("boardOverlayText").innerHTML = text;
    document.getElementById("boardOverlay").classList.add("show");
}

function hideOverlay() {
    document.getElementById("boardOverlay").classList.remove("show");
}

function getWinningLine(board) {
    var patterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (var i = 0; i < patterns.length; i++) {
        var p = patterns[i];
        var ra = Math.floor(p[0] / 3), ca = p[0] % 3;
        var rb = Math.floor(p[1] / 3), cb = p[1] % 3;
        var rc = Math.floor(p[2] / 3), cc = p[2] % 3;
        if (
            board[ra][ca] !== "" &&
            board[ra][ca] === board[rb][cb] &&
            board[rb][cb] === board[rc][cc]
        ) {
            return p;
        }
    }
    return null;
}

function drawWinLine(indices) {
    if (!indices) return;
    var svg = document.getElementById("winLine");
    var board = document.getElementById("board");
    var boardRect = board.getBoundingClientRect();

    svg.setAttribute("viewBox", "0 0 " + boardRect.width + " " + boardRect.height);

    var cells = indices.map(function (idx) {
        return document.getElementById("cell" + idx).getBoundingClientRect();
    });

    var x1 = cells[0].left + cells[0].width / 2 - boardRect.left;
    var y1 = cells[0].top + cells[0].height / 2 - boardRect.top;
    var x2 = cells[2].left + cells[2].width / 2 - boardRect.left;
    var y2 = cells[2].top + cells[2].height / 2 - boardRect.top;

    var line = svg.querySelector("line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    svg.classList.add("show");
}

function clearWinLine() {
    document.getElementById("winLine").classList.remove("show");
}

function setWinner(winner) {
    state.score[winner]++;
    document.getElementById("score-you").innerHTML = state.score.X;
    document.getElementById("score-computer").innerHTML = state.score.O;
    var line = getWinningLine(state.board);
    drawWinLine(line);
    showOverlay(winOutcomes[winner]);
}

function checkWinner(board) {
    let winningCombinations = [
        [board[0][0], board[0][1], board[0][2]],
        [board[1][0], board[1][1], board[1][2]],
        [board[2][0], board[2][1], board[2][2]],
        [board[0][0], board[1][0], board[2][0]],
        [board[0][1], board[1][1], board[2][1]],
        [board[0][2], board[1][2], board[2][2]],
        [board[0][0], board[1][1], board[2][2]],
        [board[2][0], board[1][1], board[0][2]]
    ];
    for (var i = 0; i < winningCombinations.length; i++) {
        var combination = winningCombinations[i];
        if (
            combination[0] !== "" &&
            combination[0] === combination[1] &&
            combination[1] === combination[2]
        ) {
            return combination[0];
        }
    }
    // check for draw
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j] === "") {
                return null;
            }
        }
    }
    return "draw";
}

function cloneBoard(board) {
    var newBoard = [];
    for (var i = 0; i < board.length; i++) {
        newBoard.push(board[i].slice());
    }
    return newBoard;
}

var analysis = "off";

function setAnalysis(value) {
    analysis = value;
    var options = document.querySelectorAll(".analysis-option");
    for (var i = 0; i < options.length; i++) {
        var opt = options[i];
        if (opt.getAttribute("data-value") === value) {
            opt.classList.add("active");
        } else {
            opt.classList.remove("active");
        }
    }
    positionSlider(document.getElementById("analysisSwitch"));
    if (value === "on" && state.winner == null) {
        updateAnalysis();
    } else {
        clearAnalysis();
    }
}

function clearAnalysis() {
    document.getElementById("analysisInfo").innerHTML = "";
    document.getElementById("analysisInfo").className = "analysis-info";
    for (var i = 0; i < 9; i++) {
        document.getElementById("cell" + i).classList.remove("analysis-bad");
    }
}

function updateAnalysis() {
    if (analysis !== "on" || state.winner != null) {
        clearAnalysis();
        return;
    }

    var info = document.getElementById("analysisInfo");
    var board = state.board;

    var evalValue = minimax(cloneBoard(board), HUMAN);
    var evalText, evalClass;
    if (evalValue === -1) {
        evalText = "Winning position — you can force a win!";
        evalClass = "good";
    } else if (evalValue === 0) {
        evalText = "Even position — optimal play leads to a draw.";
        evalClass = "neutral";
    } else {
        evalText = "Losing position — computer will win with optimal play.";
        evalClass = "bad";
    }
    info.innerHTML = evalText;
    info.className = "analysis-info " + evalClass;

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var cellEl = document.getElementById("cell" + (i * 3 + j));
            cellEl.classList.remove("analysis-bad");
            if (board[i][j] !== "") continue;

            if (isLosingMove(board, i, j)) {
                cellEl.classList.add("analysis-bad");
            }
        }
    }
}

function isLosingMove(board, row, col) {
    var sim = cloneBoard(board);
    sim[row][col] = HUMAN;

    if (checkWinner(sim) === HUMAN) return false;

    return minimax(sim, COMPUTER) === 1;
}

function newGame() {
    state.board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ];
    state.turn = HUMAN;
    state.winner = null;
    for (var i = 0; i < 9; i++) {
        document.getElementById("cell" + i).innerHTML = "";
    }
    hideOverlay();
    clearWinLine();
    clearAnalysis();
    if (analysis === "on") {
        updateAnalysis();
    }
}

function reset() {
    newGame();
    state.score = {
        [HUMAN]: 0,
        [COMPUTER]: 0
    };
    document.getElementById("score-you").innerHTML = state.score.X;
    document.getElementById("score-computer").innerHTML = state.score.O;
}

function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function positionSlider(container) {
    var slider = container.querySelector(".pill-slider");
    var active = container.querySelector(".active");
    if (!slider || !active) return;
    var cr = container.getBoundingClientRect();
    var ar = active.getBoundingClientRect();
    slider.style.width = ar.width + "px";
    slider.style.transform = "translateX(" + (ar.left - cr.left - 4) + "px)";
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var options = document.querySelectorAll(".theme-switch .theme-option");
    for (var i = 0; i < options.length; i++) {
        var opt = options[i];
        if (opt.getAttribute("data-value") === theme) {
            opt.classList.add("active");
        } else {
            opt.classList.remove("active");
        }
    }
    positionSlider(document.getElementById("themeSwitch"));
}

function setTheme(mode) {
    localStorage.setItem("theme", mode);
    if (mode === "auto") {
        applyTheme(getSystemTheme());
        var options = document.querySelectorAll(".theme-switch .theme-option");
        for (var i = 0; i < options.length; i++) {
            var opt = options[i];
            if (opt.getAttribute("data-value") === "auto") {
                opt.classList.add("active");
            } else {
                opt.classList.remove("active");
            }
        }
        positionSlider(document.getElementById("themeSwitch"));
    } else {
        applyTheme(mode);
    }
}

function setDifficulty(value) {
    difficulty = value;
    localStorage.setItem("difficulty", value);
    var options = document.querySelectorAll(".difficulty-option");
    for (var i = 0; i < options.length; i++) {
        var opt = options[i];
        if (opt.getAttribute("data-value") === value) {
            opt.classList.add("active");
        } else {
            opt.classList.remove("active");
        }
    }
    positionSlider(document.getElementById("difficultySwitch"));
    newGame();
}

var savedTheme = localStorage.getItem("theme") || "auto";
setTheme(savedTheme);

setDifficulty(difficulty);

positionSlider(document.getElementById("analysisSwitch"));

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    var current = localStorage.getItem("theme") || "auto";
    if (current === "auto") {
        applyTheme(getSystemTheme());
    }
});
