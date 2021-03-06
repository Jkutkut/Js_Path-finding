/**
 * Class with all the logic used on the mazeGenerators
 */
class MazePrototype {
    static COLORS = {
        cWhite: [240],
        cBlack: [0, 0, 0],
        cBlue: [0, 255, 255],
        cYellow: [255, 255, 0],
        cGandY: [200, 255, 0],
        cGrey: [161, 161, 161],
        cRed: [255, 0, 0]
    }

    constructor(canvasWidth, canvasHeight, cellWidth, cellHeight=cellWidth) {
        
        this.size = { // All properties of the size of the maze is stored here
            width: canvasWidth,
            height: canvasHeight,
            w: cellWidth,
            h: cellHeight
        };

        this.rows = Math.floor(canvasWidth / cellWidth);
        if (this.rows % 2 == 0) this.rows--;
        
        this.cols = Math.floor(canvasHeight / cellHeight);
        if (this.cols % 2 == 0) this.cols--;


        this.grid;
        this.initGrid(); // create grid (different for each maze generator)

        for(let i = 0; i < this.rows; i++){ // Tell each spot their neighbors
            for(let j = 0; j < this.cols; j++){
                this.grid[i][j].addNeighbors(this);
            }
        }

        
        // A* variables
        this.start = this.grid[1][0]; // starting cell
        this.current;
        this.end = this.grid[this.rows - 2][this.cols - 1]; // ending cell
        this.start.wall = false; // Make sure those cells are not walls
        this.end.wall = false;

        this.openSet = [];
        this.closedSet = [];
        this.path = [];

        //we start from the begining
        this.openSet.push(this.start);
    }

    /**
     * Create the grid
     * @see This method depends on the class extending this prototype.
     */
    initGrid() {}

    /**
     * Implementation of the A* Algorithm for path finding. The method yield on each step of the algorithm.
     */
    *aStar() {
        while(this.openSet.length > 0) { // if still searching
            //we can order them with "openSet.sort(spotComparison);"
            //but we search only for the best
            let indexBestSpot = 0;
            for(let i = 0; i < this.openSet.length; i++){
                if(this.openSet[i].f < this.openSet[indexBestSpot].f) { // if i better index
                    indexBestSpot = i;
                }
            }
            this.current = this.openSet[indexBestSpot];
            if(this.current === this.end) { // if current is the end => finish
                break;
            }

            this.openSet.splice(indexBestSpot, 1);//remove the best from openSet
            this.closedSet.push(this.current);//add it to the closed

            let neighbors = this.current.neighbors;//get them from current
            for (let i = 0; i < neighbors.length; i++) {
                let neighbor = neighbors[i];

                // Valid next spot?
                if (!this.closedSet.includes(neighbor) && !neighbor.wall) {
                    let tempG = this.current.g + this.heuristics(neighbor, this.current);

                    // Is this a better path than before?
                    let newPath = false;
                    if (this.openSet.includes(neighbor)) {
                        if (tempG < neighbor.g) { // If better way to go to neighbor
                            newPath = true;
                        }
                    } 
                    else { // If new possible way
                        newPath = true;
                        this.openSet.push(neighbor);
                        neighbor.show(Maze.COLORS.cGandY);
                    }

                    if (newPath) { // Yes, it's a better path
                        neighbor.g = tempG;
                        neighbor.h = this.heuristics(neighbor, this.end);
                        neighbor.f = neighbor.g + neighbor.h;
                        neighbor.previous = this.current;
                    }
                }
            }

            // Find the path by working backwards
            this.updatePath();

            yield;
        }
        
        if (this.current === this.end) { // If exit found
            console.log("Done!, there is a way!");
        }
        else { //if no other way to go
            console.log("Ups, there is no way to go to the end");
        }
        this.updatePath();
        noLoop(); // Stop drawing
        onLoop = false;
    }

    /**
     * Updates the path variable using backtracking
     */
    updatePath() {
        this.path = [];
        let temp = this.current;
        this.path.push(temp);
        while (temp.previous) {
            this.path.push(temp.previous);
            temp = temp.previous;
        }
    }

    /**
     * Prints on console the current path
     */
    printPath() {
        // Show the way
        for(let p = this.path.length - 1, q = 1; p > 0; p--, q++){
            console.log(q + "º (" + this.path[p].i + ", " + this.path[p].j +")");
        }
    }

    /**
     * @param {Spot} a - One Spot
     * @param {Spot} b - The other Spot
     * @returns The distance (heuristics) from a to b.
     */
    heuristics(a, b) {
        return dist(a.i, a.j, b.i, b.j);
    }
}

/**
 * This class generates a maze usign Prim's algorithm.
 * @see mazeGenerators.js to see the logic used.
 */
class Maze extends MazePrototype {
    constructor(canvasWidth, canvasHeight, cellWidth, cellHeight=cellWidth) {
        super(canvasWidth, canvasHeight, cellWidth, cellHeight);
    }

    initGrid() {
        this.grid = primMaze(this.rows, this.cols);
    }
}

/**
 * Generates a maze with walls generated at random
 */
class RandomMaze extends MazePrototype {
    constructor(canvasWidth, canvasHeight, cellWidth, cellHeight=cellWidth) {
        super(canvasWidth, canvasHeight, cellWidth, cellHeight);
    }

    initGrid() {
        this.grid = new Array(this.rows);
        for(let i = 0; i < this.rows; i++) {
            this.grid[i] = new Array(this.cols);
            for(let j = 0; j < this.cols; j++){
                this.grid[i][j] = new Spot(i, j);
            }
        }
    }
}