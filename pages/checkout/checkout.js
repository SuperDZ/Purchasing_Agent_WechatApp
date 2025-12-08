// pages/checkout/checkout.js
Page({
  data: {
    cart: [],
    total: 0,
    totalStr: '¥0.00'
  },

  onLoad() {
    const channel = this.getOpenerEventChannel && this.getOpenerEventChannel();
    if (channel && channel.on) {
      channel.on('cartData', ({ cart, total }) => {
        const enriched = (cart || []).map(it => ({
          ...it,
          priceStr: `¥${Number(it.price).toFixed(2)}`,
          subtotalStr: `¥${(Number(it.price) * Number(it.quantity)).toFixed(2)}`
        }));
        this.setData({ cart: enriched, total, totalStr: `¥${Number(total).toFixed(2)}` });
      });
    }
    // 兜底：从本地读取
    try {
      if (this.data.cart.length === 0) {
        const cart = (wx.getStorageSync('cart') || []).map(it => ({
          ...it,
          priceStr: `¥${Number(it.price).toFixed(2)}`,
          subtotalStr: `¥${(Number(it.price) * Number(it.quantity)).toFixed(2)}`
        }));
        const t = cart.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
        this.setData({ cart, total: parseFloat(t.toFixed(2)), totalStr: `¥${t.toFixed(2)}` });
      }
    } catch (e) {}
  },

  onBackTap() {
    wx.showModal({
      title: '提示',
      content: '是否取消订单？',
      cancelText: '否',
      confirmText: '是',
      success: (res) => {
        if (res.confirm) {
          // 不记录订单，返回购物车（购物车原样保留）
          wx.navigateBack();
        }
      }
    });
  },

  confirmOrder() {
    const cart = this.data.cart;
    if (!cart || cart.length === 0) {
      wx.showToast({ title: '没有可提交的商品', icon: 'none' });
      return;
    }
    // 生成订单
    const now = new Date();
    const id = `ORD${now.getTime().toString().slice(-8)}`;
    const products = cart.map(it => ({ name: it.name, quantity: it.quantity, price: it.price, priceStr: `¥${Number(it.price).toFixed(2)}`, subtotalStr: `¥${(Number(it.price)*Number(it.quantity)).toFixed(2)}` }));
    const total = cart.reduce((s,i)=>s+i.price*i.quantity,0);
    const order = { id, date: `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}`, products, total: parseFloat(total.toFixed(2)), totalStr:`¥${total.toFixed(2)}`, status: '待处理', appealed: false };

    // 存储到本地 orders，并清空购物车
    try {
      const orders = wx.getStorageSync('orders') || [];
      orders.unshift(order);
      wx.setStorageSync('orders', orders);
      wx.setStorageSync('cart', []);
    } catch (e) {}

    wx.showToast({ title: '下单成功', icon: 'success' });
    // 返回上一页（Index）
    setTimeout(()=>{ wx.navigateBack(); }, 400);
  }
});
