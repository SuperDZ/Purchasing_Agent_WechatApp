// pages/orderDetail/orderDetail.js
Page({
  data: { order: { products: [] } },

  onLoad(query) {
    const id = query.id;
    try {
      const orders = wx.getStorageSync('orders') || [];
      const order = orders.find(o => o.id === id) || { products: [] };
      this.setData({ order });
    } catch (e) {}
  },

  goAppeal() {
    const id = this.data.order.id;
    wx.navigateTo({ url: `/pages/appeal/appeal?id=${id}` });
  }
});

