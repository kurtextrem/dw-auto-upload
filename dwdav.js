var Dwdav = (function() {
    'use strict';

    var request = require('request'),
        fs = require('fs'),
        instance;

    function init(config) {
        // Private functions and variables

        var instanceConfig = config;

        function getOpts() {
            return {
                baseUrl: 'https://' + instanceConfig.hostname + '/on/demandware.servlet/webdav/Sites/Cartridges/' + instanceConfig.version,
                uri: '/',
                auth: {
                    user: instanceConfig.username,
                    password: instanceConfig.password
                },
                strictSSL: false
            };
        }

        function putFile(filePath) {
            var req,
                promise,
                requestOptions = getOpts();

            requestOptions.uri = '/' + filePath.replace(/\\/g, '/');
            requestOptions.method = 'PUT';

            promise = new Promise(function(resolve, reject) {
                req = request(requestOptions, function(err, res, body) {
                    if (err) {
                        return reject(err);
                    }

                    if (res.statusCode >= 400) {
                        reject(new Error("http error status code: " + res.statusCode));
                    }

                    resolve(body);
                });

                if (filePath.indexOf('\\') !== -1)
                    fs.createReadStream(instanceConfig.cwd + '\\' + filePath).pipe(req);
                else
                    fs.createReadStream(instanceConfig.cwd + '/' + filePath).pipe(req);
            });

            promise.request = req;

            return promise;
        }

        return {
            // Public functions and variables

            putFile: putFile
        };
    }

    return {
        getInstance: function(config) {
            if (!instance) {
                instance = init(config);
            }

            return instance;
        }
    };
}());

module.exports = Dwdav;
