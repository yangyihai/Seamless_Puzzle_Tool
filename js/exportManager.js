/**
 * exportManager.js - 导出功能
 * 处理图片的保存和导出
 */

const ExportManager = {
    /**
     * 初始化导出管理器
     */
    init: function() {
        // 保存拼接图
        CONFIG.elements.saveImageBtn.addEventListener('click', this.saveImage);
    },
    
    /**
     * 保存当前拼接图
     */
    saveImage: function() {
        // 检查是否有图片可保存
        if (CONFIG.uploadedImages.length === 0) {
            alert('请先上传并拼接图片');
            return;
        }
        
        // 显示加载指示器
        CONFIG.elements.loadingOverlay.classList.add('visible');
        
        // 临时隐藏图层选中状态轮廓线
        document.querySelectorAll('.image-layer').forEach(layer => {
            layer.style.outline = 'none';
        });
        
        // 临时隐藏调整手柄
        document.querySelectorAll('.resize-handle').forEach(handle => {
            handle.style.display = 'none';
        });
        
        // 使用 html2canvas 捕获画布内容，保留羽化效果
        html2canvas(CONFIG.elements.canvasContainer, {
            backgroundColor: null,
            useCORS: true,
            scale: 2, // 提高输出图像质量
            allowTaint: true, // 允许加载跨域资源
            onclone: function(clonedDoc) {
                // 确保克隆的文档中也应用了样式
                const clonedLayers = clonedDoc.querySelectorAll('.image-layer');
                clonedLayers.forEach(layer => {
                    const imgElement = layer.querySelector('img');
                    const imageId = layer.id;
                    const imageObj = CONFIG.uploadedImages.find(img => img.id === imageId);
                    
                    if (imageObj && imgElement) {
                        // 应用羽化效果，但保持图片原始形状
                        let featherValue = parseInt(imageObj.featherValue);
                        imgElement.style.boxShadow = '0 0 ' + featherValue + 'px ' + featherValue + 'px rgba(255, 255, 255, 0.8)';
                        imgElement.style.mixBlendMode = imageObj.blendMode;
                        imgElement.style.opacity = imageObj.opacity / 100;
                        
                        // 移除圆角和模糊效果，保持图片原始外观
                        imgElement.style.borderRadius = '0';
                        imgElement.style.filter = 'none';
                    }
                });
            }
        }).then(function(canvas) {
            // 创建下载链接
            const link = document.createElement('a');
            link.download = '拼接图片_' + ExportManager.formatDate(new Date()) + '.png';
            
            // 转换为图片并设置链接
            canvas.toBlob(function(blob) {
                link.href = URL.createObjectURL(blob);
                
                // 隐藏加载指示器
                CONFIG.elements.loadingOverlay.classList.remove('visible');
                
                // 触发下载
                link.click();
                
                // 清理创建的对象URL
                setTimeout(() => URL.revokeObjectURL(link.href), 5000);
                
                // 恢复活动图层的轮廓和调整手柄显示
                if (CONFIG.activeImageId) {
                    const activeLayer = document.getElementById(CONFIG.activeImageId);
                    if (activeLayer) {
                        activeLayer.style.outline = '2px solid #4CAF50';
                    }
                }
                document.querySelectorAll('.resize-handle').forEach(handle => {
                    handle.style.display = 'block';
                });
            }, 'image/png');
        }).catch(function(error) {
            console.error('保存图片时发生错误:', error);
            alert('保存图片时发生错误: ' + error.message);
            CONFIG.elements.loadingOverlay.classList.remove('visible');
            
            // 恢复调整手柄显示
            document.querySelectorAll('.resize-handle').forEach(handle => {
                handle.style.display = 'block';
            });
        });
    },
    
    /**
     * 格式化日期为字符串 (YYYYMMDD_HHMMSS)
     * @param {Date} date - 日期对象
     * @return {string} 格式化后的日期字符串
     */
    formatDate: function(date) {
        return date.getFullYear() +
               this.pad(date.getMonth() + 1) +
               this.pad(date.getDate()) + '_' +
               this.pad(date.getHours()) +
               this.pad(date.getMinutes()) +
               this.pad(date.getSeconds());
    },
    
    /**
     * 数字补零
     * @param {number} number - 要补零的数字
     * @return {string} 补零后的字符串
     */
    pad: function(number) {
        return number < 10 ? '0' + number : number;
    }
};