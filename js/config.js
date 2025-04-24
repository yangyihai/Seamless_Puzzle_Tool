/**
 * config.js - 配置和全局变量
 * 集中定义应用的全局状态和配置参数
 */

// 全局变量对象
const CONFIG = {
    // 存储变量
    uploadedImages: [],
    activeImageId: null,
    draggedElement: null,
    resizeMode: false,
    resizeHandle: null,
    originalSize: { width: 0, height: 0 },
    originalMouse: { x: 0, y: 0 },
    offsetX: 0,
    offsetY: 0,
    currentLayout: 'free', // 默认为自由模式
    
    // DOM元素引用 (将在main.js中初始化)
    elements: {
        fileUpload: null,
        canvasContainer: null,
        thumbnailContainer: null,
        clearAllBtn: null,
        saveImageBtn: null,
        featherRange: null,
        featherValue: null,
        blendMode: null,
        opacityRange: null,
        opacityValue: null,
        loadingOverlay: null,
        layoutButtons: null
    },
    
    // 画布尺寸（将在main.js中初始化）
    canvasWidth: 0,
    canvasHeight: 0
};