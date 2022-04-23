const boardSize = 10;
const gameBoard = document.getElementById("gameBoard")
const colors = ["red", "orange", "yellow", "green", "blue", "cyan", "magenta"];

let falling , selected, neighbors = [];

gameBoard.innerHTML = `<tr> ${'<td></td>'.repeat(boardSize)} </tr>`.repeat(boardSize)

gameBoard.onclick = e => {
     if (falling || e.target == e.currentTarget) return

     const target = e.target.closest('td');
     selected?.classList.remove('selected')
     neighbors.forEach(cell => cell.classList.remove('neighbor'))

     if (neighbors.includes(target)) {
          switchPlaces(target)

          selected = null
          neighbors.length = 0;
          return;
     }

     neighbors.length = 0;

     if (selected == target) {
          selected = null;
          return;
     }

     selected = target
     selected.classList.add('selected')

     const x = selected.cellIndex
     const y = selected.parentElement.rowIndex
     gameBoard.rows[y - 1]?.cells[x].classList.add('neighbor')
     gameBoard.rows[y + 1]?.cells[x].classList.add('neighbor')
     gameBoard.rows[y].cells[x - 1]?.classList.add('neighbor')
     gameBoard.rows[y].cells[x + 1]?.classList.add('neighbor')
     neighbors.push(...gameBoard.querySelectorAll('.neighbor'))
}

for (let y = 0; y < boardSize; y++) {
     for (let x = 0; x < boardSize; x++) {
          gameBoard.rows[y].cells[x].append(makeStone())
     }
}

checkGroups()

function rnd(limit) {
     return Math.floor(Math.random() * limit)
}

function findSameColored(coords, found = []) {
     const [y, x] = coords.split(",")
     const sameColored = [];
     const color = gameBoard.rows[y].cells[x].children[0].className;
     let nextColor = gameBoard.rows[y].cells[+x + 1]?.children[0].className;
     if (color == nextColor) {
          const coords = `${y},${+x + 1}`;
          if (!found.includes(coords)) {
               sameColored.push(coords)
          }
     }
     nextColor = gameBoard.rows[y].cells[x - 1]?.children[0].className;
     if (color == nextColor) {
          const coords = `${y},${x - 1}`;
          if (!found.includes(coords)) {
               sameColored.push(coords)
          }
     }
     nextColor = gameBoard.rows[+y + 1]?.cells[x].children[0].className;
     if (color == nextColor) {
          const coords = `${+y + 1},${x}`;
          if (!found.includes(coords)) {
               sameColored.push(coords)
          }
     }
     nextColor = gameBoard.rows[y - 1]?.cells[x].children[0].className;
     if (color == nextColor) {
          const coords = `${y - 1},${x}`;
          if (!found.includes(coords)) {
               sameColored.push(coords)
          }
     }
     return sameColored;

}

function findContinious(coords) {
     const found = [coords]
     const unchecked = [coords];
     const checked = [];
     do {
          const coords = unchecked.shift();
          const cells = findSameColored(coords, found)
          checked.push(coords);

          for (const cell of cells) {
               if (!found.includes(cell)) {
                    found.push(cell);
               }
               if (!unchecked.includes(cell)) {
                    unchecked.push(cell)
               }
          }

     } while (unchecked.length)

     filterCells(found);
     return found
}

function filterCells(cells) {
     for (let i = cells.length - 1; i >= 0; i--) {
          const [y, x] = cells[i].split(",");
          if (cells.includes(`${y - 1},${x}`) && cells.includes(`${+y + 1},${x}`)) continue

     }
}

function findGroups() {
     const groups = [];
     for (let y = 0; y < boardSize; y++) {
          for (let x = 0; x < boardSize; x++) {
               const coords = y + ',' + x;
               if (!groups.flat().includes(coords)) {
                    groups.push(findContinious(coords))
               }
          }
     }
     return groups.map(cleanUp).filter(group => group.length > 2);
}

function cleanUp(group) {
     const cleanGroup = [];
     for (const coords of group) {
          const [y, x] = coords.split(",");
          if (group.includes(`${y - 1},${x}`) && group.includes(`${y - 2},${x}`)) {
               cleanGroup.push(coords);
               continue;
          }
          if (group.includes(`${y - 1},${x}`) && group.includes(`${+y + 1},${x}`)) {
               cleanGroup.push(coords);
               continue;
          }
          if (group.includes(`${+y + 1},${x}`) && group.includes(`${+y + 2},${x}`)) {
               cleanGroup.push(coords);
               continue;
          }
          if (group.includes(`${y},${x - 1}`) && group.includes(`${y},${x - 2}`)) {
               cleanGroup.push(coords);
               continue;
          }
          if (group.includes(`${y},${x - 1}`) && group.includes(`${y},${+x + 1}`)) {
               cleanGroup.push(coords);
               continue;
          }
          if (group.includes(`${y},${+x + 1}`) && group.includes(`${y},${+x + 2}`)) {
               cleanGroup.push(coords);
               continue;
          }
          if (group.includes(`${y},${x - 1}`) && group.includes(`${y - 1},${x}`) && group.includes(`${y - 1},${x - 1}`)) {
               cleanGroup.push(coords);
               continue;
          }
          if (group.includes(`${y},${x - 1}`) && group.includes(`${+y + 1},${x}`) && group.includes(`${+y + 1},${x - 1}`)) {
               cleanGroup.push(coords);
               continue;
          }
          if (group.includes(`${y},${+x + 1}`) && group.includes(`${+y + 1},${x}`) && group.includes(`${+y + 1},${+x + 1}`)) {
               cleanGroup.push(coords);
               continue;
          }
          if (group.includes(`${y},${+x + 1}`) && group.includes(`${y - 1},${x}`) && group.includes(`${y - 1},${+x + 1}`)) {
               cleanGroup.push(coords);

          }
     }
     return cleanGroup;
}

function remove(groups) {
     for (const group of groups) {
          for (const coords of group) {
               const [y, x] = coords.split(",")
               gameBoard.rows[y].cells[x].innerHTML = "";


          }
     }
}

function fall() {   
     const fallingStones = []

     for (let x = 0; x < boardSize; x++) {
          let emptyCount = 0

          for (let y = boardSize - 1; y >= 0; y--) {
               const stone = gameBoard.rows[y].cells[x].children[0]

               if (!stone) {
                    emptyCount++;
               } else if (emptyCount) {
                    fallingStones.push(stone)
                    stone.style.transform = `translateY(calc(${-emptyCount} * (9vh + 4px)))`
                    gameBoard.rows[y + emptyCount].cells[x].append(stone)

                    setTimeout(() => stone.style.transform = null)
               }
          }

          for (let y = 0; y < emptyCount; y++) {
               const stone = makeStone();
               stone.style.transform = `translateY(calc(${-emptyCount} * (9vh + 4px)))`
               gameBoard.rows[y].cells[x].append(stone)

               setTimeout(() => stone.style.transform = null)
          }
     }

     if (fallingStones.length) {
          falling = true

          setTimeout(() => falling = false, 500)
     }

     return fallingStones
}

function makeStone() {
     const stone = document.createElement('div')
     stone.className = colors[rnd(colors.length)];
     return stone;
}

function switchPlaces(target) {
     const stone1 = selected.children[0]
     const stone2 = target.children[0]
     const y1 = selected.parentElement.rowIndex
     const x1 = selected.cellIndex
     const y2 = target.parentElement.rowIndex
     const x2 = target.cellIndex

     stone2.style.transform = `translate(calc(${x2 - x1} * (9vh + 4px)), calc(${y2 - y1} * (9vh + 4px)) )`
     stone1.style.transform = `translate(calc(${x1 - x2} * (9vh + 4px)), calc(${y1 - y2} * (9vh + 4px)) )`
     selected.append(stone2)
     target.append(stone1)

     setTimeout(() => {
          stone1.style.transform = stone2.style.transform = null

          stone1.ontransitionend = (() => {
               stone1.ontransitionend = null;

               if (!checkGroups()) {
                    stone1.style.transform = `translate(calc(${x1 - x2} * (9vh + 4px)), calc(${y1 - y2} * (9vh + 4px)) )`
                    stone2.style.transform = `translate(calc(${x2 - x1} * (9vh + 4px)), calc(${y2 - y1} * (9vh + 4px)) )`
                    selected.append(stone1)
                    target.append(stone2)

                    setTimeout(() => {
                         stone1.style.transform = stone2.style.transform = null
                    })
               }
          })
     })
}

function checkGroups() {
     const groups = findGroups()

     if (groups.length) {
          remove(groups)
          fall()

          setTimeout(() => checkGroups(), 600)
     }
     return groups.length
}