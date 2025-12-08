// pages/appeal/appeal.js
Page({
  data: { id: '', reason: '' },

  onLoad(query) {
    this.setData({ id: query.id || '' });
  },
  onReasonInput(e) { this.setData({ reason: e.detail.value }); },
  onCancel() { wx.navigateBack(); },

  onSubmit() {
    const id = this.data.id;
    const reason = (this.data.reason || '').trim();
    if (!reason) { wx.showToast({ title: '请输入申诉理由', icon: 'none' }); return; }
    try {
      const orders = wx.getStorageSync('orders') || [];
      const idx = orders.findIndex(o => o.id === id);
      if (idx > -1) {
        const o = { ...orders[idx], appealed: true, appealReason: reason };
        orders[idx] = o;
        wx.setStorageSync('orders', orders);
      }
    } catch (e) {}
    wx.showToast({ title: '已提交申诉', icon: 'success' });
    setTimeout(()=>{ wx.navigateBack(); }, 400);
  }
});

