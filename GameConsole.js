
export default class Console {

    static Write(text){

        let gConsole = document.getElementById('console')
        let textObj = document.createElement('div')
        textObj.className = 'console-text'
        textObj.textContent = text
        gConsole.appendChild(textObj)

        if(gConsole.childElementCount > 6){
            gConsole.removeChild(gConsole.firstElementChild)
        }

        if(gConsole.childElementCount > 5){
            gConsole.firstElementChild.className += ' fade-console-text'
        }
    }

    static ActionMenu(text, actionsArray){
        //actionsArray = [{ name: 'Click 1', action: 'console.log(1)' }, { name: 'Click 2', action: 'console.log(1)' }]
        let gConsole = document.getElementById('console')
        let textObj = document.createElement('div')
        textObj.className = 'console-text'
        textObj.textContent = text

        let actionsContainer = document.createElement('div')
        for (let i = 0; i < actionsArray.length; i++){
            let button = document.createElement('button')
            button.textContent = actionsArray[i].name
            console.log(actionsArray[i].arg)
            button.addEventListener('click', ()=>{
                actionsArray[i].action(actionsArray[i].arg)
                gConsole.removeChild(textObj)
            })
            actionsContainer.appendChild(button)
        }

        textObj.appendChild(actionsContainer)
        gConsole.appendChild(textObj)

        if(gConsole.childElementCount > 6){
            gConsole.removeChild(gConsole.firstElementChild)
        }

        if(gConsole.childElementCount > 5){
            gConsole.firstElementChild.className += ' fade-console-text'
        }
    }
}