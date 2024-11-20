var SourceQuery = require('sourcequery');

const queryGameServerPlayers = async (host, port) => {
        var sq = new SourceQuery(1000); // 1000ms timeout

        const getPlayers = () => {
            return new Promise((resolve, reject) => {
                sq.getPlayers((err, players) => {
                    if (err) return reject(err);
                    resolve(players);
                });
            });
        };
        try {
            sq.open(host, port);
    
            const info = await getPlayers();
    
            return info
        } catch (error) {
            console.error('Error querying server:', error);
        } finally {
            sq.close();
        }
};


module.exports = 
{
    queryGameServerPlayers
}