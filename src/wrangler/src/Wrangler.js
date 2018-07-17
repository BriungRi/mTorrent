const internalIp = require('internal-ip');

module.exports = {
    makeMongod:  (filename, callback) => {
        const port = portscanner.findAPortNotInUse(3500, 4001, '127.0.0.1', function(error, port){
            console.log(port);
            exec("./../bin/mongod --port " + port + " --replSet \"" + filename + "\" --bind_ip_all");
            callback(port);
        });
    },

    getIp: (callback) => {
        internalIp.v4().then(ip => {
            callback(ip);
        });
    },


}


