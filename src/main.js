/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
    const {discount, quantity, sale_price} = purchase;
    return sale_price * quantity * (1 - discount / 100)
   // @TODO: Расчет выручки от операции
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    const {profit} = seller;
    if (index === 0) {
        return profit * 0.15
    } else if (index === 1 || index === 2) {
        return profit * 0.1
    }else if (index === total -1) {
        return 0;
    } else {
        return profit * 0.05
    }
    // @TODO: Расчет бонуса от позиции в рейтинге
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    const {calculateRevenue, calculateBonus} = options;

    if (!data || 
        !Array.isArray(data.sellers) ||
        !Array.isArray(data.products) ||
        !Array.isArray(data.purchase_records)
) {
    throw new Error("Некорректные входные данные")
}

  if (
    data.sellers.length === 0 ||
    data.products.length === 0 ||
    data.purchase_records.length === 0 
 ) { 
    throw new Error("Переданные коллекции пустые")
 }

 if (
    !options || 
    typeof calculateRevenue !== "function" ||
    typeof calculateBonus !== "function" 
 ) {
    throw new Error("В объекте options должны быть переданы функции calculateRevenue и calculateBonus.")
 }
   
    const sellerStats = data.sellers.map(seller => ({
   seller_id: seller.id,
   name: `${seller.first_name} ${seller.last_name}`,
   revenue: 0,
   profit: 0,
   sales_count: 0,
   products_sold: {}, 
}));

    

    const sellerIndex = Object.fromEntries(
    sellerStats.map((seller) => [seller.seller_id, seller])
  );

    const productIndex = Object.fromEntries(
    data.products.map((product) => [product.sku, product])
  );



  data.purchase_records.forEach((record) => {
    const seller = sellerIndex[record.seller_id]; 
    if (!seller) return; 

    
    seller.sales_count += 1;

    
    seller.revenue += record.total_amount;

    
    record.items.forEach((item) => {
      const product = productIndex[item.sku]; 
      if (!product) return; 

    
      const revenue = calculateRevenue(item, product);

      
      const profit = revenue - product.purchase_price * item.quantity;

    
      seller.profit += profit;

      
      if (!seller.products_sold[item.sku]) {
        seller.products_sold[item.sku] = 0;
      }
      seller.products_sold[item.sku] += item.quantity;
    });
  });

  
  sellerStats.sort((a, b) => b.profit - a.profit);

  
  sellerStats.forEach((seller, index) => {
    
    seller.bonus = options.calculateBonus(index, sellerStats.length, seller);

    
    seller.top_products = Object.entries(seller.products_sold)
      .map(([sku, quantity]) => ({
        sku,
        quantity,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  });

  
  return sellerStats.map((seller) => ({
    seller_id: seller.seller_id,
    name: seller.name,  
    revenue: +seller.revenue.toFixed(2),
    profit: +seller.profit.toFixed(2),
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: +seller.bonus.toFixed(2),
  }));
}
    // @TODO: Подготовка промежуточных данных для сбора статистики

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    // @TODO: Расчет выручки и прибыли для каждого продавца

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями

