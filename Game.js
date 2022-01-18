
import Player from "http://localhost:63342/LabyrinthGame/Player.js";
import Console from "http://localhost:63342/LabyrinthGame/GameConsole.js";

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

class Game{
    constructor() {
        this.level = 1
        this.gameEnded = false
        this.extraDoorChance = 23;
        this.floorTrapChance = 12;
        document.getElementById('lvl').textContent = 'LvL: ' + this.level
    }
}

let game;
let player;

let width = 31;
let height = 17;
let gMap = []

let wallChar = '🟪'
let emptyChar = '⬜'
let fogOfWarChar = '⬛'
let playerChar = '🥺'
let playerVictoryChar = '😃'
let playerDefeatChar = '☠️'
let finishChar = '🔑'
let floorTrapChar = '🕸️'

let startPos = new Vector2D(getRandomInt(1, width - 2), getRandomInt(1, height - 2))
let playerPos = new Vector2D(1, 1)


document.addEventListener('keyup', () => {
    if(game.gameEnded) return
    let playerStep = 1
    let playerMoved = false
    //console.log(event.key)
    switch (event.key) {
        case 'a':
            if(gMap[playerPos.x - 1][playerPos.y].nodeType !== 'wall'){
                SetMapNodeState(playerPos.x, playerPos.y, 'empty')
                playerPos.x -= playerStep
                SetMapNodeState(playerPos.x, playerPos.y, 'player')
                playerMoved = true
            }
            break;
        case 'd':
            if(gMap[playerPos.x + 1][playerPos.y].nodeType !== 'wall'){

                SetMapNodeState(playerPos.x, playerPos.y, 'empty')
                playerPos.x += playerStep
                SetMapNodeState(playerPos.x, playerPos.y, 'player')
                playerMoved = true
            }
            break;
        case 'w':
            if(gMap[playerPos.x][playerPos.y - 1].nodeType !== 'wall'){

                SetMapNodeState(playerPos.x, playerPos.y, 'empty')
                playerPos.y -= playerStep
                SetMapNodeState(playerPos.x, playerPos.y, 'player')
                playerMoved = true
            }
            break;
        case 's':
            if(gMap[playerPos.x ][playerPos.y + 1].nodeType !== 'wall'){

                SetMapNodeState(playerPos.x, playerPos.y, 'empty')
                playerPos.y += playerStep
                SetMapNodeState(playerPos.x, playerPos.y, 'player')
                playerMoved = true
            }
            break;
        case 'f':
            Console.Write('> Cheat Fog Of War')
            ShowMap(false)
            break;
        case 'e':
            Console.Write('> Cheat Experience')
            player.AddExperience(100)
            break;
        case 'g':
            NextLevel()
            break;
        case 'r':
            Start()
            break;
    }
    if(playerMoved) CheckPlayerStep();
});

function CheckPlayerStep(){
    if(playerPos.x === endPoint.x && playerPos.y === endPoint.y){
        game.gameEnded = true
        gMap[playerPos.x][playerPos.y].attribute.push('victory')
        ShowMap(false)
        document.getElementById('next-lvl').style.display = 'block'
        document.getElementById('endScreen').style.display = 'block'
        document.getElementById('endTitle').textContent = 'Victory!'
    }

    if(gMap[playerPos.x][playerPos.y].attribute.includes('floor-trap')){
        Console.Write('You stepped in trap! ')
        player.ChangeHealth(-1)
        player.AddExperience(player.expFromTrap)
        gMap[playerPos.x][playerPos.y].attribute.push('floor-trap-ex')
    }

    if(player.health <= 0){
        game.gameEnded = true
        gMap[playerPos.x][playerPos.y].attribute.push('defeat')
        ShowMap(false)
        document.getElementById('endScreen').style.display = 'block'
        document.getElementById('endTitle').textContent = 'Defeat!'
    }

    TrapsCheck(playerPos.x, playerPos.y, 2);
}

function ThrowStone(dir) {
    Console.Write('You throw stone')
    switch (dir) {
        case 'Up':
            if(gMap[playerPos.x][playerPos.y - 1].attribute.includes('floor-trap')){
                gMap[playerPos.x][playerPos.y - 1].attribute.push('floor-trap-ex')
                UpdateMapElement(playerPos.x, playerPos.y - 1)
            }
            break;
        case 'Right':
            if(gMap[playerPos.x + 1][playerPos.y].attribute.includes('floor-trap')){
                gMap[playerPos.x + 1][playerPos.y].attribute.push('floor-trap-ex')
                UpdateMapElement(playerPos.x + 1, playerPos.y)
            }
            break;
        case 'Down':
            if(gMap[playerPos.x][playerPos.y + 1].attribute.includes('floor-trap')){
                gMap[playerPos.x][playerPos.y + 1].attribute.push('floor-trap-ex')
                UpdateMapElement(playerPos.x, playerPos.y + 1)
            }
            break;
        case 'Left':
            if(gMap[playerPos.x - 1][playerPos.y].attribute.includes('floor-trap')){
                gMap[playerPos.x - 1][playerPos.y].attribute.push('floor-trap-ex')
                UpdateMapElement(playerPos.x - 1, playerPos.y)
            }
            break;
    }
    player.AddStones(-1)
}

function TrapsCheck(x, y, distance){
    if(distance < 1) return
    distance--

    if(gMap[x + 1][y].nodeType === 'empty'){
        if(gMap[x + 1][y].attribute.includes('floor-trap')){
            InformAboutTrap('right')
        }
        TrapsCheck(x + 1, y, distance - 1);
    }

    if(gMap[x - 1][y].nodeType === 'empty'){
        if(gMap[x - 1][y].attribute.includes('floor-trap')){
            InformAboutTrap('left')
        }
        TrapsCheck(x - 1, y, distance - 1);
    }

    if(gMap[x][y + 1].nodeType === 'empty'){
        if(gMap[x][y + 1].attribute.includes('floor-trap')){
            InformAboutTrap('down')
        }
        TrapsCheck(x, y + 1, distance - 1);
    }

    if(gMap[x][y - 1].nodeType === 'empty'){
        if(gMap[x][y - 1].attribute.includes('floor-trap')){
            InformAboutTrap('up')
        }
        TrapsCheck(x, y - 1, distance - 1);
    }
}

function InformAboutTrap(direction){
    console.log(player.skills)
    if(!player.HasSkill('trapVision')) return
    switch (player.GetSkill('trapVision').lvl) {
        case 1:
            Console.Write('You feel trap near this place...')
            if(player.stones > 0){
                let actions = [{ name: 'Throw Up', action: ThrowStone, arg: 'Up' }, { name: 'Throw Right', action: ThrowStone, arg: 'Right' },
                    { name: 'Throw Down', action: ThrowStone, arg: 'Down' }, { name: 'Throw Left', action: ThrowStone, arg: 'Left' }]
                Console.ActionMenu(`You have ${player.stones} stones`, actions)
            }
            break;
        case 2:
            Console.Write('You feel trap from ' + direction)
            if(player.stones > 0){
                let actions = [{ name: 'Throw Up', action: ThrowStone, arg: 'Up' }, { name: 'Throw Right', action: ThrowStone, arg: 'Right' },
                    { name: 'Throw Down', action: ThrowStone, arg: 'Down' }, { name: 'Throw Left', action: ThrowStone, arg: 'Left' }]
                Console.ActionMenu(`You have ${player.stones} stones`, actions)
            }
            break;
        case 3:
            Console.Write('You see trap ' + direction)
            RevealTrap(direction)
            break;
    }
}

function RevealTrap(direction){
    console.log(direction)
    switch (direction) {
        case 'right':
            gMap[playerPos.x + 1][playerPos.y].attribute.push('floor-trap-ex')
            UpdateMapElement(playerPos.x + 1, playerPos.y)
            break;
        case 'left':
            gMap[playerPos.x - 1][playerPos.y].attribute.push('floor-trap-ex')
            UpdateMapElement(playerPos.x - 1, playerPos.y)
            break;
        case 'up':
            gMap[playerPos.x][playerPos.y - 1].attribute.push('floor-trap-ex')
            UpdateMapElement(playerPos.x, playerPos.y - 1)
            break;
        case 'down':
            gMap[playerPos.x][playerPos.y + 1].attribute.push('floor-trap-ex')
            UpdateMapElement(playerPos.x, playerPos.y + 1)
            break;
    }
}

document.addEventListener("DOMContentLoaded", function(){

    document.getElementById('restart').addEventListener('click', () => {Start();})
    Start();
});

function NextLevel() {
    player.AddExperience(game.level * 5)
    game.level++
    game.gameEnded = false
    document.getElementById('lvl').textContent = 'LvL: ' + game.level
    game.floorTrapChance += game.level * 3;
    GenerateLevel()
}

function GenerateLevel() {


    game.gameEnded = false
    player.health = player.maxHealth
    getStartPosition();
    console.log('Start ' + startPos.x + ' ' + startPos.y)
    MapArrayPrepare()
    CreateLabyrinth();
    ShowMap();
}

function Start() {
    game = new Game()
    player = new Player()
    document.getElementById('next-lvl').addEventListener('click', () => { NextLevel(); })
    GenerateLevel()
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
                    }else if(getRandomInt(0, 100) < game.extraDoorChance){
                        gMap[x][y - 1].nodeType = 'empty'
                        if(getRandomInt(0, 100) < game.floorTrapChance){
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
                    }else if(getRandomInt(0, 100) < game.extraDoorChance){
                        gMap[x + 1][y].nodeType = 'empty'
                        if(getRandomInt(0, 100) < game.floorTrapChance){
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
                    }else if(getRandomInt(0, 100) < game.extraDoorChance){
                        gMap[x][y + 1].nodeType = 'empty'
                        if(getRandomInt(0, 100) < game.floorTrapChance){
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
                    }else if(getRandomInt(0, 100) < game.extraDoorChance){
                        gMap[x - 1][y].nodeType = 'empty'
                        if(getRandomInt(0, 100) < game.floorTrapChance){
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

    if(!gMap[x][y].visible && fogOfWar && !gMap[x][y].attribute.includes('discovered')){
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
                DiscoverNode(x, y)
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
            DiscoverNode(x, playerPos.y)
            break
        }
        DiscoverNode(x, playerPos.y)
        /* FEATURE
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
            DiscoverNode(x, playerPos.y)
            break
        }
        DiscoverNode(x, playerPos.y)
        visionRange++
    }
    //Up
    visionRange = 1
    for (let y = playerPos.y + 1; y < gMap[playerPos.x].length; y++){
        if(gMap[playerPos.x][y].nodeType === 'wall' || visionRange > visionMaxRange - 1) {
            DiscoverNode(playerPos.x, y)
            break
        }
        DiscoverNode(playerPos.x, y)
        visionRange++
    }
    //Down
    visionRange = 1
    for (let y = playerPos.y - 1; y > 0; y--){
        if(gMap[playerPos.x][y].nodeType === 'wall' || visionRange > visionMaxRange - 1) {
            DiscoverNode(playerPos.x, y)
            break
        }
        DiscoverNode(playerPos.x, y)
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

function DiscoverNode(x, y) {
    if(gMap[x][y].attribute.includes('discovered')) return
    gMap[x][y].visible = true
    gMap[x][y].attribute.push('discovered')
    UpdateMapElement(x, y)
}