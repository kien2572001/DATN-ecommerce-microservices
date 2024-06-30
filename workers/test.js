function getShardIndex(inputString, numShards = 4) {
  // Lấy ký tự cuối cùng của chuỗi
  const lastChar = inputString.slice(-1);

  // Kiểm tra xem ký tự cuối là số hay chữ cái
  let charValue;
  if (/\d/.test(lastChar)) {
    // Nếu là số, chuyển đổi thành số nguyên
    charValue = parseInt(lastChar, 10);
  } else {
    // Nếu là chữ cái, chuyển thành số thứ tự trong bảng chữ cái
    charValue = lastChar.toLowerCase().charCodeAt(0) - "a".charCodeAt(0) + 10;
  }

  // Tính toán chỉ số shard bằng phép chia lấy dư
  const shardIndex = charValue % numShards;

  return shardIndex + 1;
}

// Ví dụ
const inputString1 = "665da3604a49ed69a5c82486";
const inputString2 = "665da3604a49ed69a5c8248e";

console.log(getShardIndex(inputString1)); // Output sẽ là 1 (5 % 4 = 1)
console.log(getShardIndex(inputString2)); // Output sẽ là 2 (14 % 4 = 2, vì 'e' -> 14)
