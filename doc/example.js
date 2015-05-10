module.exports = [
    {
        namespace: "/",
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
                    
                    console.log('user disconnected from '  + nsp.name);
                }
            }
        ]
    },
    
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

                    console.log('user disconnected from '  + nsp.name);
                }
            }
        ]
    }
];