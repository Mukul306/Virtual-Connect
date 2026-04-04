import { Server } from "socket.io"

// Authoritative state management
let connections = {}
let messages = {}
let userIdentities = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(`[Socket] Connection attempt: ${socket.id}`);

        socket.on("join-call", (path, username) => {
            console.log(`[Socket] ${username} joining room: ${path}`);

            if (!connections[path]) {
                connections[path] = [];
            }
            
            // Avoid duplicate additions
            if (!connections[path].includes(socket.id)) {
                connections[path].push(socket.id);
            }
            
            // Store the user identity securely mapped to their socket ID
            userIdentities[socket.id] = {
                name: username || "Guest",
                meetingCode: path
            };

            // Join the socket.io room for easier broadcasting if needed
            socket.join(path);

            // Prepare list of users for synchronized WebRTC initiation
            const usersInRoom = connections[path].map(sid => ({
                socketId: sid,
                username: userIdentities[sid] ? userIdentities[sid].name : "Guest"
            }));

            // Notify everyone in the room about the new joiner
            io.to(path).emit("user-joined", socket.id, usersInRoom);

            // Replay chat history for the new joiner
            if (messages[path]) {
                messages[path].forEach(msg => {
                    socket.emit("chat-message", msg.data, msg.sender, msg.socketIdSender);
                });
            }
        });

        socket.on("signal", (toId, message) => {
            // Securely forward WebRTC signaling packets
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data) => {
            const identity = userIdentities[socket.id];
            
            if (identity) {
                const room = identity.meetingCode;
                const senderName = identity.name;

                if (!messages[room]) {
                    messages[room] = [];
                }

                const messagePayload = { 
                    sender: senderName, 
                    data: data, 
                    socketIdSender: socket.id 
                };

                messages[room].push(messagePayload);
                
                // Keep history manageable (last 50 messages)
                if (messages[room].length > 50) messages[room].shift();

                console.log(`[Chat] ${room} | ${senderName}: ${data}`);

                // Broadcast to everyone in the room
                io.to(room).emit("chat-message", data, senderName, socket.id);
            }
        });

        socket.on("disconnect", () => {
            const identity = userIdentities[socket.id];
            
            if (identity) {
                const room = identity.meetingCode;
                console.log(`[Socket] ${identity.name} disconnected from ${room}`);

                // 1. Notify others in the same room
                io.to(room).emit('user-left', socket.id);

                // 2. Remove from connections record
                if (connections[room]) {
                    connections[room] = connections[room].filter(id => id !== socket.id);
                    
                    // Cleanup empty rooms
                    if (connections[room].length === 0) {
                        delete connections[room];
                        // Optionally keep messages for a while, or delete them
                        // delete messages[room]; 
                    }
                }

                // 3. Cleanup identity record
                delete userIdentities[socket.id];
            } else {
                console.log(`[Socket] Unregistered socket disconnected: ${socket.id}`);
            }
        });
    });

    return io;
};