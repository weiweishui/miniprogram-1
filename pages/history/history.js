// pages/history/history.js
Page({
    data: {
      historyList: []
    },
  
    onLoad: function() {
      this.loadHistoryData();
    },
  
    onShow: function() {
      // 每次页面显示时重新加载数据
      this.loadHistoryData();
    },
  
    // 加载历史记录
    loadHistoryData: function() {
      const history = wx.getStorageSync('questionHistory') || [];
      console.log('加载历史记录：', history); // 调试用
      this.setData({
        historyList: history
      });
    },
  
    // 查看详情
    viewDetail: function(e) {
      const id = e.currentTarget.dataset.id;
      console.log('点击记录：', id); // 调试用
      wx.navigateTo({
        url: `/pages/chat/chat?id=${id}`
      });
    }
  });