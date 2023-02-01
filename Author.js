module.exports = class Author {
    constructor (Message) {
        this.author = Message.author
        this.authorId = Message.author.id 
        this.authorName = Message.author.username
        this.channelId = Message.channelId, 
        this.guildId = Message.guildId,
        this.id = Message.id,
        this.message = Message.content.toLowerCase()
        this.serverName = Message.guild.name
        this.room = Message.channel.name
        this.symbol = ["/", "."]
    }
}