/**
 * thumbnailManager.js - 缩略图管理功能
 * 处理图片缩略图的创建和管理
 */

const ThumbnailManager = {
    /**
     * 创建缩略图
     * @param {string} id - 图片ID
     * @param {string} src - 图片源URL
     */
    createThumbnail: function(id, src) {
        const thumbWrapper = document.createElement('div');
        thumbWrapper.classList.add('thumbnail-wrapper');
        
        const thumb = document.createElement('img');
        thumb.classList.add('thumbnail');
        thumb.dataset.id = id;
        thumb.src = src;
        
        const deleteBtn = document.createElement('div');
        deleteBtn.classList.add('thumbnail-delete');
        deleteBtn.innerHTML = '×';
        deleteBtn.title = '删除此图片';
        
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            ImageManipulation.deleteImage(id);
        });
        
        thumb.addEventListener('click', function() {
            ImageManipulation.setActiveImage(this.dataset.id);
        });
        
        thumbWrapper.appendChild(thumb);
        thumbWrapper.appendChild(deleteBtn);
        CONFIG.elements.thumbnailContainer.appendChild(thumbWrapper);
    }
};