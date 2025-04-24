// document.addEventListener('DOMContentLoaded', function() {
//     // 获取DOM元素
//     const fileUpload = document.getElementById('file-upload');
//     const canvasContainer = document.getElementById('canvas-container');
//     const thumbnailContainer = document.getElementById('thumbnail-container');
//     const clearAllBtn = document.getElementById('clear-all');
//     const saveImageBtn = document.getElementById('save-image');
//     const featherRange = document.getElementById('feather-range');
//     const featherValue = document.getElementById('feather-value');
//     const blendMode = document.getElementById('blend-mode');
//     const opacityRange = document.getElementById('opacity');
//     const opacityValue = document.getElementById('opacity-value');
//     const loadingOverlay = document.getElementById('loading-overlay');
//     const layoutButtons = document.querySelectorAll('.layout-btn');
    
//     // 画布尺寸 - 固定大小
//     const canvasWidth = canvasContainer.offsetWidth;
//     const canvasHeight = canvasContainer.offsetHeight;
    
//     // 布局模式
//     let currentLayout = 'free'; // 默认为自由模式
    
//     // 存储变量
//     let uploadedImages = [];
//     let activeImageId = null;
//     let draggedElement = null;
//     let resizeMode = false;
//     let resizeHandle = null;
//     let originalSize = { width: 0, height: 0 };
//     let originalMouse = { x: 0, y: 0 };
//     let offsetX, offsetY;
    
//     // 图片上传处理
//     fileUpload.addEventListener('change', function(e) {
//         const files = e.target.files;
        
//         if (files) {
//             for (let i = 0; i < files.length; i++) {
//                 const file = files[i];
//                 const reader = new FileReader();
                
//                 reader.onload = function(event) {
//                     const imageId = 'img-' + Date.now() + '-' + i;
//                     uploadedImages.push({
//                         id: imageId,
//                         src: event.target.result,
//                         x: 0,
//                         y: 0,
//                         zIndex: uploadedImages.length + 1,
//                         width: 'auto',
//                         height: 'auto',
//                         featherValue: featherRange.value,
//                         blendMode: blendMode.value,
//                         opacity: opacityRange.value
//                     });
                    
//                     createImageLayer(imageId, event.target.result, true);
//                     createThumbnail(imageId, event.target.result);
//                 };
                
//                 reader.readAsDataURL(file);
//             }
//         }
        
//         // 重置文件输入以允许再次选择相同的文件
//         fileUpload.value = '';
//     });
    
//     // 创建图片层
//     function createImageLayer(id, src, fitToCanvas = false) {
//         const img = new Image();
//         img.src = src;
        
//         img.onload = function() {
//             const imageLayer = document.createElement('div');
//             imageLayer.classList.add('image-layer');
//             imageLayer.id = id;
            
//             const imgContainer = document.createElement('div');
//             imgContainer.classList.add('image-content');
            
//             const imgElement = document.createElement('img');
//             imgElement.src = src;
            
//             // 计算适应画布的尺寸
//             let imgWidth, imgHeight;
            
//             if (fitToCanvas) {
//                 // 计算宽高比
//                 const imgRatio = img.width / img.height;
//                 const canvasRatio = canvasWidth / canvasHeight;
                
//                 if (imgRatio > canvasRatio) {
//                     // 图片较宽，以高度为基准
//                     imgHeight = canvasHeight;
//                     imgWidth = imgHeight * imgRatio;
//                 } else {
//                     // 图片较高或等比，以宽度为基准
//                     imgWidth = canvasWidth;
//                     imgHeight = imgWidth / imgRatio;
//                 }
                
//                 // 居中放置
//                 const imageObj = uploadedImages.find(img => img.id === id);
//                 if (imageObj) {
//                     imageObj.x = (canvasWidth - imgWidth) / 2;
//                     imageObj.y = (canvasHeight - imgHeight) / 2;
//                     imageObj.width = imgWidth;
//                     imageObj.height = imgHeight;
//                 }
//             }
            
//             // 应用图像属性
//             const imageObj = uploadedImages.find(img => img.id === id);
//             if (imageObj) {
//                 imageLayer.style.left = imageObj.x + 'px';
//                 imageLayer.style.top = imageObj.y + 'px';
//                 imageLayer.style.zIndex = imageObj.zIndex;
                
//                 imgElement.style.width = imageObj.width + 'px';
//                 imgElement.style.height = imageObj.height + 'px';
//                 imgElement.style.opacity = opacityRange.value / 100;
                
//                 // 应用羽化和混合模式
//                 applyFeatherEffect(imgElement, imageObj.featherValue, imageObj.blendMode);
                
//                 // 存储当前应用的效果
//                 imageObj.featherValue = featherRange.value;
//                 imageObj.blendMode = blendMode.value;
//                 imageObj.opacity = opacityRange.value;
//             }
            
//             imgContainer.appendChild(imgElement);
//             imageLayer.appendChild(imgContainer);
            
//             // 添加调整手柄
//             addResizeHandles(imageLayer);
            
//             canvasContainer.appendChild(imageLayer);
            
//             // 设置为活动图层
//             setActiveImage(id);
            
//             // 添加拖拽功能
//             imageLayer.addEventListener('mousedown', startDrag);
//         };
//     }
    
//     // 添加调整手柄
//     function addResizeHandles(imageLayer) {
//         // 添加8个调整手柄 (四角和四边)
//         const handlePositions = [
//             'top-left', 'top', 'top-right',
//             'left', 'right',
//             'bottom-left', 'bottom', 'bottom-right'
//         ];
        
//         handlePositions.forEach(position => {
//             const handle = document.createElement('div');
//             handle.classList.add('resize-handle', position);
//             handle.dataset.position = position;
//             handle.addEventListener('mousedown', startResize);
//             imageLayer.appendChild(handle);
//         });
//     }
    
//     // 开始调整大小
//     function startResize(e) {
//         e.preventDefault();
//         e.stopPropagation();
        
//         resizeMode = true;
//         resizeHandle = this;
//         const imageLayer = this.closest('.image-layer');
        
//         // 先设置为活动图层
//         setActiveImage(imageLayer.id);
        
//         // 存储原始尺寸和鼠标位置
//         const imgContainer = imageLayer.querySelector('.image-content');
//         const imgElement = imageLayer.querySelector('img');
        
//         originalSize = {
//             width: parseFloat(imgElement.style.width) || imgElement.offsetWidth,
//             height: parseFloat(imgElement.style.height) || imgElement.offsetHeight,
//             left: parseFloat(imageLayer.style.left) || 0,
//             top: parseFloat(imageLayer.style.top) || 0
//         };
        
//         originalMouse = {
//             x: e.clientX,
//             y: e.clientY
//         };
        
//         document.addEventListener('mousemove', resize);
//         document.addEventListener('mouseup', stopResize);
//     }
    
//     // 调整大小过程
//     function resize(e) {
//         if (!resizeMode || !resizeHandle) return;
        
//         e.preventDefault();
        
//         const imageLayer = resizeHandle.closest('.image-layer');
//         const imgElement = imageLayer.querySelector('img');
//         const position = resizeHandle.dataset.position;
        
//         // 计算鼠标移动距离
//         const dx = e.clientX - originalMouse.x;
//         const dy = e.clientY - originalMouse.y;
        
//         // 根据不同手柄位置计算新尺寸和位置
//         let newWidth = originalSize.width;
//         let newHeight = originalSize.height;
//         let newLeft = originalSize.left;
//         let newTop = originalSize.top;
        
//         // 处理水平方向调整
//         if (position.includes('left')) {
//             newWidth = originalSize.width - dx;
//             newLeft = originalSize.left + dx;
//         } else if (position.includes('right')) {
//             newWidth = originalSize.width + dx;
//         } else if (position === 'top' || position === 'bottom') {
//             // 保持当前宽度不变
//         } else {
//             // 如果是角落的调整点，根据鼠标移动的比例调整高度和宽度
//             const aspectRatio = originalSize.width / originalSize.height;
            
//             if (Math.abs(dx) > Math.abs(dy)) {
//                 // 主要是水平方向的移动
//                 newHeight = newWidth / aspectRatio;
//             } else {
//                 // 主要是垂直方向的移动
//                 newWidth = newHeight * aspectRatio;
//             }
//         }
        
//         // 处理垂直方向调整
//         if (position.includes('top')) {
//             newHeight = originalSize.height - dy;
//             newTop = originalSize.top + dy;
//         } else if (position.includes('bottom')) {
//             newHeight = originalSize.height + dy;
//         } else if (position === 'left' || position === 'right') {
//             // 保持当前高度不变
//         }
        
//         // 限制最小尺寸
//         if (newWidth < 50) {
//             newWidth = 50;
//             newLeft = originalSize.left + originalSize.width - 50;
//         }
        
//         if (newHeight < 50) {
//             newHeight = 50;
//             newTop = originalSize.top + originalSize.height - 50;
//         }
        
//         // 严格限制在画布范围内
//         if (newLeft < 0) {
//             newWidth += newLeft;
//             newLeft = 0;
//         }
        
//         if (newTop < 0) {
//             newHeight += newTop;
//             newTop = 0;
//         }
        
//         if (newLeft + newWidth > canvasWidth) {
//             newWidth = canvasWidth - newLeft;
//         }
        
//         if (newTop + newHeight > canvasHeight) {
//             newHeight = canvasHeight - newTop;
//         }
        
//         // 应用新尺寸和位置
//         imgElement.style.width = newWidth + 'px';
//         imgElement.style.height = newHeight + 'px';
//         imageLayer.style.left = newLeft + 'px';
//         imageLayer.style.top = newTop + 'px';
        
//         // 更新存储的图像对象数据
//         const imageObj = uploadedImages.find(img => img.id === imageLayer.id);
//         if (imageObj) {
//             imageObj.width = newWidth;
//             imageObj.height = newHeight;
//             imageObj.x = newLeft;
//             imageObj.y = newTop;
//         }
//     }
    
//     // 停止调整大小
//     function stopResize() {
//         resizeMode = false;
//         resizeHandle = null;
        
//         document.removeEventListener('mousemove', resize);
//         document.removeEventListener('mouseup', stopResize);
//     }
    
//     // 创建缩略图
//     function createThumbnail(id, src) {
//         const thumbWrapper = document.createElement('div');
//         thumbWrapper.classList.add('thumbnail-wrapper');
        
//         const thumb = document.createElement('img');
//         thumb.classList.add('thumbnail');
//         thumb.dataset.id = id;
//         thumb.src = src;
        
//         const deleteBtn = document.createElement('div');
//         deleteBtn.classList.add('thumbnail-delete');
//         deleteBtn.innerHTML = '×';
//         deleteBtn.title = '删除此图片';
        
//         deleteBtn.addEventListener('click', function(e) {
//             e.stopPropagation();
//             deleteImage(id);
//         });
        
//         thumb.addEventListener('click', function() {
//             setActiveImage(this.dataset.id);
//         });
        
//         thumbWrapper.appendChild(thumb);
//         thumbWrapper.appendChild(deleteBtn);
//         thumbnailContainer.appendChild(thumbWrapper);
//     }
    
//     // 设置活动图层
//     function setActiveImage(id) {
//         // 移除之前的活动状态
//         const allLayers = document.querySelectorAll('.image-layer');
//         allLayers.forEach(layer => {
//             layer.style.outline = 'none';
//         });
        
//         const allThumbs = document.querySelectorAll('.thumbnail');
//         allThumbs.forEach(thumb => thumb.classList.remove('active'));
        
//         // 设置新的活动状态
//         activeImageId = id;
//         const activeLayer = document.getElementById(id);
//         if (activeLayer) {
//             activeLayer.style.outline = '2px solid #4CAF50';
//             activeLayer.style.zIndex = 1000; // 将活动图层放到最顶层
            
//             const activeThumbnail = document.querySelector(`.thumbnail[data-id="${id}"]`);
//             if (activeThumbnail) {
//                 activeThumbnail.classList.add('active');
//             }
            
//             // 更新存储的z-index值
//             const imageObj = uploadedImages.find(img => img.id === id);
//             if (imageObj) {
//                 imageObj.zIndex = 1000;
                
//                 // 重置其他图层的z-index
//                 uploadedImages.forEach(img => {
//                     if (img.id !== id) {
//                         img.zIndex = img.zIndex < 1000 ? img.zIndex : img.zIndex - 1;
//                         const layer = document.getElementById(img.id);
//                         if (layer) {
//                             layer.style.zIndex = img.zIndex;
//                         }
//                     }
//                 });
//             }
//         }
//     }
    
//     // 应用羽化效果
//     function applyFeatherEffect(imgElement, customFeatherValue, customBlendMode) {
//         const featherValue = customFeatherValue || featherRange.value;
//         const blendModeValue = customBlendMode || blendMode.value;
        
//         // 增强羽化效果，类似于美图的无缝拼图效果
//         imgElement.style.boxShadow = '0 0 ' + featherValue + 'px ' + featherValue + 'px rgba(255, 255, 255, 0.8)';
//         imgElement.style.mixBlendMode = blendModeValue;
//         imgElement.style.borderRadius = (featherValue / 3) + 'px'; // 添加轻微圆角使边缘过渡更自然
        
//         // 移除模糊效果，只保留羽化边缘
//         imgElement.style.filter = 'none';
//     }
    
//     // 布局切换功能
//     layoutButtons.forEach(button => {
//         button.addEventListener('click', function() {
//             const newLayout = this.dataset.layout;
//             if (newLayout !== currentLayout) {
//                 // 更新活动按钮
//                 layoutButtons.forEach(btn => btn.classList.remove('active'));
//                 this.classList.add('active');
                
//                 // 更新当前布局
//                 currentLayout = newLayout;
                
//                 // 应用新布局
//                 applyLayout(newLayout);
//             }
//         });
//     });
    
//     // 应用布局
//     function applyLayout(layout) {
//         if (uploadedImages.length === 0) return;
        
//         switch(layout) {
//             case 'grid2x2':
//                 arrangeGrid(2, 2);
//                 break;
//             case 'grid3x3':
//                 arrangeGrid(3, 3);
//                 break;
//             case 'free':
//                 // 自由模式，不需要特殊处理
//                 break;
//         }
//     }
    
//     // 网格布局排列
//     function arrangeGrid(rows, cols) {
//         const cellWidth = canvasWidth / cols;
//         const cellHeight = canvasHeight / rows;
//         const totalCells = rows * cols;
        
//         // 获取当前所有可见的图片层
//         const visibleLayers = Array.from(document.querySelectorAll('.image-layer'));
        
//         // 确保我们有足够的图片
//         const imagesToArrange = Math.min(visibleLayers.length, totalCells);
        
//         // 为每个可用图片分配一个网格位置
//         for (let i = 0; i < imagesToArrange; i++) {
//             const row = Math.floor(i / cols);
//             const col = i % cols;
            
//             const imageLayer = visibleLayers[i];
//             const imgElement = imageLayer.querySelector('img');
//             const imageObj = uploadedImages.find(img => img.id === imageLayer.id);
            
//             if (!imageObj) continue;
            
//             // 计算新位置
//             const x = col * cellWidth;
//             const y = row * cellHeight;
            
//             // 计算新尺寸 (略小于单元格以留出边距)
//             const margin = 0; // 可以根据需要调整
//             const newWidth = cellWidth - (margin * 2);
//             const newHeight = cellHeight - (margin * 2);
            
//             // 应用新尺寸和位置
//             imageLayer.style.left = x + margin + 'px';
//             imageLayer.style.top = y + margin + 'px';
//             imgElement.style.width = newWidth + 'px';
//             imgElement.style.height = newHeight + 'px';
            
//             // 更新图像对象数据
//             imageObj.x = x + margin;
//             imageObj.y = y + margin;
//             imageObj.width = newWidth;
//             imageObj.height = newHeight;
//         }
//     }

//     // 开始拖拽
//     function startDrag(e) {
//         // 如果点击的是调整手柄，则不进行拖拽
//         if (e.target.classList.contains('resize-handle')) return;
        
//         e.preventDefault();
        
//         // 设置当前拖拽的图层为活动图层
//         const imageLayer = this.closest('.image-layer');
//         setActiveImage(imageLayer.id);
        
//         draggedElement = imageLayer;
        
//         // 计算鼠标点击位置与元素左上角的偏移
//         const rect = draggedElement.getBoundingClientRect();
//         offsetX = e.clientX - rect.left;
//         offsetY = e.clientY - rect.top;
        
//         document.addEventListener('mousemove', drag);
//         document.addEventListener('mouseup', stopDrag);
//     }
    
//     // 拖拽过程
//     function drag(e) {
//         if (!draggedElement) return;
        
//         e.preventDefault();
        
//         // 计算新位置
//         let x = e.clientX - offsetX;
//         let y = e.clientY - offsetY;
        
//         // 严格限制在画布范围内
//         const imgElement = draggedElement.querySelector('img');
//         const imgWidth = parseFloat(imgElement.style.width) || imgElement.offsetWidth;
//         const imgHeight = parseFloat(imgElement.style.height) || imgElement.offsetHeight;
        
//         // 限制左右边界
//         if (x < 0) x = 0;
//         if (x + imgWidth > canvasWidth) x = canvasWidth - imgWidth;
        
//         // 限制上下边界
//         if (y < 0) y = 0;
//         if (y + imgHeight > canvasHeight) y = canvasHeight - imgHeight;
        
//         // 应用新位置
//         draggedElement.style.left = x + 'px';
//         draggedElement.style.top = y + 'px';
        
//         // 更新图像对象中的位置
//         const imageObj = uploadedImages.find(img => img.id === draggedElement.id);
//         if (imageObj) {
//             imageObj.x = x;
//             imageObj.y = y;
//         }
//     }
    
//     // 停止拖拽
//     function stopDrag() {
//         draggedElement = null;
//         document.removeEventListener('mousemove', drag);
//         document.removeEventListener('mouseup', stopDrag);
//     }
    
//     // 清除所有图片
//     clearAllBtn.addEventListener('click', function() {
//         canvasContainer.innerHTML = '';
//         thumbnailContainer.innerHTML = '';
//         uploadedImages = [];
//         activeImageId = null;
//     });
    
//     // 保存拼接图 - 确保保留羽化效果
// saveImageBtn.addEventListener('click', function() {
//     // 检查是否有图片可保存
//     if (uploadedImages.length === 0) {
//         alert('请先上传并拼接图片');
//         return;
//     }
        
//     // 显示加载指示器
//     loadingOverlay.classList.add('visible');
        
//     // 临时隐藏图层选中状态轮廓线
//     document.querySelectorAll('.image-layer').forEach(layer => {
//         layer.style.outline = 'none';
//     });
        
//     // 临时隐藏调整手柄
//     document.querySelectorAll('.resize-handle').forEach(handle => {
//         handle.style.display = 'none';
//     });
        
//     // 使用 html2canvas 捕获画布内容，保留羽化效果
//     html2canvas(canvasContainer, {
//         backgroundColor: null,
//         useCORS: true,
//         scale: 2, // 提高输出图像质量
//         allowTaint: true, // 允许加载跨域资源
//         onclone: function(clonedDoc) {
//             // 确保克隆的文档中也应用了样式
//             const clonedLayers = clonedDoc.querySelectorAll('.image-layer');
//             clonedLayers.forEach(layer => {
//                 const imgElement = layer.querySelector('img');
//                 const imageId = layer.id;
//                 const imageObj = uploadedImages.find(img => img.id === imageId);
                    
//                 if (imageObj && imgElement) {
//                     // 增强羽化效果，确保保存时羽化效果更明显
//                     let featherValue = parseInt(imageObj.featherValue);
//                     imgElement.style.boxShadow = '0 0 ' + featherValue + 'px ' + featherValue + 'px rgba(255, 255, 255, 0.8)';
//                     imgElement.style.mixBlendMode = imageObj.blendMode;
//                     imgElement.style.opacity = imageObj.opacity / 100;
//                     imgElement.style.borderRadius = (featherValue / 3) + 'px';
                        
//                     // 仅在保存时应用轻微模糊以增强羽化效果，但不影响编辑时的清晰度
//                     if (featherValue > 0) {
//                         imgElement.style.filter = 'blur(' + Math.min(featherValue / 20, 1.5) + 'px)';
//                     }
//                 }
//             });
//         }
//     }).then(function(canvas) {
//             // 创建下载链接
//             const link = document.createElement('a');
//             link.download = '拼接图片_' + formatDate(new Date()) + '.png';
            
//             // 转换为图片并设置链接
//             canvas.toBlob(function(blob) {
//                 link.href = URL.createObjectURL(blob);
                
//                 // 隐藏加载指示器
//                 loadingOverlay.classList.remove('visible');
                
//                 // 触发下载
//                 link.click();
                
//                 // 清理创建的对象URL
//                 setTimeout(() => URL.revokeObjectURL(link.href), 5000);
                
//                 // 恢复活动图层的轮廓和调整手柄显示
//                 if (activeImageId) {
//                     const activeLayer = document.getElementById(activeImageId);
//                     if (activeLayer) {
//                         activeLayer.style.outline = '2px solid #4CAF50';
//                     }
//                 }
//                 document.querySelectorAll('.resize-handle').forEach(handle => {
//                     handle.style.display = 'block';
//                 });
//             }, 'image/png');
//         }).catch(function(error) {
//             console.error('保存图片时发生错误:', error);
//             alert('保存图片时发生错误: ' + error.message);
//             loadingOverlay.classList.remove('visible');
            
//             // 恢复调整手柄显示
//             document.querySelectorAll('.resize-handle').forEach(handle => {
//                 handle.style.display = 'block';
//             });
//         });
//     });
    
//     // 删除图片
//     function deleteImage(imageId) {
//         // 从DOM中移除图层
//         const imageLayer = document.getElementById(imageId);
//         if (imageLayer) {
//             canvasContainer.removeChild(imageLayer);
//         }
        
//         // 从缩略图中移除
//         const thumbnailWrapper = document.querySelector(`.thumbnail[data-id="${imageId}"]`).closest('.thumbnail-wrapper');
//         if (thumbnailWrapper) {
//             thumbnailContainer.removeChild(thumbnailWrapper);
//         }
        
//         // 从存储的图片数组中移除
//         uploadedImages = uploadedImages.filter(img => img.id !== imageId);
        
//         // 如果删除的是当前活动图层，则重置活动图层
//         if (activeImageId === imageId) {
//             activeImageId = null;
//             // 如果还有其他图片，则选中第一个作为活动图层
//             if (uploadedImages.length > 0) {
//                 setActiveImage(uploadedImages[0].id);
//             }
//         }
//     }
    
//     // 格式化日期为字符串 (YYYYMMDD_HHMMSS)
//     function formatDate(date) {
//         return date.getFullYear() +
//                pad(date.getMonth() + 1) +
//                pad(date.getDate()) + '_' +
//                pad(date.getHours()) +
//                pad(date.getMinutes()) +
//                pad(date.getSeconds());
//     }
    
//     // 数字补零
//     function pad(number) {
//         return number < 10 ? '0' + number : number;
//     }
    
//     // 羽化设置更改
//     featherRange.addEventListener('input', function() {
//         featherValue.textContent = this.value + 'px';
//         updateAllImages();
//     });
    
//     blendMode.addEventListener('change', updateAllImages);
    
//     opacityRange.addEventListener('input', function() {
//         opacityValue.textContent = this.value + '%';
//         updateAllImages();
//     });
    
//     function updateAllImages() {
//         const images = document.querySelectorAll('.image-layer img');
//         images.forEach(img => {
//             img.style.opacity = opacityRange.value / 100;
//             applyFeatherEffect(img);
            
//             // 同时更新存储的设置
//             const imageLayer = img.closest('.image-layer');
//             if (imageLayer) {
//                 const imageObj = uploadedImages.find(imgObj => imgObj.id === imageLayer.id);
//                 if (imageObj) {
//                     imageObj.featherValue = featherRange.value;
//                     imageObj.blendMode = blendMode.value;
//                     imageObj.opacity = opacityRange.value;
//                 }
//             }
//         });
//     }
// });