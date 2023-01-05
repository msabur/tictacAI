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

function computerMove(board) {
    let bestMove = [-1, -1];
    let bestValue = -Infinity;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] != "") {
                continue;
            }
            board[i][j] = COMPUTER;
            let value = minimax(board, HUMAN);
            if (value > bestValue) {
                bestMove = [i, j];
                bestValue = value;
            }
            board[i][j] = "";
        }
    }

    return bestMove;
}

function makeMove(row, col, player) {
    state.board[row][col] = player;
    var cellId = "cell" + (row * 3 + col);
    document.getElementById(cellId).innerHTML = player;
}

function setWinner(winner) {
    state.score[winner]++;
    document.getElementById("score-you").innerHTML = state.score.X;
    document.getElementById("score-computer").innerHTML = state.score.O;
    document.getElementById("outcome").innerHTML = winOutcomes[winner];
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
    document.getElementById("outcome").innerHTML = "";
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
