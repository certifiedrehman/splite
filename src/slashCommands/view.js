const { MessageEmbed } = require('discord.js');
const { reply } = require('./slashLibrary')

module.exports = {
    createSlashView: function createSlashView(client, server) {
        client.api.applications(client.user.id).guilds(server.id).commands.post({
            data: {
                name: "view",
                description: "RESTRICTED COMMAND: View details of a confession",
                options: [
                    {
                        "name": "Confession ID",
                        "description": "Type the ID of confession",
                        "type": 3,
                        "required": true,
                    }
                ]
            }
        })
    },

    view: function view(interaction, client) {
        const prefix = (client.db.settings.selectPrefix.pluck().get(interaction.guild_id))
        const viewConfessionsRole = (client.db.settings.selectViewConfessionsRole.pluck().get(interaction.guild_id))
        const confessionID = interaction.data.options[0].value;
        console.log( {confessionID})
        if (!viewConfessionsRole) {
            reply(interaction, `No role is set to run this command. To set a role to run this command type, ${prefix}setviewconfessionsrole`, client)
        } else
        {
            const guild = (client.guilds.cache.get(interaction.guild_id))
            const role = (guild.roles.cache.get(viewConfessionsRole))
            const user = guild.members.cache.find(u => u.id === interaction.member.user.id)
            if (!user.roles.cache.has(role.id))
                reply(interaction, `**You don't have perms to run this command**`, client)
            else {
                const {confession_id: confession_id, content : content, author_id : author_id, timeanddate : timeanddate, guild_id : guild_id} = client.db.confessions.selectConfessionByID.run(interaction.data.options[0].value)
                if (confession_id && guild_id === interaction.guild_id)
                {
                    const sender = guild.members.cache.get(author_id);
                    reply(interaction, `Confession ID: **\`${confession_id}\`**
                        \nContent: **\`${content}\`**
                        \nSent By: **\`${sender ? sender.tag : "Someone not in the server"} (ID: ${author_id})\`**
                        \nDate/Time: **\`${timeanddate}\`**`, client)
                }
                else reply(interaction, `Error: Can't find that confession! Please check the confession ID`, client)
            }
        }
    }
}