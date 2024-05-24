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
        children: [
          {
            category_name: 'Áo sơ mi trắng',
            level: 2,
          },
          {
            category_name: 'Áo sơ mi đen',
            level: 2,
          },
          {
            category_name: 'Áo sơ mi xanh',
            level: 2,
          },
        ],
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
        path: '/4/41',
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
];
