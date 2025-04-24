/**
 * effectsManager.js - 效果管理功能
 * 处理图片的羽化、混合模式等视觉效果
 */

const EffectsManager = {
    /**
     * 初始化效果管理器
     */
    init: function() {
        // 羽化设置更改
        CONFIG.elements.featherRange.addEventListener('input', function() {
            CONFIG.elements.featherValue.textContent = this.value + 'px';
            EffectsManager.updateAllImages();
        });
        
        CONFIG.elements.blendMode.addEventListener('change', EffectsManager.updateAllImages);
        
        CONFIG.elements.opacityRange.addEventListener('input', function() {
            CONFIG.elements.opacityValue.textContent = this.value + '%';
            EffectsManager.updateAllImages();
        });
    },
    
    /**
     * 应用羽化效果
     * @param {HTMLElement} imgElement - 图片元素
     * @param {number} customFeatherValue - 自定义羽化值
     * @param {string} customBlendMode - 自定义混合模式
     */
    applyFeatherEffect: function(imgElement, customFeatherValue, customBlendMode) {
        const featherValue = customFeatherValue || CONFIG.elements.featherRange.value;
        const blendModeValue = customBlendMode || CONFIG.elements.blendMode.value;
        
        // 应用羽化效果，但保持图片原始形状
        imgElement.style.boxShadow = '0 0 ' + featherValue + 'px ' + featherValue + 'px rgba(255, 255, 255, 0.8)';
        imgElement.style.mixBlendMode = blendModeValue;
        
        // 移除圆角和模糊效果，保持图片原始外观
        imgElement.style.borderRadius = '0'; 
        imgElement.style.filter = 'none';
    },
    
    /**
     * 更新所有图片的效果
     */
    updateAllImages: function() {
        const images = document.querySelectorAll('.image-layer img');
        images.forEach(img => {
            img.style.opacity = CONFIG.elements.opacityRange.value / 100;
            EffectsManager.applyFeatherEffect(img);
            
            // 同时更新存储的设置
            const imageLayer = img.closest('.image-layer');
            if (imageLayer) {
                const imageObj = CONFIG.uploadedImages.find(imgObj => imgObj.id === imageLayer.id);
                if (imageObj) {
                    imageObj.featherValue = CONFIG.elements.featherRange.value;
                    imageObj.blendMode = CONFIG.elements.blendMode.value;
                    imageObj.opacity = CONFIG.elements.opacityRange.value;
                }
            }
        });
    }
};