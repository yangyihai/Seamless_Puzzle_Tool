/**
 * layoutManager.js - 布局管理功能
 * 处理图片的布局方式，如自由布局、四宫格、九宫格等
 */

const LayoutManager = {
    /**
     * 初始化布局管理器
     */
    init: function() {
        // 布局切换功能
        CONFIG.elements.layoutButtons.forEach(button => {
            button.addEventListener('click', function() {
                const newLayout = this.dataset.layout;
                if (newLayout !== CONFIG.currentLayout) {
                    // 更新活动按钮
                    CONFIG.elements.layoutButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    // 更新当前布局
                    CONFIG.currentLayout = newLayout;
                    
                    // 应用新布局
                    LayoutManager.applyLayout(newLayout);
                }
            });
        });
    },
    
    /**
     * 应用指定布局
     * @param {string} layout - 布局类型 ('free', 'grid2x2', 'grid3x3')
     */
    applyLayout: function(layout) {
        if (CONFIG.uploadedImages.length === 0) return;
        
        switch(layout) {
            case 'grid2x2':
                this.arrangeGrid(2, 2);
                break;
            case 'grid3x3':
                this.arrangeGrid(3, 3);
                break;
            case 'free':
                // 自由模式，不需要特殊处理
                break;
        }
    },
    
    /**
     * 网格布局排列图片
     * @param {number} rows - 行数
     * @param {number} cols - 列数
     */
    arrangeGrid: function(rows, cols) {
        const cellWidth = CONFIG.canvasWidth / cols;
        const cellHeight = CONFIG.canvasHeight / rows;
        const totalCells = rows * cols;
        
        // 获取当前所有可见的图片层
        const visibleLayers = Array.from(document.querySelectorAll('.image-layer'));
        
        // 确保我们有足够的图片
        const imagesToArrange = Math.min(visibleLayers.length, totalCells);
        
        // 为每个可用图片分配一个网格位置
        for (let i = 0; i < imagesToArrange; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            
            const imageLayer = visibleLayers[i];
            const imgElement = imageLayer.querySelector('img');
            const imageObj = CONFIG.uploadedImages.find(img => img.id === imageLayer.id);
            
            if (!imageObj) continue;
            
            // 计算新位置
            const x = col * cellWidth;
            const y = row * cellHeight;
            
            // 计算新尺寸 (略小于单元格以留出边距)
            const margin = 0; // 可以根据需要调整
            const newWidth = cellWidth - (margin * 2);
            const newHeight = cellHeight - (margin * 2);
            
            // 应用新尺寸和位置
            imageLayer.style.left = x + margin + 'px';
            imageLayer.style.top = y + margin + 'px';
            imgElement.style.width = newWidth + 'px';
            imgElement.style.height = newHeight + 'px';
            
            // 更新图像对象数据
            imageObj.x = x + margin;
            imageObj.y = y + margin;
            imageObj.width = newWidth;
            imageObj.height = newHeight;
        }
    }
};