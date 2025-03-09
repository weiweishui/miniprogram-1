Page({
    data: {
      tempImagePath: ''
    },
  
    // 选择图片
    chooseImage: function() {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          console.log('选择图片成功：', res.tempFiles[0].tempFilePath);
          this.setData({
            tempImagePath: res.tempFiles[0].tempFilePath
          });
          // 选择图片后直接保存并跳转
          this.saveAndNavigate(res.tempFiles[0].tempFilePath);
        },
        fail: (error) => {
          console.error('选择图片失败：', error);
        }
      });
    },
  
    // 保存记录并跳转
    saveAndNavigate: function(imagePath) {
      wx.showLoading({
        title: '处理中...',
      });
  
      // 保存记录到本地存储
      const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        imagePath: imagePath,
        analysis: '正在分析中...'
      };
  
      try {
        const history = wx.getStorageSync('questionHistory') || [];
        wx.setStorageSync('questionHistory', [newRecord, ...history]);
  
        console.log('保存记录成功，准备跳转');
  
        // 跳转到聊天页面
        wx.navigateTo({
          url: `/pages/chat/chat?id=${newRecord.id}`,
          success: (res) => {
            console.log('跳转成功');
            wx.hideLoading();
          },
          fail: (error) => {
            console.error('跳转失败：', error);
            wx.hideLoading();
            wx.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
  
      } catch (error) {
        console.error('保存记录失败：', error);
        wx.hideLoading();
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      }
    }
  });