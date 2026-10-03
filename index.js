require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const {estadoServer} = require('./minecraft');

const {Client, GatewayIntentBits, Events, Collection, EmbedBuilder} = require('discord.js');
const client = new Client({intents: [GatewayIntentBits.Guilds]});
client.commands = new Collection();

let estadoAnterior = null;

const archivos = fs.readdirSync(path.join(__dirname, 'commands')).filter((f) => f.endsWith('.js'));
for (const archivo of archivos) {
    const comando = require(path.join(__dirname, 'commands', archivo));

    client.commands.set(comando.data.name, comando);
}

async function revisarServer() {
    const {activo, jugadores} = await estadoServer();

    if (estadoAnterior !== null && activo !== estadoAnterior) {
        const canal = await client.channels.fetch(process.env.ID_CHANNEL);

        const embed = new EmbedBuilder()
            .setTitle(activo ? 'SERVIDOR ENCENDIDO' : 'SERVIDOR APAGADO')
            .setColor(activo ? 0x42FF7C : 0xFF4D56)
            .addFields(
                {name: 'Server:', value: `\`${process.env.SERVER_HOST}\``, inline: true},
                {name: 'Jugadores:', value: activo ? `${jugadores}` : '-', inline: true}
            )
            .setTimestamp();

        await canal.send({
            content: `<@&${process.env.ID_ROL}>`,
            embeds: [embed],
            allowedMentions: {
                roles: [process.env.ID_ROL]
            }
        });
        
        /* if (activo) {
            await canal.send(`server prendido: (${process.env.SERVER_HOST})`);
        } else {
            await canal.send(`server apagado: (${process.env.SERVER_HOST})`);
        } */
    }

    estadoAnterior = activo;
    console.log(`estado: ${activo ? 'encendido' : 'apagado'} (${jugadores} jugadores)`);
}

client.once(Events.ClientReady, async (c) => {
    console.log(`conectado ${c.user.tag}`);
    console.log(await estadoServer());

    const definiciones = client.commands.map((cmd) => cmd.data);
    await Promise.all(c.guilds.cache.map((guild) => guild.commands.set(definiciones)));
    console.log(`registrados ${definiciones.length} comandos`);

    await revisarServer();
    setInterval(revisarServer, 60 * 1000);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const comando = client.commands.get(interaction.commandName);
    if (!comando) return;

    try {
        await comando.execute(interaction);
    } catch (err) {
        console.error(err);
    }
});


client.login(process.env.DC_TOKEN);