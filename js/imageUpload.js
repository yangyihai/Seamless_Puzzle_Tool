/**
 * imageUpload.js - 图片上传功能
 * 处理用户上传图片的相关功能
 */

const ImageUpload = {
    /**
     * 初始化图片上传监听器
     */
    init: function() {
        // 图片上传处理
        CONFIG.elements.fileUpload.addEventListener('change', this.handleFileUpload);
    },
    
    /**
     * 处理文件上传事件
     * @param {Event} e - 文件上传事件对象
     */
    handleFileUpload: function(e) {
        const files = e.target.files;
        
        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    const imageId = 'img-' + Date.now() + '-' + i;
                    CONFIG.uploadedImages.push({
                        id: imageId,
                        src: event.target.result,
                        x: 0,
                        y: 0,
                        zIndex: CONFIG.uploadedImages.length + 1,
                        width: 'auto',
                        height: 'auto',
                        featherValue: CONFIG.elements.featherRange.value,
                        blendMode: CONFIG.elements.blendMode.value,
                        opacity: CONFIG.elements.opacityRange.value
                    });
                    
                    ImageManipulation.createImageLayer(imageId, event.target.result, true);
                    ThumbnailManager.createThumbnail(imageId, event.target.result);
                };
                
                reader.readAsDataURL(file);
            }
        }
        
        // 重置文件输入以允许再次选择相同的文件
        CONFIG.elements.fileUpload.value = '';
    }
};