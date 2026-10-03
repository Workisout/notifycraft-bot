const mc = require('minecraft-server-util');

async function estadoServer() {
    try {
        const res = await mc.status(process.env.SERVER_HOST, Number(process.env.SERVER_PORT), {timeout: 5000});    
    if (res.version.name.toLowerCase().includes('offline')) {
        return {activo: false, jugadores: 0};
    }
    return {activo: true, jugadores: res.players.online};
    } catch (err) {
        return {activo: false, jugadores: 0};
    }
}

module.exports = {estadoServer};