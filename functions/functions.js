const request = require('../fetch')
const { readFile } = require('fs/promises')

const commands = {
    basics : {
        dictionnaire: ["shearch", "c", "recherche"], 
        gentiles: ["g", "gentiles", "gentile", "gen"],
        adverbes: ["a", "adverbes", "adverbe", "adv"],
        fleurs: ["f", "flower", "fleurs", "fleurs", "flowers"],
        "verbes/verbes": ["v", "verbe", "verbes", "verb"], 
        "verbes/dictionnaire": ["nv", "noverb", "noverbe"]      
    }, 

    other: {
        c: "dictionnaire",
        g: "gentiles",
        v: "verbes/verbes", 
        a: "adverbes",
        nv: "verbes/dictionnaire"
    }
}

const other = Object.keys(commands.other)

const msg_whiteAndGreen = (white, green) => {
    return "```ansi\n[2;37m" +  white + "[2;36m[1;36m" +  green + "[0m[2;36m[0m\n```"
}

const msg_green = (texte, choose) => {
    let responseHTTP = choose === 'ok' ? '[Success] - ' : ""
    return "```ansi\n[2;36m[1;36m" + responseHTTP + texte + "[0m[2;36m[0m\n```"
}

const msg_blue = (texte) => {
    return "```ansi\n[2;34m[1;34m" +  texte + "[0m[2;34m[0m\n```"
}

const msg_red = (string, choose) => {
    let responseHTTP = choose === 'ok' ? '[Error] - ' : ""
    return "```ansi\n[2;31m[1;31m" + responseHTTP + string + "[0m[2;31m[0m\n```"
}

const msg_white = (string) => {
    return "```ansi\n[2;36m[1;36m" +  string + "[0m[2;36m[0m\n```"
}


const msg_yellow = (string) => {
    return "```ansi\n[2;33m[1;33m" +  string + "[0m[2;33m[0m\n```"
}

exports.methods = {
    detectCommand (messages) {
        if (!messages[1]) return
        if (messages[1][0] === '-' && messages[1].length === 2 || messages[1].length === 3) {
            const cmd1 = messages[1].slice(1)
            if (other.includes(cmd1)) {
                return commands.other[cmd1]  
            }
        }
    },
    
    async rercherche(messages, socket) {
        const globalCmds = Object.entries(commands.basics)
        let list
        for(let cmd of globalCmds) if (cmd[1].includes(messages[0])) { list = cmd[0]; break }
        
        if (!list) return 
        const response = await request(`${ list }?syllabe=${ messages[1] }`, 'get')
        if (response.data.length === 0) return socket.channel.send(msg_red(response.message, "ok"))
       
        const datas = msg_green(response.data.map(element => element.toUpperCase()).join('\n'))
        const infos = msg_green(`${ list.toUpperCase() }  (Solutions : ${ response.globalLength })`, 'ok')
        
        socket.channel.send(infos)   
        socket.channel.send(datas)
    },
    
    async coran (messages, socket) {
        if (messages[0] === "sourate") {
            if (isNaN(messages[1]) || messages[1] < 1 || messages[1] > 114) return 
            const responseJSON = await readFile('coran.txt', 'utf-8')
            const response = JSON.parse(responseJSON)
            if (response) {
                const results = response[messages[1] - 1]
                socket.channel.send(msg_green(`${ results.nbSourate } -  ${ results.nameSourate } `))
                socket.channel.send(msg_green(`${ results.datas.join('\n') }`))
            } else {
                socket.channel.send(msg_red('Une erreur est survenue.', 'ok'))
            } 
        }
    },

    async explodeLetters(listName, messages, socket) {
        if (messages[0] === "letters") {
            if (!listName) return 
            const response = await request(`explode/${ listName }?destroyLetters=${ messages[2] }`)

            if (isNaN(messages[2])) return socket.channel.send(msg_red(`Les chaînes de caractères sont interdites.`, "ok"))
            if (messages[2] < 1) return socket.channel.send(msg_red(`Le nombre doit être supérieur à 0.`, "ok"))
            if (response.data.length === 0) return socket.channel.send(msg_red(response.message, "ok"))

            const datas = msg_green(response.data.map(element => element.toUpperCase()).join('\n'))
            const infos = msg_green(`${ listName.toUpperCase() } / Destroy Letters (Solutions : ${ response.globalLength })`, 'ok')
            
            socket.channel.send(infos)   
            socket.channel.send(datas)
        }
    },

    async getSyllablesWithSoluces (listName, messages, socket) {
        if (messages[0] === 'sw') {
            if (!listName || !messages[2]) return 

            const response = await request(`${ listName }/syllable?nb=${ messages[2] }`)

            if (isNaN(messages[2])) return socket.channel.send(msg_red(`Les chaînes de caractères sont interdites.`, "ok"))
            if (messages[2] < 1) return socket.channel.send(msg_red(`Le nombre doit être supérieur à 0.`, "ok"))
            if (response.data.length === 0) return socket.channel.send(msg_red(response.message, "ok"))
           
            const datas = response.data.map(element => element.toUpperCase()).slice(0, 200)
            const message =  datas.length === 1 ? `syllable pour ${ messages[2] } solution ${ messages[2] == 1 ? '' : 's' })` : `syllables pour ${ messages[2] } solution${ messages[2] == 1 ? '' : 's' }`
            const result = msg_green(datas.join(' '))
            const infos = msg_green(`${ listName.toUpperCase() } : (${ response.globalLength } ${ message })`, 'ok')
            
            socket.channel.send(infos)   
            socket.channel.send(result)
        }
    },

    async opti (listName, messages, socket) {
        if (messages[0] === 'opti') {
            if (!messages[2]) return false 
            if (isNaN(messages[2])) return socket.channel.send(msg_red(`Les chaînes de caractères sont interdites.`, "ok"))
            if (messages[2] < 1)  return socket.channel.send(msg_red(`Le nombre doit être supérieur à 0.`, "ok"))
            const response = await request(`rares/${ listName }?page=${ messages[2] }`)
            if (response.data.length === 0) return socket.channel.send(msg_red(response.message, "ok"))
           
            

            const reponseMessage = response.data.map(wordInfo => {
                return `(${ wordInfo.rang }) ${ wordInfo.word } possède ${ wordInfo.sy.length } syllabes - best : [${ wordInfo.level.max.join(' ') }]  low: [${ wordInfo.level.min.join(' ') }]  power : ${ wordInfo.globalocc }\n`
            }).map(element => element.toUpperCase()).join('\n')
            
            socket.channel.send(msg_yellow(reponseMessage))
        }
    },

    async info (messages, socket) {
        if (messages[0] === 'info') {
            if (messages[2]) return false 
            if (!isNaN(messages[1])) return socket.channel.send(msg_red(`Les nombres ne sont pas acceptés.`, "ok"))

            const response = await request(`info/${ messages[1] }`)
            console.log(response)

            if (!response.occClassement || response.occClassement.length === 0) return socket.channel.send(msg_red(response.message, "ok"))
           
            const details = `[${ response.word }]\norigine: ${ response.wordOrigin }\nlettres détruites: ${ response.explodeLetters }\nCe mot dans le dico: ${ response.wordInElementSize }`
            const detailsSy = `syllabes (${ response.occClassement.length }) : \n${ response.occClassement.map(element => `${ element.val } : ${ element.occ} `).join('\n') }` 
            
            
            socket.channel.send(msg_green(details.toUpperCase()))
            socket.channel.send(msg_yellow(detailsSy.toUpperCase()))
        }
    },

    async createItem(messages, listName, socket) {
        if (messages[0] === "add") {
            if (!messages[2]) return false
            const body = {
                "items": messages.slice(2)
            }

            const response = await request(`${ listName }`, 'POST', body)
            if (!response) socket.channel.send(msg_red(`Une erreur est survenue.`, 'ok')) 
            socket.channel.send(msg_green(response.message))
           
        }
    }, 

    async deleteItem(messages, listName, socket) {
        if (messages[0] === "remove") {
            if (!messages[2]) return 
            const response = await request(`${ listName }?array=${ JSON.stringify(messages.slice(2)) }`, 'delete') || { message: 'Un problème est survenu.'}
            if (!response) return socket.channel.send(msg_red(`Une erreur est survenue.`, 'ok')) 
            socket.channel.send(msg_green(response.message))
        }
    },
    
    time (socket, messages, time) {
        if (messages[0] === 'time') {
            const elapsedTime = Date.now() - time;
            const seconds = Math.floor(elapsedTime / 1000) % 60;
            const minutes = Math.floor(elapsedTime / (1000 * 60)) % 60;
            const hours = Math.floor(elapsedTime / (1000 * 60 * 60)) % 24;
            const days = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));

            socket.channel.send(msg_yellow(`Temps écoulé : ${days} jours, ${hours} heures, ${minutes} minutes, ${seconds} secondes`));
        } 
    } , 

    async generateGlobal(messages, socket) {
        if (messages[0] === "generate") {
            try {
                socket.channel.send(msg_yellow('Initialisation..'))
                await request(`generate/syllable/all`)
                socket.channel.send(msg_yellow('Regénération des syllabes des listes correctement effectuée.'))
                socket.channel.send(msg_yellow('Patientez.. initialisation de la regénération des occ.'))
                await request(`generate/occ/all`)
                socket.channel.send(msg_green('Actualisation des listes effectué.'))
            } catch(error) {
                console.error(error)
            }
        }
    },

    def(socket, messages) {
        if (messages[0] === "d" || messages[0] === "def") {
            if (!messages[1]) return
            socket.emit('def', messages[1])
        }
    }, 

    help(socket, messages) {
        if (messages[0] === "help" || messages[0] === "aide") {
            let message = `
                [AIDE]:
                [Recherche]       .c   retourne les solutions en fonction d'une syllabe (ou regxp)\n
                [combinaison]     -c = dictionnaire  -a = adverbes  -g = gentilés -f = fleurs\n
                [Syllabes opti]   .opti [combinaison] [page]    exemple : .opti -c 1    -c = dictionnaire, page = 1 \n
                [info]            .info [mot]    exemple : .info prendre \n
                [letters]         .letters [combinaison] [lettres uniques d'un mot de a à w]  exemple : .letters -c 10  \n
                [time]            retourne le temps actif du bot\n
                [def]             retourne les deux premières définitions d'un mot 
            `

            socket.channel.send(msg_yellow(message.toUpperCase()))
        }
    }, 

    definition (socket, msg) {
        socket.on("connect", () => msg.send(msg_green("(Re)connecté au serveur de defs"))).on("def", (w, t, d) => {
            if(t === "Error 404"){
                msg.send(msg_red("Définition introuvable pour " + w), 'ok')
            } else if(t === "Error 401"){
                msg.send(msg_red("Mauvaise requête"), 'ok')
            } else {
                msg.send(msg_yellow("Les définitions " + t + " pour le mot " + w + " sont: ")) 
                for(let i = 0; i < d.length; i++) {
                    msg.send(msg_green(d[i]))
                    if (i === 1) break;
                }
            }
        })
    }
}