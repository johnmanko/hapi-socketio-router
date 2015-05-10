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


                        socket.on('disconnect', function (data) {
                            console.log('user disconnected from '  + socket.nsp.name);
                        });

                        console.log('user connection to '  + socket.nsp.name);

                    }
                }
            ]
        }
    ];

As you can see, the module is defined as an array of configurations by namespace.  This allows you to put all your namespaces into a single file, or you can break them out into individual files.

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

Specification
-------------

### Valid options ###

Valid `options` which are passed to the plugin include the following.  Please see [glob](https://github.com/isaacs/node-glob) for details on glob specific options.

1. `cwd` - (optional) Instructs the plugin to change to this directory, otherwise load namespace files from project root + `namespaces` path parameter.  This is passed to `glob`.
2. `ignore` - (optional) Another glob option. 
3. `options` - (optional) [Socket.io options](http://socket.io/docs/server-api/#) that will be passed to the socket initialization.
4. `namespaces` - (required) A glob path to namespace files.  Example: `socket/*.js`.  Also, see `doc/example.js` for a namespace file example.  

### Namespace files ###

Namespace files are defined as an array of objects. 

    module.exports = [
        {
            namespace: "/some-namespace",
            events: [
                {
                    event: "connection",
                    handler: function (socket) {

                        // YOUR SOCKET STUFF HERE

                    }
                },
                {
                    event: "disconnection",
                    handler: function (socket) {

                        // YOUR SOCKET STUFF HERE

                    }
                },
                {
                    event: "some-other-event",
                    handler: function (socket) {

                        // YOUR SOCKET STUFF HERE

                    }
                }
            ]
        },
        {
            namespace: "/some-namespace-2",
            events: [....]
        }
    ];