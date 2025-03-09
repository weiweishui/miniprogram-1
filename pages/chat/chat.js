Page({
    data: {
      questionData: null,
      messages: [],
      inputValue: '',
      lastMessageId: '',
      isLoading: true,
      errorMsg: ''
    },
  
    onLoad: function(options) {
      try {
        console.log('页面加载，参数:', options);
        const history = wx.getStorageSync('questionHistory') || [];
        const questionData = history.find(item => item.id == options.id);
        
        if (questionData) {
          this.setData({
            questionData,
            messages: [{
              id: Date.now(),
              type: 'ai',
              content: '这是一张数学题，我能帮您分析和解答，请描述您的问题。'
            }],
            isLoading: false
          });
        } else {
          this.setData({
            errorMsg: '未找到问题数据',
            isLoading: false
          });
        }
      } catch (error) {
        console.error('加载错误:', error);
        this.setData({
          errorMsg: '加载失败: ' + error.message,
          isLoading: false
        });
      }
    },
  
    resetPage: function() {
      this.setData({
        errorMsg: '',
        isLoading: false
      });
      
      wx.navigateBack();
    },
  
    onInput: function(e) {
      this.setData({
        inputValue: e.detail.value
      });
    },
  
    sendMessage: function() {
      if (!this.data.inputValue.trim()) return;
      
      const userMsg = {
        id: Date.now(),
        type: 'user',
        content: this.data.inputValue
      };
      
      this.setData({
        messages: [...this.data.messages, userMsg],
        inputValue: '',
        lastMessageId: `msg-${userMsg.id}`
      });
      
      // 显示加载
      wx.showLoading({
        title: '思考中...',
        mask: true
      });
      
      // 调用通义千问 API
      this.callTongyi(userMsg.content)
        .then(response => {
          wx.hideLoading();
          
          const aiMsg = {
            id: Date.now(),
            type: 'ai',
            content: response
          };
          
          this.setData({
            messages: [...this.data.messages, aiMsg],
            lastMessageId: `msg-${aiMsg.id}`
          });
        })
        .catch(error => {
          wx.hideLoading();
          console.error('AI调用失败:', error);
          
          const aiMsg = {
            id: Date.now(),
            type: 'ai',
            content: '抱歉，AI服务暂时无法回应。错误: ' + error.message
          };
          
          this.setData({
            messages: [...this.data.messages, aiMsg],
            lastMessageId: `msg-${aiMsg.id}`
          });
        });
    },
    
    // 通义千问 API 调用
    callTongyi: function(prompt) {
      return new Promise((resolve, reject) => {
        try {
          console.log('开始调用通义千问，提示词:', prompt);
          
          if (!this.data.questionData || !this.data.questionData.imagePath) {
            reject(new Error('找不到图片'));
            return;
          }
          
          // 读取图片为 Base64
          wx.getFileSystemManager().readFile({
            filePath: this.data.questionData.imagePath,
            encoding: 'base64',
            success: res => {
              const base64Image = 'data:image/jpeg;base64,' + res.data;
              console.log('图片转Base64成功，长度:', base64Image.length);
              
              // 使用OpenAI兼容模式接口
              wx.request({
                url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
                method: 'POST',
                header: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer sk-b33f3d4555a749a5a553b52e969c1eb4`
                },
                data: {
                  model: "qwen2.5-vl-72b-instruct",  // 正确的模型名称
                  messages: [
                    {
                      role: "user",
                      content: [
                        {
                          type: "text",
                          text: "这是一道数学题，请帮我分析解题思路：" + prompt
                        },
                        {
                          type: "image_url",
                          image_url: {
                            url: base64Image
                          }
                        }
                      ]
                    }
                  ]
                },
                success: res => {
                  console.log('API响应:', res.data);
                  
                  if (res.statusCode !== 200) {
                    reject(new Error(`HTTP错误: ${res.statusCode}, ${JSON.stringify(res.data)}`));
                    return;
                  }
                  
                  if (res.data.error) {
                    reject(new Error(`API错误: ${JSON.stringify(res.data.error)}`));
                    return;
                  }
                  
                  if (res.data.choices && res.data.choices[0] && res.data.choices[0].message && 
                      res.data.choices[0].message.content) {
                    resolve(res.data.choices[0].message.content);
                  } else {
                    reject(new Error('返回数据格式错误: ' + JSON.stringify(res.data)));
                  }
                },
                fail: err => {
                  console.error('请求失败:', err);
                  reject(err);
                }
              });
            },
            fail: err => {
              console.error('读取图片失败:', err);
              reject(err);
            }
          });
        } catch (error) {
          console.error('整体处理出错:', error);
          reject(error);
        }
      });
    },
    
    previewImage: function() {
      if (this.data.questionData && this.data.questionData.imagePath) {
        wx.previewImage({
          urls: [this.data.questionData.imagePath]
        });
      }
    },
  
    // 生成练习题功能
    generateExercises: function() {
      wx.showLoading({
        title: '生成中...',
        mask: true
      });
      
      const prompt = "请根据这道题目生成一道类似的练习题，难度相近，但不要完全相同。包含题目和解答步骤。";
      
      this.callTongyi(prompt)
        .then(response => {
          wx.hideLoading();
          
          const aiMsg = {
            id: Date.now(),
            type: 'ai',
            content: response
          };
          
          this.setData({
            messages: [...this.data.messages, aiMsg],
            lastMessageId: `msg-${aiMsg.id}`
          });
        })
        .catch(error => {
          wx.hideLoading();
          console.error('生成练习题失败:', error);
          
          const aiMsg = {
            id: Date.now(),
            type: 'ai',
            content: '抱歉，生成练习题失败。错误: ' + error.message
          };
          
          this.setData({
            messages: [...this.data.messages, aiMsg],
            lastMessageId: `msg-${aiMsg.id}`
          });
        });
    }
  });