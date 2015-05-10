'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var socket = require('socket.io');

exports.register = function (server, options, next) {
    
    var globOptions = {
        nodir: true,
        strict: true,
        cwd: options.cwd || process.cwd(),
        ignore: options.ignore
    };

    var files = glob.sync(options.namespaces, globOptions);

    var io = socket.listen(server.listener, options.options);

    files.forEach(function (file) {

        var namespaces = require(globOptions.cwd + '/' + file);

        if (!Array.isArray(namespaces) || namespaces.length === 0) {
            return;
        }

        namespaces.forEach(function (namespace) {
            
            if (!namespace.namespace || !Array.isArray(namespace.events) || namespace.events.length === 0) {
                return;
            }
            
            var events = namespace.events;
            
            events.forEach(function(event) {
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
