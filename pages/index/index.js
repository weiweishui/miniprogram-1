// index.js
Page({
    data: {
      
    },
  
    onLoad: function() {
      console.log('首页加载');  // 用于调试
    },
  
    // 跳转到上传页面
    goToUpload: function() {
      console.log('点击上传按钮');  // 用于调试
      wx.navigateTo({
        url: '/pages/upload/upload',
        success: function() {
          console.log('跳转成功');
        },
        fail: function(error) {
          console.log('跳转失败', error);
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },
  
    // 跳转到历史记录
    goToHistory: function() {
      console.log('点击历史按钮');  // 用于调试
      wx.switchTab({
        url: '/pages/history/history',
        success: function() {
          console.log('跳转成功');
        },
        fail: function(error) {
          console.log('跳转失败', error);
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    }
  });