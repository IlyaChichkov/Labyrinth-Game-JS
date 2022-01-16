
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Vector2D{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Node{
    constructor(x, y, nodeType) {
        this.coordinates = new Vector2D(x, y)
        this.nodeType = nodeType.toString()
        this.node = null
        this.visible = false
        this.attribute = []
    }
}

let gameEnded = false
let maxPlayerHealth = 5;
let playerHealth = 5;

let width = 31;
let height = 17;
let gMap = []

wallChar = '🟪'
emptyChar = '⬜'
fogOfWarChar = '⬛'
playerChar = '🥺'
playerVictoryChar = '😃'
playerDefeatChar = '☠️'
finishChar = '🔑'
floorTrapChar = '🕸️'
healthChar = '❤️'

startPos = new Vector2D(getRandomInt(1, width - 2), getRandomInt(1, height - 2))
playerPos = new Vector2D(1, 1)

document.addEventListener('keyup', () => {
    if(gameEnded) return
    let playerStep = 1;
    switch (event.key) {
        case 'a':
            if(gMap[playerPos.x - 1][playerPos.y].nodeType !== 'wall'){

                SetMapNodeState(playerPos.x, playerPos.y, 'empty')
                playerPos.x -= playerStep
                SetMapNodeState(playerPos.x, playerPos.y, 'player')
            }
            break;
        case 'd':
            if(gMap[playerPos.x + 1][playerPos.y].nodeType !== 'wall'){

                SetMapNodeState(playerPos.x, playerPos.y, 'empty')
                playerPos.x += playerStep
                SetMapNodeState(playerPos.x, playerPos.y, 'player')
            }
            break;
        case 'w':
            if(gMap[playerPos.x][playerPos.y - 1].nodeType !== 'wall'){

                SetMapNodeState(playerPos.x, playerPos.y, 'empty')
                playerPos.y -= playerStep
                SetMapNodeState(playerPos.x, playerPos.y, 'player')
            }
            break;
        case 's':
            if(gMap[playerPos.x ][playerPos.y + 1].nodeType !== 'wall'){

                SetMapNodeState(playerPos.x, playerPos.y, 'empty')
                playerPos.y += playerStep
                SetMapNodeState(playerPos.x, playerPos.y, 'player')
            }
            break;
        case 'f':
            ShowMap(false)
            break;
    }
    CheckPlayerStep();
});

function CheckPlayerStep(){
    if(playerPos.x === endPoint.x && playerPos.y === endPoint.y){
        gameEnded = true
        gMap[playerPos.x][playerPos.y].attribute.push('victory')
        ShowMap(false)
        document.getElementById('endScreen').style.display = 'block'
        document.getElementById('endTitle').textContent = 'Victory!'
    }

    if(gMap[playerPos.x][playerPos.y].attribute.includes('floor-trap')){
        playerHealth--;
        UpdatePlayerHealth();
        gMap[playerPos.x][playerPos.y].attribute.push('floor-trap-ex')
    }

    if(playerHealth <= 0){
        gameEnded = true
        gMap[playerPos.x][playerPos.y].attribute.push('defeat')
        ShowMap(false)
        document.getElementById('endScreen').style.display = 'block'
        document.getElementById('endTitle').textContent = 'Defeat!'
    }
}

document.addEventListener("DOMContentLoaded", function(){

    Start();
});

function Start() {
    gameEnded = false
    playerHealth = maxPlayerHealth
    getStartPosition();
    console.log('Start ' + startPos.x + ' ' + startPos.y)
    MapArrayPrepare()
    CreateLabyrinth();
    ShowMap();

    UpdatePlayerHealth();
}

function UpdatePlayerHealth() {
    let healthContainer = document.getElementById('health')
    while (healthContainer.firstChild){
        healthContainer.removeChild(healthContainer.firstChild)
    }
    for(let i = 0; i < playerHealth; i++){
        let health = document.createElement("div");
        health.textContent = healthChar
        healthContainer.appendChild(health)
    }
}

function MapArrayPrepare() {
    gMap = new Array(width)

    for (let i = 0; i < gMap.length; i++){
        gMap[i] = new Array(height);
    }

    for (let x = 0; x < gMap.length; x++){
        for (let y = 0; y < gMap[x].length; y++){
            gMap[x][y] = new Node(x, y, 'empty');
        }
    }
    console.log(gMap)
}

function getStartPosition(){

    startPos = new Vector2D(getRandomInt(2, width - 2), getRandomInt(2, height - 2))
    if(startPos.x % 2 === 0){
        startPos.x -= 1;
    }
    if(startPos.y % 2 === 0){
        startPos.y -= 1;
    }
    playerPos.x = startPos.x;
    playerPos.y = startPos.y;
    console.log(startPos.x + ': ' + startPos.y)
}

async function CreateLabyrinth() {

    for (let x = 0; x < gMap.length; x++){
        for (let y = 0; y < gMap[x].length; y++){
            gMap[x][y].nodeType = 'wall';
        }
    }

    await RecursiveTrace(startPos.x, startPos.y, 0)

    gMap[playerPos.x][playerPos.y].nodeType = 'player'
    gMap[endPoint.x][endPoint.y].nodeType = 'finish'
    ShowMap();
    console.log(maxDistance)
    console.log(endPoint)
}

let maxDistance = 0;
let endPoint = new Vector2D(0, 0);

async function RecursiveTrace(x, y, distance) {

    distance++;
    if(distance > maxDistance){
        maxDistance = distance
        endPoint = new Vector2D(x, y)
    }

    gMap[x][y].nodeType = 'empty'

    let dirStepCount = 0;
    let dirArray = [];

    let extraDoorChance = 23;
    let floorTrapChance = 22;

    for(let i = 0; i < 4; i++){
        let dir;
        do{
            dir = getRandomInt(0, 3);
        }while (dirArray.includes(dir))
        dirArray.push(dir)
    }

    while (dirStepCount < 4){
        switch (dirArray[dirStepCount]) {
            case 0:
                if(y - 2 > 0){
                    if (gMap[x][y - 2].nodeType === 'wall'){
                        gMap[x][y - 1].nodeType = 'empty'
                        let result = await new Promise((resolve) => {
                            RecursiveTrace(x, y - 2, distance)
                            resolve(true);
                        })
                    }else if(getRandomInt(0, 100) < extraDoorChance){
                        gMap[x][y - 1].nodeType = 'empty'
                        if(getRandomInt(0, 100) < floorTrapChance){
                            gMap[x][y - 1].attribute.push('floor-trap')
                        }
                    }
                }
                break;
            case 1:
                if(x + 2 < width - 1){
                    if (gMap[x + 2][y].nodeType === 'wall'){
                        gMap[x + 1][y].nodeType = 'empty'
                        let result = await new Promise((resolve) => {
                            RecursiveTrace(x + 2, y, distance)
                            resolve(true);
                        })
                    }else if(getRandomInt(0, 100) < extraDoorChance){
                        gMap[x + 1][y].nodeType = 'empty'
                        if(getRandomInt(0, 100) < floorTrapChance){
                            gMap[x + 1][y].attribute.push('floor-trap')
                        }
                    }
                }
                break;
            case 2:
                if(y + 2 < height - 1){
                    if (gMap[x][y + 2].nodeType === 'wall'){
                        gMap[x][y + 1].nodeType = 'empty'
                        let result = await new Promise((resolve) => {
                            RecursiveTrace(x, y + 2, distance)
                            resolve(true);
                        })
                    }else if(getRandomInt(0, 100) < extraDoorChance){
                        gMap[x][y + 1].nodeType = 'empty'
                        if(getRandomInt(0, 100) < floorTrapChance){
                            gMap[x][y + 1].attribute.push('floor-trap')
                        }
                    }
                }
                break;
            case 3:
                if(x - 2 > 0){
                    if (gMap[x - 2][y].nodeType === 'wall'){
                        gMap[x - 1][y].nodeType = 'empty'
                        let result = await new Promise((resolve) => {
                            RecursiveTrace(x - 2, y, distance)
                            resolve(true);
                        })
                    }else if(getRandomInt(0, 100) < extraDoorChance){
                        gMap[x - 1][y].nodeType = 'empty'
                        if(getRandomInt(0, 100) < floorTrapChance){
                            gMap[x - 1][y].attribute.push('floor-trap')
                        }
                    }
                }
                break;
        }
        dirStepCount++;
    }
}

function SetMapNodeState(x, y, nodeType) {
    gMap[x][y].nodeType = nodeType
    UpdateFogOfWar()
    UpdateMapElement(x, y)
}

function UpdateMapElement(elementX, elementY) {

    let node = document.getElementById(elementX + '_' + elementY);
    SetNodeText(elementX, elementY, node)
}

function SetNodeText(x, y, node, fogOfWar = true) {

    if(!gMap[x][y].visible && fogOfWar){
        node.innerHTML = fogOfWarChar + ' '
        return
    }
    switch (gMap[x][y].nodeType) {
        case 'wall':
            node.innerHTML = wallChar + ' '
            break;
        case 'empty':
            node.innerHTML = emptyChar + ' '
            if(fogOfWar){
                if(gMap[x][y].attribute.includes('floor-trap-ex')){
                    node.innerHTML = floorTrapChar + ' '
                }
            }else{
                if(gMap[x][y].attribute.includes('floor-trap')){
                    node.innerHTML = floorTrapChar + ' '
                }
            }
            break;
        case 'player':
            node.innerHTML = playerChar + ' '
            if(gMap[x][y].attribute.includes('victory')){
                node.innerHTML = playerVictoryChar + ' '
            }
            if(gMap[x][y].attribute.includes('defeat')){
                node.innerHTML = playerDefeatChar + ' '
            }
            break;
        case 'finish':
            node.innerHTML = finishChar + ' '
            break;
    }
}

function ShowMap(applyFogOfWar = true) {
    let mapContainer = document.getElementById('map');
    while (mapContainer.firstChild) {
        mapContainer.removeChild(mapContainer.firstChild);
    }
    for (let x = 0; x < gMap.length; x++){
        let nodesLine = document.createElement("div");
        nodesLine.className = 'nodesColumn'
        for (let y = 0; y < gMap[x].length; y++){
            let node = document.createElement("div");
            node.id = x + '_' + y;
            node.className = 'nodeItem'
            gMap[x][y].node = node;
            if(!applyFogOfWar){
                SetNodeText(x, y, node, applyFogOfWar)
            }
            nodesLine.appendChild(node)
        }
        mapContainer.appendChild(nodesLine)

        document.getElementById('map').innerHTML += '</br>'
    }
    if(applyFogOfWar){
        UpdateFogOfWar()
    }
}

function UpdateFogOfWar() {
    let fogRange = 1;
    let visionMaxRange = 4;

    for (let x = 0; x < gMap.length; x++){
        for (let y = 0; y < gMap[x].length; y++){
            if(Math.abs(x - playerPos.x) <= fogRange && Math.abs(y - playerPos.y) <= fogRange){
                gMap[x][y].visible = true;
            }else{
                gMap[x][y].visible = false;
            }
            UpdateMapElement(x, y)
        }
    }

    let visionRange = 1
    // Right
    for (let x = playerPos.x + 1; x < gMap.length; x++){
        if(gMap[x][playerPos.y].nodeType === 'wall' || visionRange > visionMaxRange - 1) {
            gMap[x][playerPos.y].visible = true
            UpdateMapElement(x, playerPos.y)
            break
        }
        gMap[x][playerPos.y].visible = true
        UpdateMapElement(x, playerPos.y)
        /*
        if(gMap[x][playerPos.y + 1].nodeType === 'wall'){
            gMap[x][playerPos.y + 1].visible = true
            UpdateMapElement(x, playerPos.y + 1)
        }
        if(gMap[x][playerPos.y - 1].nodeType === 'wall'){
            gMap[x][playerPos.y - 1].visible = true
            UpdateMapElement(x, playerPos.y - 1)
        }*/
        visionRange++
    }
    //Left
    visionRange = 1
    for (let x = playerPos.x - 1; x > 0; x--){
        if(gMap[x][playerPos.y].nodeType === 'wall' || visionRange > visionMaxRange - 1) {
            gMap[x][playerPos.y].visible = true
            UpdateMapElement(x, playerPos.y)
            break
        }
        gMap[x][playerPos.y].visible = true
        UpdateMapElement(x, playerPos.y)
        visionRange++
    }
    //Up
    visionRange = 1
    for (let y = playerPos.y + 1; y < gMap[playerPos.x].length; y++){
        if(gMap[playerPos.x][y].nodeType === 'wall' || visionRange > visionMaxRange - 1) {
            gMap[playerPos.x][y].visible = true
            UpdateMapElement(playerPos.x, y)
            break
        }
        gMap[playerPos.x][y].visible = true
        UpdateMapElement(playerPos.x, y)
        visionRange++
    }
    //Down
    visionRange = 1
    for (let y = playerPos.y - 1; y > 0; y--){
        if(gMap[playerPos.x][y].nodeType === 'wall' || visionRange > visionMaxRange - 1) {
            gMap[playerPos.x][y].visible = true
            UpdateMapElement(playerPos.x, y)
            break
        }
        gMap[playerPos.x][y].visible = true
        UpdateMapElement(playerPos.x, y)
        visionRange++
    }

    /*
    for (let x = playerPos.x - fogRange; x <= playerPos.x + fogRange; x++){
        if(x < 0 || x > gMap.length - 1) continue;
        for (let y = playerPos.y - fogRange; y <= playerPos.y + fogRange; y++){
            if(y < 0 || y > gMap[x].length - 1) continue;
            gMap[x][y].visible = true;
            UpdateMapElement(x, y)
        }
    }*/
}