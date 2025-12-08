// pages/index/index.js

// 模拟商品数据（UTF-8 中文）
const mockProducts = [
  { id: 1, name: '水豚噜噜-抽拉毛绒笔袋(黄)（个）', price: 49.9, originalPrice:50.9, image: 'https://www.nbdeli.com/bocupload/product/140039812/1.jpg', description: '深层清洁，温和不刺激，适合各种肌肤', category: 'toys' },
  { id: 2, name: '黄山毛峰(明前)（500g）',   price: 300.0, originalPrice: 310.0, image: 'https://pic.rmb.bdstatic.com/bjh/news/464659f7185209c78966279299c65cb7.png', description: '防晒隔离，保湿滋润，打造完美底妆', category: 'foods' },
  { id: 3, name: '黄山毛峰(明后)（500g）', price: 240.0, originalPrice: 260.0, image: 'https://pic.rmb.bdstatic.com/bjh/news/464659f7185209c78966279299c65cb7.png', description: '增强免疫力，抗氧化，美白肌肤', category: 'foods' },
  { id: 4, name: '茶叶盒（简装）', price: 20.0, originalPrice: 20.0, image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fcbu01.alicdn.com%2Fimg%2Fibank%2FO1CN01GuaYgk1iVUZZV6d0i_%21%212461274418-0-cib.jpg&refer=http%3A%2F%2Fcbu01.alicdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1767770718&t=315d508a04293716c0a209da4605bbab', description: '每个最多可装500g茶叶', category: 'package' },
  { id: 5, name: '茶叶盒（精装）', price: 40.0, originalPrice: 40.0, image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fcbu01.alicdn.com%2Fimg%2Fibank%2FO1CN01GuaYgk1iVUZZV6d0i_%21%212461274418-0-cib.jpg&refer=http%3A%2F%2Fcbu01.alicdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1767770718&t=315d508a04293716c0a209da4605bbab', description: '每个最多可装500g茶叶', category: 'package' },
];

Page({
  data: {
    currentTab: 'products',
    currentCategory: 'all',
    searchTerm: '',
    products: [],
    displayedProducts: [],
    cart: [],
    orders: [],
    cartTotal: 0,
    cartTotalStr: '¥0.00',
    cartItemCount: 0,
  },

  onLoad() {
    const products = mockProducts.map(p => ({
      ...p,
      priceStr: `¥${Number(p.price).toFixed(2)}`,
      originalPriceStr: `¥${Number((p.originalPrice ?? p.price)).toFixed(2)}`,
    }));
    this.setData({ products }, () => this.applyFilters());
    try {
      const cart = wx.getStorageSync('cart') || [];
      const orders = wx.getStorageSync('orders') || [];
      this.setData({ cart: this.enrichCartItems(cart), orders }, () => this.calculateCartStats());
    } catch (e) {}
  },

  onShow() {
    try {
      const cart = wx.getStorageSync('cart') || [];
      const orders = wx.getStorageSync('orders') || [];
      this.setData({ cart: this.enrichCartItems(cart), orders }, () => this.calculateCartStats());
    } catch (e) {}
  },

  // 补充展示字段
  enrichCartItem(item) {
    const subtotal = Number(item.price) * Number(item.quantity);
    return { ...item, priceStr: `¥${Number(item.price).toFixed(2)}`, subtotalStr: `¥${subtotal.toFixed(2)}` };
  },
  enrichCartItems(list) { return (list || []).map(i => this.enrichCartItem(i)); },

  saveCartToStorage() { try { wx.setStorageSync('cart', this.data.cart); } catch (e) {} },

  calculateCartStats() {
    let total = 0, count = 0;
    (this.data.cart || []).forEach(i => { total += Number(i.price) * Number(i.quantity); count += Number(i.quantity); });
    this.setData({ cartTotal: Number(total.toFixed(2)), cartItemCount: count, cartTotalStr: `¥${total.toFixed(2)}` });
  },

  switchTab(e) { this.setData({ currentTab: e.currentTarget.dataset.tab }); },
  onCategoryTap(e) { this.setData({ currentCategory: e.currentTarget.dataset.category }, this.applyFilters); },
  onSearchInput(e) { this.setData({ searchTerm: e.detail.value }, this.applyFilters); },

  applyFilters() {
    const { currentCategory, searchTerm, products } = this.data;
    const term = (searchTerm || '').toLowerCase().trim();
    let res = products;
    if (currentCategory !== 'all') res = res.filter(p => p.category === currentCategory);
    if (term) res = res.filter(p => (p.name + ' ' + p.description).toLowerCase().includes(term));
    this.setData({ displayedProducts: res });
  },

  // 商品加入购物车
  addToCart(e) {
    const id = Number(e.currentTarget.dataset.id);
    const p = this.data.products.find(x => x.id === id);
    if (!p) return;
    const idx = this.data.cart.findIndex(x => x.id === id);
    let cart = [...this.data.cart];
    if (idx > -1) {
      cart[idx] = this.enrichCartItem({ ...cart[idx], quantity: cart[idx].quantity + 1 });
    } else {
      cart.push(this.enrichCartItem({ ...p, quantity: 1 }));
    }
    this.setData({ cart }, () => { this.calculateCartStats(); this.saveCartToStorage(); wx.showToast({ title: '已添加', icon: 'success' }); });
  },

  // 变更数量（-1 或 +1）
  changeQuantity(e) {
    const id = Number(e.currentTarget.dataset.id);
    const delta = parseInt(e.currentTarget.dataset.delta);
    const idx = this.data.cart.findIndex(x => x.id === id);
    if (idx === -1) return;
    const cur = this.data.cart[idx];
    const q = Math.max(0, Number(cur.quantity) + delta);
    let cart = [...this.data.cart];
    if (q <= 0) cart = cart.filter(x => x.id !== id);
    else cart[idx] = this.enrichCartItem({ ...cur, quantity: q });
    this.setData({ cart }, () => { this.calculateCartStats(); this.saveCartToStorage(); });
  },

  removeFromCart(e) {
    const id = Number(e.currentTarget.dataset.id);
    const cart = this.data.cart.filter(x => x.id !== id);
    this.setData({ cart }, () => { this.calculateCartStats(); this.saveCartToStorage(); wx.showToast({ title: '已移除', icon: 'none' }); });
  },

  // 输入数量
  onQuantityInput(e) {
    const id = Number(e.currentTarget.dataset.id);
    const val = String(e.detail.value || '').replace(/[^0-9]/g, '');
    const num = Math.max(1, Math.min(999, parseInt(val || '1')));
    this.setQuantity(id, num, false);
  },
  onQuantityBlur(e) {
    const id = Number(e.currentTarget.dataset.id);
    const num = Math.max(1, Math.min(999, parseInt(e.detail.value || '1')));
    this.setQuantity(id, num, true);
  },
  setQuantity(id, num, persist = true) {
    const idx = this.data.cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    const item = this.enrichCartItem({ ...this.data.cart[idx], quantity: num });
    const cart = [...this.data.cart];
    cart[idx] = item;
    this.setData({ cart }, () => { this.calculateCartStats(); if (persist) this.saveCartToStorage(); });
  },

  // 左滑删除
  onCartTouchStart(e) { this._touchX = e.changedTouches[0].pageX; this._activeSwipeId = Number(e.currentTarget.dataset.id); },
  onCartTouchMove(e) {
    if (!this._activeSwipeId) return; const moveX = e.changedTouches[0].pageX; const delta = moveX - this._touchX;
    const idx = this.data.cart.findIndex(i => i.id === this._activeSwipeId); if (idx === -1) return;
    const cart = [...this.data.cart]; cart[idx] = { ...cart[idx], _swipeX: Math.max(-160, Math.min(0, delta / 2)) };
    this.setData({ cart });
  },
  onCartTouchEnd(e) {
    if (!this._activeSwipeId) return; const endX = e.changedTouches[0].pageX; const delta = endX - this._touchX;
    const idx = this.data.cart.findIndex(i => i.id === this._activeSwipeId); if (idx === -1) return;
    const open = delta < -60 ? -160 : 0; const cart = [...this.data.cart]; cart[idx] = { ...cart[idx], _swipeX: open };
    this.setData({ cart }); this._activeSwipeId = null; this._touchX = 0;
  },

  // 结算：进入结算页
  checkout() {
    if ((this.data.cart || []).length === 0) { wx.showToast({ title: '购物车是空的', icon: 'none' }); return; }
    const snap = this.data.cart; const total = this.data.cartTotal;
    wx.navigateTo({ url: '/pages/checkout/checkout', success: (res) => { res.eventChannel.emit('cartData', { cart: snap, total }); } });
  },

  openOrderDetail(e) { const id = e.currentTarget.dataset.id; wx.navigateTo({ url: `/pages/orderDetail/orderDetail?id=${id}` }); },
});

