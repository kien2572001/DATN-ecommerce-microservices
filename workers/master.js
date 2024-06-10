// master.js

const { Worker } = require("worker_threads");

// Số lượng worker
const numWorkers = 2;

// Tạo và quản lý các worker
for (let i = 0; i < numWorkers; i++) {
  const worker = new Worker("./save-order-redis.worker.js");

  // Khi worker sẵn sàng, gửi message "start"
  worker.on("online", () => {
    console.log(`Worker ${i} is ready`);
    worker.postMessage({ message: "start", queue: `order_queue_${i}` });
  });

  // Xử lý kết quả và lỗi từ worker (nếu cần)
  // ...

  // Kết thúc worker (nếu cần)
  // ...
  worker.on("exit", (code) => {
    console.log(`Worker stopped with exit code ${code}`);
  });
}
