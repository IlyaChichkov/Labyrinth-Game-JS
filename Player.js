
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default class Player {
    healthChar = '❤️'
    emptyHealthChar = '🖤'
    stoneChar = '🧱'

    constructor() {
        this.maxExperience = 10
        this.experience = 0
        this.expFromTrap = 5
        this.maxHealth = 5
        this.health = 5
        this.stones = 0
        this.skills = []
        document.getElementById('exp').textContent = 'EXP: ' + this.experience + '/' + this.maxExperience
        this.UpdatePlayerHealth();
    }

    AddExperience(exp) {
        this.experience += exp
        if(this.skills.includes('moreExp')){
            this.experience += Math.round(Math.sqrt(exp))
        }
        this.CheckLevelUp()
        document.getElementById('exp').textContent = 'EXP: ' + this.experience + '/' + this.maxExperience
    }

    CheckLevelUp(){
        if(this.experience >= this.maxExperience){
            this.experience = this.experience - this.maxExperience
            this.maxExperience = Math.round(Math.pow(this.maxExperience, 1.1))
            this.ShowUpgradeBar()
        }
    }


    ChangeHealth(val){
        this.health += val
        if(this.health > this.maxHealth) this.health = this.maxHealth
        this.UpdatePlayerHealth()
    }

    UpdatePlayerHealth() {
        let healthContainer = document.getElementById('health')
        while (healthContainer.firstChild){
            healthContainer.removeChild(healthContainer.firstChild)
        }
        for(let i = 0; i < this.maxHealth; i++){
            let health = document.createElement("div");
            health.textContent = this.emptyHealthChar
            if(i < this.health){
                health.textContent = this.healthChar
            }
            healthContainer.appendChild(health)
        }
    }

    ShowUpgradeBar(){
        let bar = document.getElementById('upgrade-bar')

        let itemId
        let itemsToChoose = []

        for (let i = 0; i < 3; i++){
            do{
                itemId = getRandomInt(0, levelUpItems.length - 1)
            }while (itemsToChoose.includes(itemId))
            itemsToChoose.push(itemId)
            let item = document.createElement('button')
            item.textContent = 'Upgrade ' + levelUpItems[itemId].name
            item.href = ''
            item.value = levelUpItems[itemId].id
            item.addEventListener('click', (e) => {
                this.ChooseUpgrade(e.target.value)
            })
            bar.appendChild(item)
        }
    }

    ChooseUpgrade(itemName){
        console.log(itemName)
        switch (itemName) {
            case 'heal':
                console.log('heal')
                this.ChangeHealth(this.maxHealth)
                break;
            case 'maxHealth':
                this.maxHealth++
                this.UpdatePlayerHealth()
                break;
            case 'trapVision':
                if(this.HasSkill(itemName)){
                    this.GetSkill(itemName).lvl++
                }else{
                    this.AddSkill(itemName)
                }
                break;
            case 'moreExp':
                this.AddSkill(itemName)
                break;
        }

        let healthContainer = document.getElementById('upgrade-bar')
        while (healthContainer.firstChild){
            healthContainer.removeChild(healthContainer.firstChild)
        }
    }

    GetSkill(skillId){
        for (let i = 0; i < this.skills.length; i++){
            if(this.skills[i].id === skillId){
                return this.skills[i]
            }
        }
        return null
    }

    HasSkill(skillId){
        for (let i = 0; i < this.skills.length; i++){
            if(this.skills[i].id === skillId){
                return true
            }
        }
        return false
    }

    AddSkill(skillId){
        for (let i = 0; i < levelUpItems.length; i++){
            if(levelUpItems[i].id === skillId){
                this.skills.push(levelUpItems[i])
            }
        }
    }
}

let levelUpItems = [
    {id: 'heal', name: 'Health', desc: 'Restore your health'},
    {id: 'maxHealth', name: 'Max Health', desc: 'Increase your maximum health value'},
    {id: 'trapVision', name: 'Trap Vision', desc: 'Allow you to fell and even see traps', lvl: 1},
    {id: 'moreExp', name: 'More Experience', desc: 'You get more experience'},
    {id: 'stones', name: 'Stones', desc: 'Gives you some stones to throw', count: 5}
]
