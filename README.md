hapi-socketio-router
====================

About
-----

A hapi plugin for socket.io that accepts an array of JSON definitions of namespace/events to register with socket.io.  Great for modularizing your namespace definitions.

This plugin was inspired by [hapi-router](https://www.npmjs.com/package/hapi-router) by [@bsiddiqui](https://www.npmjs.com/~bsiddiqui).  In fact, it borrows from his code. ;)  Thank you,bsiddiqui!

Installation
------------

```bash
npm install hapi-socketio-router
```

Usage
-----

First, let's create a directory with registration modules.  For instance, if we have `socket/chat.js` and `socket/something-else.js`, the `chat.js` might look like: 

`socket/chat.js`

```js
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
```

As you can see, the module is defined as an array of configurations by namespace.  This allows you to put all your namespaces into a single file, or you can break them out into individual files.

Now, let's load our events:

```js
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
        options: {config: {}, namespaces: 'socket/*.js'}
    }, 
    {select: "primary"}, 
    function (err) {
        if (err) {
            console.log(err);
            throw err;   
        }
    }
);
```

Specification
-------------

### Valid options ###

Valid `options` which are passed to the plugin include the following.  Please see [glob](https://github.com/isaacs/node-glob) for details on glob specific options.

1. `cwd` - (deprecated) Instructs the plugin to change to this directory, otherwise load namespace files from project root + `namespaces` path parameter.  This is passed to `glob`.
2. `ignore` - (deprecated) Another glob option. 
3. `options` - (deprecated) [Socket.io options](http://socket.io/docs/server-api/#) that will be passed to the socket initialization.
4. `config` - (optional) Object representing all configuration options.
    1. `io` - (optional) Socket.IO related configuration.
        1. `server` - (optional) A Socket.IO object, not yet attached to the Hapi server.  By default the plugin creates it's own Socket.IO server.
        2. `options` - (optional) Options passed to Socket.IO's `Server#attach(srv:http#Server, opts:Object):Server` method.  Please see Socket.IO [documentation for `Server(opts:Object)`](http://socket.io/docs/server-api/#).  
    2. `glob` - (optional) Object representing glob options accepted by this plugin.  Those options are:
        1. `cwd` - (optional) Sets the working directory to search for namespace files. Defaults to process.cwd().
        2. `ignore` - (optional) Add a pattern or an array of patterns to exclude matches. Defaults to false.  See glob's [`Comments and Negation` documentation](https://www.npmjs.com/package/glob).
5. `namespaces` - (required) A glob path to namespace files.  Example: `socket/*.js`.  Also, see `doc/example.js` for a namespace file example.  
6. `debug` - (optional) Turns on debugging mode.  Default output goes to console.log()
7. `logger` - (optional) A callback function that overrides `debug`'s default console output.  Accepts a single string parameter.

Example plugin options

```js
var pluginOptions = {
    debug: true,
    logger: function(message) {console.log(message);},
    config: {
        io: {
            server: undefined, 
            options: {  
                serveClient: undefined, 
                path: undefined
            }
        },
        glob: {
            cwd: undefined, 
            ignore: undefined 
        }
    },
    namespaces: 'server/sockets/*.js'
};
hapiServer.register({register: require('hapi-socketio-router'), options: pluginOptions});
```



### Namespace files ###

Namespace files are defined as an array of objects. 

```js
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
```