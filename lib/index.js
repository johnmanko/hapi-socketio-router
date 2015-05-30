'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var _ = require('lodash');

exports.register = function (server, options, next) {

    var ID = "HAPI-SOCKETIO-ROUTER: ";
    
    var globOptions = {
        nodir: true,
        strict: true
    };

    var socket;
    var listenerOptions = {};
    var debug = false;
    var logger = function(message){
        console.log(message);
    };

    if (_.has(options, 'debug')) {
        debug = (options.debug === true);
    }
    
    if (_.has(options, 'logger') && _.isFunction(options.logger)) {
        logger = options.logger;
    }
    
    if (_.has(options, 'config')) {
        
        if (debug) {
            logger(ID + "Parsing config");
        }
        
        if (_.has(options, 'config.glob.cwd')) {
            if (debug) {
                logger(ID + "Parsing config.glob.cwd");
            }
            globOptions.cwd = options.config.glob.cwd;
        }

        if (_.has(options, 'config.glob.ignore')) {
            if (debug) {
                logger(ID + "Parsing config.glob.ignore");
            }
            globOptions.ignore = options.config.glob.ignore;
        }

        if (_.has(options, 'config.io.server')) {
            if (debug) {
                logger(ID + "Parsing config.io.server");
            }
            socket = options.config.io.server;
        }

        if (_.has(options, 'config.io.options')) {
            if (debug) {
                logger(ID + "Parsing config.io.options");
            }
            listenerOptions = options.config.io.options;
        }

    } else {

        if (_.has(options, 'options')) {
            listenerOptions = options.options;
        }

        if (_.has(options, 'cwd')) {
            globOptions.cwd = options.cwd;
        }
        
        if (_.has(options, 'ignore')) {
            globOptions.ignore = options.ignore;
        }

    }

    /* Defaults Start */
        if (!globOptions.cwd) {
        if (debug) {
            logger(ID + "Defaulting glod cwd");
        }
        globOptions.cwd = process.cwd();
    }

    if (!socket) {
        if (debug) {
            logger(ID + "Creating new Socket.IO server");
        }
        socket = require('socket.io');
    }
    /* Defaults End */

    
    if (debug) {
        logger(ID + "Glob options: " + JSON.stringify(globOptions));
        logger(ID + "Namespaces pattern: " + JSON.stringify(options.namespaces));
        logger(ID + "Socket.IO options: " + JSON.stringify(listenerOptions));
    }
        
    var files = glob.sync(options.namespaces, globOptions);

    if (debug) {
        logger(ID + "Attaching Hapi to Socket.IO");
    }
    var io = socket.listen(server.listener, listenerOptions);

    files.forEach(function (file) {

        var namespaces = require(globOptions.cwd + '/' + file);

        if (!Array.isArray(namespaces) || namespaces.length === 0) {
            if (debug) {
                logger(ID + "No Namespace files found");
            }
            return;
        }

        namespaces.forEach(function (namespace) {
            
            if (!namespace.namespace || !Array.isArray(namespace.events) || namespace.events.length === 0) {
                return;
            }
            
            if (debug) {
                logger(ID + "Found Namespace '" + namespace.namespace + "'");
            }

            var events = namespace.events;

            events.forEach(function (event) {
                if (debug) {
                    logger(ID + "Registering Event '" + event.event + "' on Namespace '" + namespace.namespace + "'");
                }
                io.of(namespace.namespace).on(event.event, event.handler);                
            });

        });

    });


    next();
};

exports.register.attributes = {
    multiple: false,
    pkg: require('../package.json')
};
