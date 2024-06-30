async purchaseInventories(inventories: any[]) {
  //console.log('Purchasing inventories:', inventories);
  const keys = inventories.map((i) => `inventory:${i.inventory_id}`);
  const time = new Date().getTime();
  const args = [inventories.length, time.toString()];
  for (let i = 0; i < inventories.length; i++) {
    args.push(inventories[i].quantity.toString());
    args.push(inventories[i].price.toString());
  }
  const luaScript = `
    local numInventories = tonumber(ARGV[1])
    redis.log(redis.LOG_NOTICE, "Number of inventories: " .. numInventories)
    local current_time_ms = tonumber(ARGV[2])
    redis.log(redis.LOG_NOTICE, "Time: " .. current_time_ms)
    local inventories = {}

    for i = 1, numInventories do
        local quantity = tonumber(ARGV[2 * i + 1])
        redis.log(redis.LOG_NOTICE, "Quantity: " .. quantity)
        local price = tonumber(ARGV[2 * i + 2])
        redis.log(redis.LOG_NOTICE, "Price: " .. price)
        table.insert(inventories, { quantity = quantity, price = price })
    end

    for i = 1, #inventories do
        local start_time = redis.call("HGET", KEYS[i], "flash_sale_start_time")
        local end_time = redis.call("HGET", KEYS[i], "flash_sale_end_time")
        local flash_sale_quantity = redis.call("HGET", KEYS[i], "flash_sale_quantity")
        local price
        local quantity
        redis.call("SET", "check_flash_sale_ongoing:" .. KEYS[i], "0")
        if start_time and end_time and flash_sale_quantity then
            start_time = tonumber(start_time)
            end_time = tonumber(end_time)
            flash_sale_quantity = tonumber(flash_sale_quantity)
            local now = current_time_ms
            if now >= start_time and now <= end_time and flash_sale_quantity > 0 then        
                price = redis.call("HGET", KEYS[i], "flash_sale_price")
                if not price then
                    return 0
                end
                price = tonumber(price)

                quantity = flash_sale_quantity
                redis.call("SET", "check_flash_sale_ongoing:" .. KEYS[i], "1")                  
            end
        end

        local is_flash_sale_ongoing = redis.call("GET", "check_flash_sale_ongoing:" .. KEYS[i])

        if is_flash_sale_ongoing == "0" then
            price = redis.call("HGET", KEYS[i], "price")
            if not price then
                return 0
            end
            price = tonumber(price)

            quantity = redis.call("HGET", KEYS[i], "quantity")
            if not quantity then
                return 0
            end
            quantity = tonumber(quantity)
        end

        if inventories[i].price < price then
            return 0
        end

        if quantity < inventories[i].quantity then
            return 0
        end
    end

    for i = 1, #inventories do
        local check_flash_sale_ongoing = redis.call("GET", "check_flash_sale_ongoing:" .. KEYS[i])
        if check_flash_sale_ongoing == "1" then
            local quantity = redis.call("HGET", KEYS[i], "flash_sale_quantity")
            quantity = tonumber(quantity)
            quantity = quantity - inventories[i].quantity
            redis.call("HSET", KEYS[i], "flash_sale_quantity", tostring(quantity))
        elseif check_flash_sale_ongoing == "0" then
            local quantity = redis.call("HGET", KEYS[i], "quantity")
            quantity = tonumber(quantity)
            quantity = quantity - inventories[i].quantity
            redis.call("HSET", KEYS[i], "quantity", tostring(quantity))
        end
    end

    return 1`;

  // Gọi Lua script trên Redis
  const result = await this.redisClient.eval(
    luaScript,
    keys.length,
    ...keys,
    ...args,
  );
  if (result === 1) {
    return true;
  } else {
    throw new Error('Failed to purchase inventories');
  }
}

async returnInventories(inventories: any[]) {
  console.log('Returning inventories:', inventories);
  const keys = inventories.map((i) => `inventory:${i.inventory_id}`);
  const args = [inventories.length];
  for (let i = 0; i < inventories.length; i++) {
    args.push(inventories[i].quantity); // Thêm quantity vào args
  }

  const luaScript = `
    local numInventories = tonumber(ARGV[1])
    local inventories = {}
    
    for i = 1, numInventories do
        local inventory_id = KEYS[i]
        local quantity = tonumber(ARGV[i + 1]) -- Thay đổi vị trí của ARGV
        table.insert(inventories, { inventory_id = inventory_id, quantity = quantity })
    end

    for i = 1, #inventories do
        local quantity = redis.call("HGET", KEYS[i], "quantity")
        quantity = tonumber(quantity)
        quantity = quantity + inventories[i].quantity
        redis.call("HSET", KEYS[i], "quantity", tostring(quantity))
    end
    
    return 1
  `;

  // Gọi Lua script trên Redis
  const result = await this.redisClient.eval(
    luaScript,
    keys.length,
    ...keys,
    ...args,
  );
  if (result === 1) {
    return true;
  } else {
    throw new Error('Failed to return inventories');
  }
}