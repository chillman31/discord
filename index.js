const token = 'MTA2NTY0OTgwMDQ3NDc5NjE1Mg.Gc0CuT.vv09zQVd-2t-Pdv_Aa9dIk4ARykdpOjnRLG22M'
const io = require("socket.io-client");
const defSocket = io.connect("https://defs.opnm.net:443", {reconnection: true, auth: {token: "QxVBlbf6P0JgWh9QflzCQcLcooX8yDj2054OaIfEztPo0fRXXs"}})

const {  Client, GatewayIntentBits } = require('discord.js')
const Author = require('./Author')
const { methods } = require('./functions/functions') 

const client = new Client({
    intents: [  // droits
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent // Autorisation à accéder aux messages
    ]
})

let channel
let timebot 

client.on('ready', async () => {
    const user = client.user 
    const botName = client.user.tag
    timebot = Date.now()
    channel = await client.channels.fetch('680092998276743228');
    console.log(`Bot ${ botName } s'est connecté.`)
    user.setPresence({
        activities: [{
            type:"PLAYING",
            name: 'perfect system'
        }],
        status: "online"
    })
     methods.definition(defSocket, channel)
})



  // Example usage
 
client.on('messageCreate', async (message) => {
   const author = new Author(message)

   const messages = author.message.split(' ')
   const admins = ['640605824980484106', '172441664227508224'] //f]
   if (!author.symbol.includes(messages[0][0])) return 
   messages[0] = messages[0].slice(1)
   const cmds = messages
   const list = methods.detectCommand(cmds)

    // USER
        methods.rercherche(cmds, message)
        methods.explodeLetters(list, cmds, message)
        methods.getSyllablesWithSoluces(list, cmds, message)
        methods.opti(list, cmds, message)
        methods.info(cmds, message)
        methods.time(message, cmds, timebot)
        methods.def(defSocket, cmds)
        methods.help(message, cmds)
        methods.coran(cmds, message)
    // ADMIN
    if (admins.includes(author.authorId)) {
        methods.createItem(cmds, list, message)
        methods.deleteItem(cmds, list, message)
        methods.generateGlobal(cmds, message)
    } 
})




client.login(token)