require("dotenv").config();
const express = require("express");
const http = require("http"); // To create HTTP server
const { Server } = require("socket.io"); // To create Socket.IO server (npm install socket.io)
const cors = require("cors"); // To handle CORS (npm install cors)
const db = require("./db"); // MySQL connection (make sure to set up db.js with your MySQL credentials)


const app = express();
const server = http.createServer(app); // Create HTTP server

// Initialize Socket.IO server with CORS settings
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());



// 👇 CONNECT THE ROUTE
app.use("/messages", require("./routes/message"));

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", (data) => {
    const { sender_id, receiver_id, message } = data;

    // Save to MySQL
    db.query(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
      [sender_id, receiver_id, message]
    );

    // Emit to receiver
    io.emit("receiveMessage", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});



const PORT =  6000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
