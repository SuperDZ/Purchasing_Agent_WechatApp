// pages/index/index.js

// 模拟商品数据
const mockProducts = [
    {
      id: 1,
      name: "日本资生堂洗面奶",
      price: 89.00,
      image: "https://images.unsplash.com/photo-1526947420260-1d0d4d4c8d4f?auto=format&fit=crop&w=200&h=200&q=80",
      description: "深层清洁，温和不刺激，适合各种肌肤",
      category: "skincare"
    },
    {
      id: 2,
      name: "韩国兰芝隔离霜",
      price: 158.00,
      image: "https://images.unsplash.com/photo-1596462502278-24d35c6c4f5c?auto=format&fit=crop&w=200&h=200&q=80",
      description: "防晒隔离，保湿滋润，打造完美底妆",
      category: "beauty"
    },
    {
      id: 3,
      name: "澳洲Swisse维生素C",
      price: 128.00,
      image: "https://images.unsplash.com/photo-1526947420260-1d0d4d4c8d4f?auto=format&fit=crop&w=200&h=200&q=80", // Placeholder
      description: "增强免疫力，抗氧化，美白肌肤",
      category: "health"
    },
    {
      id: 4,
      name: "法国兰蔻小黑瓶精华",
      price: 799.00,
      image: "https://images.unsplash.com/photo-1596462502278-24d35c6c4f5c?auto=format&fit=crop&w=200&h=200&q=80", // Placeholder
      description: "核心修护，抗衰老，焕发年轻光彩",
      category: "skincare"
    },
    {
      id: 5,
      name: "美国MAC子弹头口红",
      price: 175.00,
      image: "https://images.unsplash.com/photo-1526947420260-1d0d4d4c8d4f?auto=format&fit=crop&w=200&h=200&q=80", // Placeholder
      description: "经典色号Ruby Woo，持久显色不脱妆",
      category: "beauty"
    },
    {
      id: 6,
      name: "德国双心深海鱼油",
      price: 99.00,
      image: "https://images.unsplash.com/photo-1596462502278-24d35c6c4f5c?auto=format&fit=crop&w=200&h=200&q=80", // Placeholder
      description: "高纯度EPA/DHA，呵护心脑血管健康",
      category: "health"
    },
    {
      id: 7,
      name: "意大利D&G The One香水",
      price: 580.00,
      image: "https://images.unsplash.com/photo-1526947420260-1d0d4d4c8d4f?auto=format&fit=crop&w=200&h=200&q=80", // Placeholder
      description: "经典东方木质调，性感迷人，持久留香",
      category: "fragrance"
    },
    {
      id: 8,
      name: "英国Superdrug维生素D3",
      price: 75.00,
      image: "https://images.unsplash.com/photo-1596462502278-24d35c6c4f5c?auto=format&fit=crop&w=200&h=200&q=80", // Placeholder
      description: "促进钙吸收，强健骨骼，提升免疫力",
      category: "health"
    },
    // 可以添加更多商品...
  ];
  
  // 模拟初始订单数据
  const initialOrders = [
    {
      id: "ORD001",
      date: "2023-05-15",
      products: [
        { name: "日本资生堂洗面奶", quantity: 1, price: 89.00 },
        { name: "韩国兰芝隔离霜", quantity: 1, price: 158.00 }
      ],
      total: 247.00,
      status: "已发货"
    },
    {
      id: "ORD002",
      date: "2023-06-20",
      products: [
        { name: "澳洲Swisse维生素C", quantity: 2, price: 128.00 }
      ],
      total: 256.00,
      status: "已完成"
    }
  ];
  
  Page({
  
    /**
     * 页面的初始数据
     */
    data: {
      currentTab: 'products', // 当前显示的 Tab ('products', 'cart', 'orders')
      currentCategory: 'all',  // 当前筛选的分类
      searchTerm: '',          // 搜索关键词
      products: [],            // 所有商品列表
      displayedProducts: [],   // 经过筛选和搜索后显示的商品列表
      cart: [],                // 购物车列表
      orders: [],              // 订单列表
      cartTotal: 0,            // 购物车总价
      cartItemCount: 0         // 购物车商品总数量
    },
  

    enrichCartItem(item) {
        const subtotal = item.price * item.quantity;
        return {
          ...item,
          subtotalStr: `¥${subtotal.toFixed(2)}`
        };
      },
    
      /**
       * 辅助函数：处理整个购物车数组，添加 subtotalStr
       */
      enrichCartItems(cartItems) {
        return cartItems.map(item => this.enrichCartItem(item));
      },
    
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 初始化商品数据
        this.setData({
          products: mockProducts,
          displayedProducts: mockProducts, // 初始显示所有商品
          orders: initialOrders // 初始化订单
        });
        // 从本地存储加载购物车数据（如果有的话）
        this.loadCartFromStorage();
        // 计算初始购物车统计 (calculateCartStats 内部也会调用 enrich)
        // this.calculateCartStats();
      },
  
    /**
     * 从本地存储加载购物车
     */
    loadCartFromStorage() {
        try {
          const cartData = wx.getStorageSync('cart');
          if (cartData) {
            // 加载时也进行 enrich
            const enrichedCart = this.enrichCartItems(cartData);
            this.setData({
              cart: enrichedCart
            }, () => {
              this.calculateCartStats(); // 确保统计数据也更新
            });
          }
        } catch (e) {
          console.error("加载购物车失败:", e);
        }
      },
  
  /**
   * 将购物车保存到本地存储 (只保存原始数据，不含 subtotalStr)
   */
  saveCartToStorage() {
    try {
      // 保存时不保存 subtotalStr，只保存必要的数据
      const cartToSave = this.data.cart.map(item => {
        const { subtotalStr, ...rest } = item; // 使用解构移除 subtotalStr
        return rest;
      });
      wx.setStorageSync('cart', cartToSave);
    } catch (e) {
      console.error("保存购物车失败:", e);
    }
  },
  
  /**
   * 计算购物车总价和数量
   */
  calculateCartStats() {
    let total = 0;
    let count = 0;
    this.data.cart.forEach(item => {
      total += item.price * item.quantity;
      count += item.quantity;
    });
    this.setData({
      cartTotal: parseFloat(total.toFixed(2)),
      cartItemCount: count
    });
  },
  
    /**
     * 切换底部 Tab
     */
    switchTab(e) {
      const tab = e.currentTarget.dataset.tab;
      this.setData({
        currentTab: tab
      });
    },
  
    /**
     * 点击分类项
     */
    onCategoryTap(e) {
      const category = e.currentTarget.dataset.category;
      this.setData({
        currentCategory: category
      });
      this.applyFilters(); // 应用新的分类筛选
    },
  
    /**
     * 输入框内容改变
     */
    onSearchInput(e) {
      const value = e.detail.value;
      this.setData({
        searchTerm: value
      });
      // 可以在这里添加防抖逻辑，或者在用户停止输入后再调用 applyFilters
      // 简单起见，实时过滤
      this.applyFilters();
    },
  
    /**
     * 应用分类和搜索筛选
     */
    applyFilters() {
      const category = this.data.currentCategory;
      const term = this.data.searchTerm.toLowerCase().trim();
  
      let result = this.data.products;
  
      // 按分类筛选
      if (category !== 'all') {
        result = result.filter(p => p.category === category);
      }
  
      // 按名称或描述搜索
      if (term) {
        result = result.filter(p =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
        );
      }
  
      this.setData({
        displayedProducts: result
      });
    },
  

  /**
   * 添加商品到购物车
   */
  addToCart(e) {
    const productId = e.currentTarget.dataset.id;
    const productToAdd = this.data.products.find(p => p.id === productId);

    if (!productToAdd) {
      console.warn("未找到ID为", productId, "的商品");
      return;
    }

    const cart = this.data.cart;
    const existingItemIndex = cart.findIndex(item => item.id === productId);

    let newCart;
    if (existingItemIndex > -1) {
      // 商品已在购物车，增加数量
      const updatedItem = {
        ...cart[existingItemIndex],
        quantity: cart[existingItemIndex].quantity + 1
      };
      // enrich 更新后的项
      const enrichedUpdatedItem = this.enrichCartItem(updatedItem);
      newCart = [...cart];
      newCart[existingItemIndex] = enrichedUpdatedItem;
    } else {
      // 新商品加入购物车
      const newItem = { ...productToAdd, quantity: 1 };
      // enrich 新项
      const enrichedNewItem = this.enrichCartItem(newItem);
      newCart = [...cart, enrichedNewItem];
    }

    this.setData({
      cart: newCart
    }, () => {
      this.calculateCartStats();
      this.saveCartToStorage();
      wx.showToast({
        title: `已添加 ${productToAdd.name}`,
        icon: 'success',
        duration: 1500
      });
    });
  },

  /**
   * 更改购物车商品数量
   */
  changeQuantity(e) {
    const productId = e.currentTarget.dataset.id;
    const delta = parseInt(e.currentTarget.dataset.delta);

    const cart = this.data.cart;
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex === -1) return;

    const currentItem = cart[itemIndex];
    const newQuantity = currentItem.quantity + delta;

    let newCart;
    if (newQuantity <= 0) {
      // 数量减到0或以下，则移除商品
      newCart = cart.filter(item => item.id !== productId);
    } else {
      // 更新数量
      const updatedItem = { ...currentItem, quantity: newQuantity };
      // enrich 更新后的项
      const enrichedUpdatedItem = this.enrichCartItem(updatedItem);
      newCart = [...cart];
      newCart[itemIndex] = enrichedUpdatedItem;
    }

    this.setData({
      cart: newCart
    }, () => {
      this.calculateCartStats();
      this.saveCartToStorage();
    });
  },

  /**
   * 从购物车移除商品
   */
  removeFromCart(e) {
    const productId = e.currentTarget.dataset.id;
    const newCart = this.data.cart.filter(item => item.id !== productId);

    this.setData({
      cart: newCart
    }, () => {
      this.calculateCartStats();
      this.saveCartToStorage();
      wx.showToast({
        title: '已移除',
        icon: 'none',
        duration: 1000
      });
    });
  },

  /**
   * 结算
   */
  checkout() {
    if (this.data.cart.length === 0) {
      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      });
      return;
    }

    // 1. 准备订单中的商品列表，包含 subtotalStr
    const enrichedOrderProducts = this.data.cart.map(item => ({
      ...item, // 包含 name, quantity, price 等
      // 注意：这里的 item.subtotalStr 已经在购物车中计算好了
      // 但我们也可以在这里重新计算以确保一致性（虽然不是必须的，因为购物车已经是 enriched 的）
      // 为了清晰，我们还是基于 price 和 quantity 计算一次
      subtotalStr: `¥${(item.price * item.quantity).toFixed(2)}`
    }));

    // 2. 计算订单总金额 (使用 cart 中的数据，因为它是准确的源)
    const orderTotal = this.data.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // 3. 生成订单 ID 和日期
    const newOrderId = `ORD${String(this.data.orders.length + 1).padStart(3, '0')}`;
    const currentDate = new Date().toLocaleDateString('zh-CN'); // 或者使用 'yyyy-MM-dd' 格式

    // 4. 创建新订单对象，包含格式化的总金额字符串
    const newOrder = {
      id: newOrderId,
      date: currentDate,
      // 5. 使用包含 subtotalStr 的商品列表
      products: enrichedOrderProducts, 
      // 6. 格式化订单总金额
      totalStr: `¥${orderTotal.toFixed(2)}`, 
      total: parseFloat(orderTotal.toFixed(2)), // 保留数字版本以便可能的排序/计算
      status: "待付款"
    };

    // 7. 更新订单列表
    const updatedOrders = [newOrder, ...this.data.orders];

    // 8. 清空购物车并更新 UI
    this.setData({
      cart: [], // 清空时不需要 enrich
      orders: updatedOrders,
      currentTab: 'orders'
    }, () => {
      this.calculateCartStats(); // 会将 cartTotal 设为 0
      this.saveCartToStorage();
      wx.showToast({
        title: `订单 ${newOrderId} 已提交`,
        icon: 'success',
        duration: 2000
      });
    });
  },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    // onReady() {},
  
    /**
     * 生命周期函数--监听页面显示
     */
    // onShow() {},
  
    /**
     * 生命周期函数--监听页面隐藏
     */
    // onHide() {},
  
    /**
     * 生命周期函数--监听页面卸载
     */
    // onUnload() {},
  
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    // onPullDownRefresh() {},
  
    /**
     * 页面上拉触底事件的处理函数
     */
    // onReachBottom() {},
  
    /**
     * 用户点击右上角分享
     */
    // onShareAppMessage() {}
  })