var SourceQuery = require('sourcequery');

const queryGameServer = async (host, port) => {
        var sq = new SourceQuery(1000); // 1000ms timeout

        const getInfo = () => {
            return new Promise((resolve, reject) => {
                sq.getInfo((err, info) => {
                    if (err) return reject(err);
                    resolve(info);
                });
            });
        };

        try {
            sq.open(host, port);
    
            const info = await getInfo();

            return info
        } catch (error) {
            console.error(`Error querying server ${host}:${port}:`, error.msg);
        } finally {
            sq.close();
        }
};


module.exports = 
{
    queryGameServer
}