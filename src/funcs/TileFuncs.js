/**
 * Populates the selected tile id into the target tile matrix
 *
 * @param tileMatrix {number[][]}
 * @param startX {number}
 * @param startY {number}
 * @param width {number}
 * @param height {number}
 * @param tileIdGetter {function(x: number, y: number): number}
 */
export function fillTiles(tileMatrix, startX, startY, width, height, tileIdGetter) {
    for (let y = startY; y < width + startY; y++) {
        if(tileMatrix[y] === undefined || tileMatrix[y] === null) {
            tileMatrix[y] = [];
        }
        for (let x = startX; x < height + startX; x++) {
            tileMatrix[y][x] = tileIdGetter(x, y);
        }
    }
}