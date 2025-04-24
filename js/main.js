/**
 * main.js - 主程序入口
 * 初始化应用程序及各个模块
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化DOM元素引用
    CONFIG.elements.fileUpload = document.getElementById('file-upload');
    CONFIG.elements.canvasContainer = document.getElementById('canvas-container');
    CONFIG.elements.thumbnailContainer = document.getElementById('thumbnail-container');
    CONFIG.elements.clearAllBtn = document.getElementById('clear-all');
    CONFIG.elements.saveImageBtn = document.getElementById('save-image');
    CONFIG.elements.featherRange = document.getElementById('feather-range');
    CONFIG.elements.featherValue = document.getElementById('feather-value');
    CONFIG.elements.blendMode = document.getElementById('blend-mode');
    CONFIG.elements.opacityRange = document.getElementById('opacity');
    CONFIG.elements.opacityValue = document.getElementById('opacity-value');
    CONFIG.elements.loadingOverlay = document.getElementById('loading-overlay');
    CONFIG.elements.layoutButtons = document.querySelectorAll('.layout-btn');
    
    // 初始化画布尺寸
    CONFIG.canvasWidth = CONFIG.elements.canvasContainer.offsetWidth;
    CONFIG.canvasHeight = CONFIG.elements.canvasContainer.offsetHeight;
    
    // 初始化各个功能模块
    ImageUpload.init();
    ImageManipulation.init();
    LayoutManager.init();
    EffectsManager.init();
    ExportManager.init();
    
    console.log('图片无缝拼接工具初始化完成');
});