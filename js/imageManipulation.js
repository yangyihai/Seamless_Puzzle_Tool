/**
 * imageManipulation.js - 图片操作功能
 * 处理图片的拖拽、调整大小等交互功能
 */

const ImageManipulation = {
    /**
     * 初始化事件监听器
     */
    init: function() {
        // 清除所有图片
        CONFIG.elements.clearAllBtn.addEventListener('click', this.clearAllImages);
    },
    
    /**
     * 创建图片层
     * @param {string} id - 图片ID
     * @param {string} src - 图片源URL
     * @param {boolean} fitToCanvas - 是否适配画布大小
     */
    createImageLayer: function(id, src, fitToCanvas = false) {
        const img = new Image();
        img.src = src;
        
        img.onload = function() {
            const imageLayer = document.createElement('div');
            imageLayer.classList.add('image-layer');
            imageLayer.id = id;
            
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('image-content');
            
            const imgElement = document.createElement('img');
            imgElement.src = src;
            imgElement.draggable = false; // 防止浏览器默认拖拽行为干扰
            
            // 计算适应画布的尺寸
            let imgWidth, imgHeight;
            
            if (fitToCanvas) {
                // 计算宽高比
                const imgRatio = img.width / img.height;
                const canvasRatio = CONFIG.canvasWidth / CONFIG.canvasHeight;
                
                if (imgRatio > canvasRatio) {
                    // 图片较宽，以高度为基准
                    imgHeight = CONFIG.canvasHeight;
                    imgWidth = imgHeight * imgRatio;
                } else {
                    // 图片较高或等比，以宽度为基准
                    imgWidth = CONFIG.canvasWidth;
                    imgHeight = imgWidth / imgRatio;
                }
                
                // 居中放置
                const imageObj = CONFIG.uploadedImages.find(img => img.id === id);
                if (imageObj) {
                    imageObj.x = (CONFIG.canvasWidth - imgWidth) / 2;
                    imageObj.y = (CONFIG.canvasHeight - imgHeight) / 2;
                    imageObj.width = imgWidth;
                    imageObj.height = imgHeight;
                }
            }
            
            // 应用图像属性
            const imageObj = CONFIG.uploadedImages.find(img => img.id === id);
            if (imageObj) {
                imageLayer.style.left = imageObj.x + 'px';
                imageLayer.style.top = imageObj.y + 'px';
                imageLayer.style.zIndex = imageObj.zIndex;
                
                imgElement.style.width = imageObj.width + 'px';
                imgElement.style.height = imageObj.height + 'px';
                imgElement.style.opacity = CONFIG.elements.opacityRange.value / 100;
                
                // 应用羽化和混合模式
                EffectsManager.applyFeatherEffect(imgElement, imageObj.featherValue, imageObj.blendMode);
                
                // 存储当前应用的效果
                imageObj.featherValue = CONFIG.elements.featherRange.value;
                imageObj.blendMode = CONFIG.elements.blendMode.value;
                imageObj.opacity = CONFIG.elements.opacityRange.value;
            }
            
            imgContainer.appendChild(imgElement);
            imageLayer.appendChild(imgContainer);
            
            // 添加调整手柄
            ImageManipulation.addResizeHandles(imageLayer);
            
            CONFIG.elements.canvasContainer.appendChild(imageLayer);
            
            // 设置为活动图层
            ImageManipulation.setActiveImage(id);
            
            // 添加拖拽功能
            imageLayer.addEventListener('mousedown', ImageManipulation.startDrag);
        };
    },
    
    /**
     * 添加调整手柄
     * @param {HTMLElement} imageLayer - 图片层DOM元素
     */
    addResizeHandles: function(imageLayer) {
        // 添加8个调整手柄 (四角和四边)
        const handlePositions = [
            'top-left', 'top', 'top-right',
            'left', 'right',
            'bottom-left', 'bottom', 'bottom-right'
        ];
        
        handlePositions.forEach(position => {
            const handle = document.createElement('div');
            handle.classList.add('resize-handle', position);
            handle.dataset.position = position;
            handle.addEventListener('mousedown', ImageManipulation.startResize);
            imageLayer.appendChild(handle);
        });
    },
    
    /**
     * 设置活动图层
     * @param {string} id - 图片ID
     */
    setActiveImage: function(id) {
        // 移除之前的活动状态
        const allLayers = document.querySelectorAll('.image-layer');
        allLayers.forEach(layer => {
            layer.style.outline = 'none';
        });
        
        const allThumbs = document.querySelectorAll('.thumbnail');
        allThumbs.forEach(thumb => thumb.classList.remove('active'));
        
        // 设置新的活动状态
        CONFIG.activeImageId = id;
        const activeLayer = document.getElementById(id);
        if (activeLayer) {
            activeLayer.style.outline = '2px solid #4CAF50';
            activeLayer.style.zIndex = 1000; // 将活动图层放到最顶层
            
            const activeThumbnail = document.querySelector(`.thumbnail[data-id="${id}"]`);
            if (activeThumbnail) {
                activeThumbnail.classList.add('active');
            }
            
            // 更新存储的z-index值
            const imageObj = CONFIG.uploadedImages.find(img => img.id === id);
            if (imageObj) {
                imageObj.zIndex = 1000;
                
                // 重置其他图层的z-index
                CONFIG.uploadedImages.forEach(img => {
                    if (img.id !== id) {
                        img.zIndex = img.zIndex < 1000 ? img.zIndex : img.zIndex - 1;
                        const layer = document.getElementById(img.id);
                        if (layer) {
                            layer.style.zIndex = img.zIndex;
                        }
                    }
                });
            }
        }
    },
    
    /**
     * 开始调整大小
     * @param {Event} e - 鼠标事件
     */
    startResize: function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        CONFIG.resizeMode = true;
        CONFIG.resizeHandle = this;
        const imageLayer = this.closest('.image-layer');
        
        // 先设置为活动图层
        ImageManipulation.setActiveImage(imageLayer.id);
        
        // 存储原始尺寸和鼠标位置
        const imgElement = imageLayer.querySelector('img');
        
        CONFIG.originalSize = {
            width: parseFloat(imgElement.style.width) || imgElement.offsetWidth,
            height: parseFloat(imgElement.style.height) || imgElement.offsetHeight,
            left: parseFloat(imageLayer.style.left) || 0,
            top: parseFloat(imageLayer.style.top) || 0
        };
        
        CONFIG.originalMouse = {
            x: e.clientX,
            y: e.clientY
        };
        
        document.addEventListener('mousemove', ImageManipulation.resize);
        document.addEventListener('mouseup', ImageManipulation.stopResize);
    },
    
    /**
     * 调整大小过程
     * @param {Event} e - 鼠标事件
     */
    resize: function(e) {
        if (!CONFIG.resizeMode || !CONFIG.resizeHandle) return;
        
        e.preventDefault();
        
        const imageLayer = CONFIG.resizeHandle.closest('.image-layer');
        const imgElement = imageLayer.querySelector('img');
        const position = CONFIG.resizeHandle.dataset.position;
        
        // 计算鼠标移动距离
        const dx = e.clientX - CONFIG.originalMouse.x;
        const dy = e.clientY - CONFIG.originalMouse.y;
        
        // 根据不同手柄位置计算新尺寸和位置
        let newWidth = CONFIG.originalSize.width;
        let newHeight = CONFIG.originalSize.height;
        let newLeft = CONFIG.originalSize.left;
        let newTop = CONFIG.originalSize.top;
        
        // 处理水平方向调整
        if (position.includes('left')) {
            newWidth = CONFIG.originalSize.width - dx;
            newLeft = CONFIG.originalSize.left + dx;
        } else if (position.includes('right')) {
            newWidth = CONFIG.originalSize.width + dx;
        } else if (position === 'top' || position === 'bottom') {
            // 保持当前宽度不变
        } 
        
        // 处理垂直方向调整
        if (position.includes('top')) {
            newHeight = CONFIG.originalSize.height - dy;
            newTop = CONFIG.originalSize.top + dy;
        } else if (position.includes('bottom')) {
            newHeight = CONFIG.originalSize.height + dy;
        } else if (position === 'left' || position === 'right') {
            // 保持当前高度不变
        }
        
        // 限制最小尺寸
        if (newWidth < 50) {
            newWidth = 50;
            newLeft = CONFIG.originalSize.left + CONFIG.originalSize.width - 50;
        }
        
        if (newHeight < 50) {
            newHeight = 50;
            newTop = CONFIG.originalSize.top + CONFIG.originalSize.height - 50;
        }
        
        // 严格限制在画布范围内
        if (newLeft < 0) {
            newWidth += newLeft;
            newLeft = 0;
        }
        
        if (newTop < 0) {
            newHeight += newTop;
            newTop = 0;
        }
        
        if (newLeft + newWidth > CONFIG.canvasWidth) {
            newWidth = CONFIG.canvasWidth - newLeft;
        }
        
        if (newTop + newHeight > CONFIG.canvasHeight) {
            newHeight = CONFIG.canvasHeight - newTop;
        }
        
        // 应用新尺寸和位置
        imgElement.style.width = newWidth + 'px';
        imgElement.style.height = newHeight + 'px';
        imageLayer.style.left = newLeft + 'px';
        imageLayer.style.top = newTop + 'px';
        
        // 更新存储的图像对象数据
        const imageObj = CONFIG.uploadedImages.find(img => img.id === imageLayer.id);
        if (imageObj) {
            imageObj.width = newWidth;
            imageObj.height = newHeight;
            imageObj.x = newLeft;
            imageObj.y = newTop;
        }
    },
    
    /**
     * 停止调整大小
     */
    stopResize: function() {
        CONFIG.resizeMode = false;
        CONFIG.resizeHandle = null;
        
        document.removeEventListener('mousemove', ImageManipulation.resize);
        document.removeEventListener('mouseup', ImageManipulation.stopResize);
    },
    
    /**
     * 开始拖拽
     * @param {Event} e - 鼠标事件
     */
    startDrag: function(e) {
        // 如果点击的是调整手柄，则不进行拖拽
        if (e.target.classList.contains('resize-handle')) return;
        
        // 确保只有点击图片内容区域才可以拖动
        let target = e.target;
        const isImg = target.tagName === 'IMG' || target.classList.contains('image-content') || target.classList.contains('image-layer');
        if (!isImg) return;
        
        e.preventDefault();
        
        // 设置当前拖拽的图层为活动图层
        const imageLayer = this.closest('.image-layer');
        ImageManipulation.setActiveImage(imageLayer.id);
        
        CONFIG.draggedElement = imageLayer;
        
        // 获取图层在页面中的位置
        const rect = CONFIG.draggedElement.getBoundingClientRect();
        
        // 计算鼠标点击位置与元素左上角的偏移
        CONFIG.offsetX = e.clientX - rect.left;
        CONFIG.offsetY = e.clientY - rect.top;
        
        document.addEventListener('mousemove', ImageManipulation.drag);
        document.addEventListener('mouseup', ImageManipulation.stopDrag);
    },
    
    /**
     * 拖拽过程
     * @param {Event} e - 鼠标事件
     */
    drag: function(e) {
        if (!CONFIG.draggedElement) return;
        
        e.preventDefault();
        
        // 计算新位置
        let x = e.clientX - CONFIG.offsetX;
        let y = e.clientY - CONFIG.offsetY;
        
        // 严格限制在画布范围内
        const imgElement = CONFIG.draggedElement.querySelector('img');
        const imgWidth = parseFloat(imgElement.style.width) || imgElement.offsetWidth;
        const imgHeight = parseFloat(imgElement.style.height) || imgElement.offsetHeight;
        
        // 限制左右边界
        if (x < 0) x = 0;
        if (x + imgWidth > CONFIG.canvasWidth) x = CONFIG.canvasWidth - imgWidth;
        
        // 限制上下边界
        if (y < 0) y = 0;
        if (y + imgHeight > CONFIG.canvasHeight) y = CONFIG.canvasHeight - imgHeight;
        
        // 应用新位置
        CONFIG.draggedElement.style.left = x + 'px';
        CONFIG.draggedElement.style.top = y + 'px';
        
        // 更新图像对象中的位置
        const imageObj = CONFIG.uploadedImages.find(img => img.id === CONFIG.draggedElement.id);
        if (imageObj) {
            imageObj.x = x;
            imageObj.y = y;
        }
    },
    
    /**
     * 停止拖拽
     */
    stopDrag: function() {
        CONFIG.draggedElement = null;
        document.removeEventListener('mousemove', ImageManipulation.drag);
        document.removeEventListener('mouseup', ImageManipulation.stopDrag);
    },
    
    /**
     * 清除所有图片
     */
    clearAllImages: function() {
        CONFIG.elements.canvasContainer.innerHTML = '';
        CONFIG.elements.thumbnailContainer.innerHTML = '';
        CONFIG.uploadedImages = [];
        CONFIG.activeImageId = null;
    },
    
    /**
     * 删除指定图片
     * @param {string} imageId - 要删除的图片ID
     */
    deleteImage: function(imageId) {
        // 从DOM中移除图层
        const imageLayer = document.getElementById(imageId);
        if (imageLayer) {
            CONFIG.elements.canvasContainer.removeChild(imageLayer);
        }
        
        // 从缩略图中移除
        const thumbnailWrapper = document.querySelector(`.thumbnail[data-id="${imageId}"]`).closest('.thumbnail-wrapper');
        if (thumbnailWrapper) {
            CONFIG.elements.thumbnailContainer.removeChild(thumbnailWrapper);
        }
        
        // 从存储的图片数组中移除
        CONFIG.uploadedImages = CONFIG.uploadedImages.filter(img => img.id !== imageId);
        
        // 如果删除的是当前活动图层，则重置活动图层
        if (CONFIG.activeImageId === imageId) {
            CONFIG.activeImageId = null;
            // 如果还有其他图片，则选中第一个作为活动图层
            if (CONFIG.uploadedImages.length > 0) {
                ImageManipulation.setActiveImage(CONFIG.uploadedImages[0].id);
            }
        }
    }
};