
export default function ConsoleWrite(text){

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
