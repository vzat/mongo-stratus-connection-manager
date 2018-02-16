const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

let app = express();

const logger = require('../lib/logger');
const routes = require('../api/v1/routes');

module.exports = new Promise((resolve, reject) => {
    app.set('port', process.env.PORT || 4000);
    app.use(cors());
    app.use(bodyParser.json());
    app.use(morgan('combined'));

    // Debug only
    app.get('/', function (req, res) {
        res.end('Connection Manager Server');
    });

    app.use('/api/v1/internal', routes);

    const listen = app.listen(app.get('port'), function () {
        logger.log('info', 'Connection Manager Server running on port ' + app.get('port'));
    });

    listen.on('error', (err) => {
        logger.log('error', err);
        reject(err);
    });

    // Temp Create Single Node DB on Google Cloud Platform
    const googleCloudPlatform = require('../lib/cloud-platforms/google-cloud-platform');

    const serverData = {
        serverName: 'google-test',
        serverPort: '27017',
        rootUser: 'admin',
        rootPass: 'pass',
        mongoVersion: 'latest'
    };

    googleCloudPlatform.createSingleNodeDB('jsmith', 'us3', 'micro', 10, serverData);
    resolve(app);
});
