interface Category {
  id?: number;
  category_name: string;
  path?: string;
  level: number;
  category_thumb?: string;
  children?: Category[];
}

export const categoriesSeedData: Category[] = [
  {
    category_name: 'Bách Hóa online',
    level: 0,
    category_thumb:
      'https://ecomerce-microservices-bk.s3.ap-southeast-1.amazonaws.com/product-service/categories/bach-hoa-online.png',
    children: [
      {
        category_name: 'Bánh kẹo',
        level: 1,
        children: [
          {
            category_name: 'Bánh ngọt',
            level: 2,
          },
          {
            category_name: 'Kẹo',
            level: 2,
          },
          {
            category_name: 'Bánh quy',
            level: 2,
          },
        ],
      },
      {
        category_name: 'Rau củ quả',
        level: 1,
        children: [
          {
            category_name: 'Rau xanh',
            level: 2,
          },
          {
            category_name: 'Củ',
            level: 2,
          },
          {
            category_name: 'Quả',
            level: 2,
          },
        ],
      },
      {
        category_name: 'Thực phẩm đóng hộp',
        level: 1,
        children: [
          {
            category_name: 'Mì ăn liền',
            level: 2,
          },
          {
            category_name: 'Sốt, gia vị',
            level: 2,
          },
          {
            category_name: 'Thực phẩm khô',
            level: 2,
          },
        ],
      },
    ],
  },
  {
    category_name: 'Máy tính & Laptop',
    level: 0,
    category_thumb:
      'https://ecomerce-microservices-bk.s3.ap-southeast-1.amazonaws.com/product-service/categories/may-tinh-laptop.png',
    children: [
      {
        id: 21,
        category_name: 'Laptop',
        level: 1,
        children: [
          {
            id: 211,
            category_name: 'Laptop Dell',
            level: 2,
          },
          {
            id: 212,
            category_name: 'Laptop Asus',
            level: 2,
          },
          {
            id: 213,
            category_name: 'Laptop HP',
            level: 2,
          },
        ],
      },
      {
        category_name: 'Máy tính để bàn',
        level: 1,
        children: [
          {
            category_name: 'PC Dell',
            level: 2,
          },
          {
            category_name: 'PC HP',
            level: 2,
          },
          {
            category_name: 'PC Lenovo',
            level: 2,
          },
        ],
      },
      {
        category_name: 'Linh kiện máy tính',
        level: 1,
        children: [
          {
            category_name: 'CPU',
            level: 2,
          },
          {
            category_name: 'RAM',
            level: 2,
          },
          {
            category_name: 'Ổ cứng SSD',
            level: 2,
          },
        ],
      },
    ],
  },
  {
    category_name: 'Thời trang nam',
    level: 0,
    category_thumb:
      'https://ecomerce-microservices-bk.s3.ap-southeast-1.amazonaws.com/product-service/categories/thoi-trang-name.png',
    children: [
      {
        category_name: 'Áo sơ mi',
        level: 1,
      },
      {
        category_name: 'Quần jeans',
        level: 1,
      },
      {
        category_name: 'Giày dép nam',
        level: 1,
        children: [
          {
            category_name: 'Giày thể thao',
            level: 2,
          },
          {
            category_name: 'Giày lười',
            level: 2,
          },
          {
            category_name: 'Giày công sở',
            level: 2,
          },
        ],
      },
    ],
  },
  {
    category_name: 'Thời trang nữ',
    level: 0,
    category_thumb:
      'https://ecomerce-microservices-bk.s3.ap-southeast-1.amazonaws.com/product-service/categories/thoi-trang-nu.png',
    children: [
      {
        category_name: 'Đầm dạ hội',
        level: 1,
        children: [
          {
            category_name: 'Đầm dạ hội đỏ',
            level: 2,
          },
          {
            category_name: 'Đầm dạ hội đen',
            level: 2,
          },
          {
            category_name: 'Đầm dạ hội xanh',
            level: 2,
          },
        ],
      },
      {
        category_name: 'Áo phông nữ',
        level: 1,
        children: [
          {
            category_name: 'Áo phông trắng',
            level: 2,
          },
          {
            category_name: 'Áo phông đen',
            level: 2,
          },
          {
            category_name: 'Áo phông xám',
            level: 2,
          },
        ],
      },
      {
        category_name: 'Túi xách nữ',
        level: 1,
        children: [
          {
            category_name: 'Túi xách đeo chéo',
            level: 2,
          },
          {
            category_name: 'Túi xách đeo vai',
            level: 2,
          },
          {
            category_name: 'Túi xách cầm tay',
            level: 2,
          },
        ],
      },
    ],
  },
  {
    category_name: 'Sắc đẹp',
    level: 0,
    category_thumb:
      'https://ecomerce-microservices-bk.s3.ap-southeast-1.amazonaws.com/product-service/categories/sac-dep.png',
    children: [
      {
        category_name: 'Trang điểm',
        level: 1,
        children: [
          {
            category_name: 'Son môi',
            level: 2,
          },
          {
            category_name: 'Phấn nền',
            level: 2,
          },
          {
            category_name: 'Mascara',
            level: 2,
          },
        ],
      },
      {
        category_name: 'Chăm sóc da',
        level: 1,
        children: [
          {
            category_name: 'Kem dưỡng da',
            level: 2,
          },
          {
            category_name: 'Sữa rửa mặt',
            level: 2,
          },
          {
            category_name: 'Mặt nạ',
            level: 2,
          },
        ],
      },
    ],
  },
  {
    category_name: 'Thể thao du lịch',
    level: 0,
    category_thumb:
      'https://ecomerce-microservices-bk.s3.ap-southeast-1.amazonaws.com/product-service/categories/the-thao-du-lich.png',
    children: [
      {
        category_name: 'Dụng cụ thể thao',
        level: 1,
        children: [
          {
            category_name: 'Bóng đá',
            level: 2,
          },
          {
            category_name: 'Bóng chuyền',
            level: 2,
          },
          {
            category_name: 'Cầu lông',
            level: 2,
          },
        ],
      },
      {
        category_name: 'Thiết bị du lịch',
        level: 1,
        children: [
          {
            category_name: 'Ba lô',
            level: 2,
          },
          {
            category_name: 'Lều trại',
            level: 2,
          },
          {
            category_name: 'Đèn pin',
            level: 2,
          },
        ],
      },
    ],
  },
  {
    category_name: 'Đồ chơi',
    level: 0,
    category_thumb:
      'https://ecomerce-microservices-bk.s3.ap-southeast-1.amazonaws.com/product-service/categories/do-choi.png',
    children: [
      {
        category_name: 'Đồ chơi trẻ em',
        level: 1,
        children: [
          {
            category_name: 'Đồ chơi giáo dục',
            level: 2,
          },
          {
            category_name: 'Đồ chơi xếp hình',
            level: 2,
          },
          {
            category_name: 'Đồ chơi búp bê',
            level: 2,
          },
        ],
      },
      {
        category_name: 'Đồ chơi ngoài trời',
        level: 1,
        children: [
          {
            category_name: 'Xe đạp trẻ em',
            level: 2,
          },
          {
            category_name: 'Cầu trượt',
            level: 2,
          },
          {
            category_name: 'Nhà bóng',
            level: 2,
          },
        ],
      },
    ],
  },
  {
    category_name: 'Đồng hồ',
    level: 0,
    category_thumb:
      'https://ecomerce-microservices-bk.s3.ap-southeast-1.amazonaws.com/product-service/categories/dong-ho.png',
    children: [
      {
        category_name: 'Đồng hồ nam',
        level: 1,
        children: [
          {
            category_name: 'Đồng hồ cơ',
            level: 2,
          },
          {
            category_name: 'Đồng hồ điện tử',
            level: 2,
          },
          {
            category_name: 'Đồng hồ thể thao',
            level: 2,
          },
        ],
      },
      {
        category_name: 'Đồng hồ nữ',
        level: 1,
        children: [
          {
            category_name: 'Đồng hồ thời trang',
            level: 2,
          },
          {
            category_name: 'Đồng hồ đính đá',
            level: 2,
          },
          {
            category_name: 'Đồng hồ dây da',
            level: 2,
          },
        ],
      },
    ],
  },
  {
    category_name: 'Sức khỏe',
    level: 0,
    category_thumb:
      'https://ecomerce-microservices-bk.s3.ap-southeast-1.amazonaws.com/product-service/categories/suc-khoe.png',
    children: [
      {
        category_name: 'Thực phẩm chức năng',
        level: 1,
        children: [
          {
            category_name: 'Vitamin',
            level: 2,
          },
          {
            category_name: 'Khoáng chất',
            level: 2,
          },
          {
            category_name: 'Thảo dược',
            level: 2,
          },
        ],
      },
      {
        category_name: 'Thiết bị y tế',
        level: 1,
        children: [
          {
            category_name: 'Máy đo huyết áp',
            level: 2,
          },
          {
            category_name: 'Máy đo đường huyết',
            level: 2,
          },
          {
            category_name: 'Nhiệt kế',
            level: 2,
          },
        ],
      },
    ],
  },
  {
    category_name: 'Nhà Sách online',
    level: 0,
    category_thumb:
      'https://ecomerce-microservices-bk.s3.ap-southeast-1.amazonaws.com/product-service/categories/nha-sach-online.png',
    children: [
      {
        category_name: 'Sách giáo khoa',
        level: 1,
        children: [
          {
            category_name: 'Tiểu học',
            level: 2,
          },
          {
            category_name: 'Trung học cơ sở',
            level: 2,
          },
          {
            category_name: 'Trung học phổ thông',
            level: 2,
          },
        ],
      },
      {
        category_name: 'Sách văn học',
        level: 1,
        children: [
          {
            category_name: 'Tiểu thuyết',
            level: 2,
          },
          {
            category_name: 'Truyện ngắn',
            level: 2,
          },
          {
            category_name: 'Thơ',
            level: 2,
          },
        ],
      },
      {
        category_name: 'Sách kỹ năng',
        level: 1,
        children: [
          {
            category_name: 'Kỹ năng sống',
            level: 2,
          },
          {
            category_name: 'Kỹ năng làm việc',
            level: 2,
          },
          {
            category_name: 'Kỹ năng giao tiếp',
            level: 2,
          },
        ],
      },
    ],
  },
];
