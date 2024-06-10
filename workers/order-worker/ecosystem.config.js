module.exports = {
  apps: [
    {
      name: "save-order-redis-worker", // Tên của worker
      script: "./save-order-redis.worker.js", // Đường dẫn đến file worker
      instances: 2, // Số lượng instance
      exec_mode: "cluster", // Chế độ cluster
      env: {
        QUEUE_PREFIX: "order_queue_", // Biến môi trường chung
      },
    },
  ],
};
