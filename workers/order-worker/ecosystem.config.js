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
    {
      name: "check-payment-worker", // Tên của worker
      script: "./check-payment.worker.js", // Đường dẫn đến file worker
      instances: 1, // Số lượng instance
      exec_mode: "fork", // Chế độ fork
      // env: {
      //   CHECK_INTERVAL: 60 * 1000, // Biến môi trường chung
      //   PAYMENT_PENDING_TIME: 10 * 60 * 1000, // Biến môi trường chung
      // },
    },
  ],
};
