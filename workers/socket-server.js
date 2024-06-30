const http = require("http");
const socketIo = require("socket.io");
const express = require("express");
const Redis = require("ioredis");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// Kết nối Redis
const redisClient = new Redis({
  port: 6378, // Thay đổi nếu cần
  host: "localhost", // Thay đổi nếu cần
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (error) => {
  console.error("Redis connection error:", error);
});

// Lắng nghe sự kiện khi có kết nối từ client
io.on("connection", (socket) => {
  console.log("A user connected");

  // Lắng nghe sự kiện join để thêm client vào phòng cụ thể
  socket.on("joinOrderRoom", (orderId) => {
    const room = `order:${orderId}`;
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Lắng nghe sự kiện khi có kết nối từ Redis để xử lý tin nhắn từ hàng đợi
redisClient.on("message", async (channel, message) => {
  console.log(`Received message from Redis channel ${channel}: ${message}`);

  // Giả sử message có cấu trúc là một JSON object
  try {
    const data = JSON.parse(message);
    const { orderId, status } = data;

    // Gửi tin nhắn đến tất cả các client trong phòng tương ứng
    const room = `order:${orderId}`;
    io.to(room).emit("orderStatusUpdated", { orderId, status });
    console.log(`Sent orderStatusUpdated event to room ${room}`);
  } catch (error) {
    console.error("Error parsing message:", error);
  }
});

// Lắng nghe sự kiện khi có lỗi từ Redis
redisClient.on("error", (error) => {
  console.error("Redis error:", error);
});

// Đăng ký kênh "socket_queue" để nhận tin nhắn từ hàng đợi Redis
redisClient.subscribe("socket_queue", (err, count) => {
  if (err) {
    console.error("Error subscribing to Redis channel:", err);
  } else {
    console.log(
      `Subscribed to Redis channel: socket_queue (${count} subscribers)`
    );
  }
});

const PORT = 8051;
server.listen(PORT, () => {
  console.log(`Socket.IO server running at http://localhost:${PORT}/`);
});

module.exports = io;
