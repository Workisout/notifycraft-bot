const {EmbedBuilder} = require('discord.js');
const {estadoServer} = require('../minecraft');

module.exports = {
    data: {
        name: 'estado',
        description: 'Muestra si el servidor está encendido',
    },
    async execute(interaction) {
        await interaction.deferReply();

        const {activo, jugadores} = await estadoServer();

        const embed = new EmbedBuilder()
            .setTitle(activo ? 'Servidor encendido' : 'Servidor apagado')
            .setColor(activo ? 0x42FF7C : 0xFF4D56)
            .addFields(
                {name: 'Server:', value: `\`${process.env.SERVER_HOST}\``, inline: true},
                {name: 'Jugadores:', value: activo ? `${jugadores}` : '-', inline: true}
            )
            .setTimestamp();

        /*
        if (activo) {
            await interaction.editReply(`server prendido con ${jugadores} personas jugando ahora mismo.`);
        } else {
            await interaction.editReply('server apagado.');
        } 
        */

        await interaction.editReply({embeds: [embed]});
    },
};