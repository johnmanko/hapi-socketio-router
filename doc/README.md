hapi-socketio-router
====================

About
-----

A hapi plugin for socket.io that accepts an array of JSON definitions of namespace/events to register with socket.io.  Great for modularizing your namespace definitions.

This plugin was inspired by [hapi-router](https://www.npmjs.com/package/hapi-router) by [@bsiddiqui](https://www.npmjs.com/~bsiddiqui).  In fact, it borrows from his code. ;)  Thank you,bsiddiqui!

Installation
------------

    npm install hapi-socketio-router

Usage
-----

First, let's create a directory with registration modules.  For instance, if we have `socket/chat.js` and `socket/something-else.js`, the `chat.js` might look like: 

`socket/chat.js`

    module.exports = [
        {
            namespace: "/chat",
            events: [
                {
                    event: "connection",
                    handler: function (socket) {

                        socket.on('hello', function (data) {
                            console.log(data);
                            socket.emit("news", {message:'We got your request on namespace: ' + socket.nsp.name});
                        });

                        console.log('user connection to '  + socket.nsp.name);

                    }
                },
                {
                    event: "disconnection",
                    handler: function (socket) {

                        /* access namespace */
                        var nsp = socket.nsp;

                        nsp.emit('user disconnected from ' + nsp.name);
                    }
                }
            ]
        }
    ];

As you can, the module is defined as an array of configurations by namespace.  This allows you to put all your namespaces into a single file, or you can break them out into individual files.

Now, let's load our events:

    var server = new hapi.Server();
    server.connection({
        host: 'localhost',
        port: 3000,
        labels: 'primary',
        routes: {
            cors: {
                origin: ['*:*']
            }
        }
    });

    server.register(
        {
            register: require('hapi-socketio-router'), 
            options: {options: {}, namespaces: 'socket/*.js'}
        }, 
        {select: "primary"}, 
        function (err) {
            if (err) {
                console.log(err);
                throw err;   
            }
        }
    );

