/*
/* ExtJS Image Viewer plugin
/*/

Ext.ns('Ext.ux');

Ext.ux.imageViewer = (function(){
	var els = {},
		images = [],
		activeImage,
		initialized = false,
		imageboxes = [],
		slideshowEnabled = false,
		slideshowId = 0,
		nextImageIsReady = false,
		prevImageIsReady = false,
		next = new Image(),
		prev = new Image();

	return {
		overlayOpacity: 0.85,
		isAnimationEnabled: true,
		resizeSpeed: 8, // 1 to 10
		borderSize: 10,
		labelImage: "Изображение",
		labelOf: "из",
		hintNext: "Следующая",
		hintPrev: "Предыдущая",
		hintSlideshow: "Слайдшоу",
		hintSlideshowClose: "Закончить слайдшоу",
		hintClose: "Закрыть",
		slideshowDelay: 5000,

		init: function() {
			this.resizeDuration = this.isAnimationEnabled ? ((11 - this.resizeSpeed) * 0.15) : 0;
			this.overlayDuration = this.isAnimationEnabled ? 0.2 : 0;

			if(!initialized) {
				this.initMarkup();
				this.initEvents();
				initialized = true;
			}
		},

		initMarkup: function() {
			// append overlay to the document
			els.overlay = Ext.DomHelper.append(document.body, {
				id: 'ux-image-viewer-overlay'
			}, true);

			// append viewer template to the document
			var imageViewerTpl = new Ext.Template(this.getTemplate());
			els.imageViewer = imageViewerTpl.append(document.body, {}, true);

			// init overlay and viewer
			Ext.each([els.overlay, els.imageViewer], function(el){
				el.setVisibilityMode(Ext.Element.DISPLAY)
				el.hide();
			});

			// fill elements list
			var ids = [
				'mainContainer', 'image', 'hoverNav', 'navPrev', 'navNext', 'loading',
				'dataContainer', 'data', 'details', 'caption', 'imageNumber', 'bottomNav', 'navClose', 'slideshow'
			];
			Ext.each(ids, function(id){
				els[id] = Ext.get('ux-image-viewer-' + id);
			});
			
			els.image.dom.style.borderWidth = this.borderSize + 'px';
			els.dataContainer.dom.style.borderWidth = this.borderSize + 'px';
		},

		getTemplate : function() {
			return [
				'<div id="ux-image-viewer">',
				
					'<div id="ux-image-viewer-mainContainer">',
						'<div id="ux-image-viewer-loading"></div>',
						'<div id="ux-image-viewer-image">',
							'<div id="ux-image-viewer-hoverNav">',
								'<a href="#" id="ux-image-viewer-navPrev"><span title="'+this.hintPrev+'">&lt;</span></a>',
								'<a href="#" id="ux-image-viewer-navNext"><span title="'+this.hintNext+'">&gt;</span></a>',
							'</div>',
						'</div>',

						'<div id="ux-image-viewer-dataContainer">',
							'<div id="ux-image-viewer-data">',
								'<span id="ux-image-viewer-bottomNav">',
									'<a href="#" id="ux-image-viewer-navClose" title="'+this.hintClose+'"><span>&times;</span></a>',
									'<a href="#" id="ux-image-viewer-slideshow" title="'+this.hintSlideshow+'"><span>&#9658;</span></a>',
								'</span>',							
								'<span id="ux-image-viewer-details">',
									'<span id="ux-image-viewer-caption"></span>',
									'<span id="ux-image-viewer-imageNumber"></span>',
								'</span>',
							'</div>',
						'</div>',
					'</div>',
				'</div>'
			];
		},

		initEvents: function() {
			// close viewer
			var close = function(ev) {
				ev.preventDefault();
				this.close();
			};

			els.overlay.on('click', close, this);
			els.navClose.on('click', (function(ev) {
				close(ev), this.finishSlideshow(); 
			}), this);

			els.imageViewer.on('click', function(ev) {
				if (ev.getTarget().id == 'ux-image-viewer-mainContainer') {
					this.close();
				}
			}, this);

			// prev and next image
			els.navPrev.on('click', function(ev) {
				ev.preventDefault();
				this.prevImage();
			}, this);

			els.navNext.on('click', function(ev) {
				ev.preventDefault();
				this.nextImage();
			}, this);

			// slideshow
			els.slideshow.on('click', function(ev) {
				ev.preventDefault();
				this.startSlideshow();
			}, this);
		},

		register: function(sel) {
			if (imageboxes.indexOf(sel) === -1) {
				// register one more imagebox
				imageboxes.push(sel);

				var container = Ext.select(sel); // get by selector

				container.on('click', function(e){
					var target = e.getTarget('a');

					if (target) {
						e.preventDefault();
						this.open(target, sel);
					}
				}, this);
			}
		},

		startSlideshow: function() {
			if (!slideshowEnabled) {
				
				// slideshow initialization
				els.image.dom.className = 'slideshowMode';
				els.dataContainer.dom.className = 'slideshowMode';
				els.slideshow.hide();
				els.navClose.dom.title = this.hintSlideshowClose;
				slideshowEnabled = true;

				// set slideshow overlay
				els.overlay.shift({
					duration: this.overlayDuration,
					opacity: 1,
					callback: function() {
						var next = this.nextImage.createDelegate(this);
						// slideshow timer on
						slideshowId = setInterval(
							next,
							this.slideshowDelay
						);
					},
					scope: this
				});
			}
		},

		finishSlideshow: function() {
			if (slideshowEnabled) {

				// slideshow timer off
				clearInterval(slideshowId);

				// slideshow deinitialization
				slideshowEnabled = false;
				els.image.dom.className = '';
				els.dataContainer.dom.className = '';
				els.slideshow.show();
				els.navClose.dom.title = this.hintClose;
				slideshowEnabled = false;

				// restore overlay
				els.overlay.shift({
					duration: this.overlayDuration,
					opacity: this.overlayOpacity,
					scope: this
				});
			}			
		},

		open: function(image, sel) {
			
			els.overlay.fadeIn({
				duration: this.overlayDuration,
				endOpacity: this.overlayOpacity,
				callback: function() {
					images = [];

					var index = 0;
					var setItems = Ext.query(sel+' a');
					Ext.each(setItems, function(item) {
						if (item.href) {
							images.push([item.href, item.title]);
						}
					});

					while (images[index][0] != image.href) {
						index++;
					}

					this.setImage(index);
					
					els.imageViewer.show();
				},
				scope: this
			});
		},

		setImage: function(index,image){
			
			console.log(index);
			
			image = image || null;
			
			activeImage = index;

			this.disableKeyNav();

			els.loading.show();
			els.mainContainer.hide();
			els.navClose.hide();
			els.slideshow.hide();
			els.hoverNav.hide();
			els.navNext.hide();
			els.navPrev.hide();

			var preload = new Image();

			if (!image) {
				preload.onload = (function(){
					this.getNewDimensions(preload.width,preload.height);
				}).createDelegate(this);
				preload.src = images[activeImage][0];
			} else {
				console.log('preloaded...');
				preload = image;
				this.getNewDimensions(preload.width,preload.height);
			}

		},

		getNewDimensions: function(w,h){
			els.image.dom.style.backgroundImage = "url('" + images[activeImage][0] + "')";
			
			var viewSize = this.getViewSize();
			var picRatio = w / h;
			
			var picWidth = viewSize[0] - 100; // magic number ^_^
			var picHeight = Math.round(picWidth / picRatio);
			
			this.updateDetails();
			
			els.dataContainer.show();
			
			var dataHeight = els.dataContainer.dom.clientHeight;

			var borders = this.borderSize * 3;
			
			if (viewSize[1] * 0.95 - dataHeight - borders < picHeight) {
				picHeight = viewSize[1] * 0.95 - dataHeight - borders;
				picWidth = picHeight * picRatio;
			}
			
			var picTop = (viewSize[1] - picHeight - dataHeight - borders) / 2;
			
			this.resizeImage(picWidth, picHeight, picTop);

		},

		resizeImage: function(w, h, t){
			
			// calculate top and left offset for the lightbox
			var pageScroll = Ext.fly(document).getScroll();

			els.image.setStyle({
				width: w + 'px',
				height: h + 'px'
			});
			els.dataContainer.setStyle({
				width: w + 'px'
			});
			els.mainContainer.setStyle({
				top: (t+pageScroll.top) + 'px',
				left: (pageScroll.left) + 'px'
			});
			this.showImage();
		},

		showImage: function() {
			
			els.loading.hide();			
			
			els.navClose.show();
			if (!slideshowEnabled) els.slideshow.show();
			els.hoverNav.show();
			els.navNext.show();
			els.navPrev.show();
			
			if (!this.isAnimationEnabled) {
				els.mainContainer.show();
			} else {
				els.mainContainer.fadeIn({
					duration: this.resizeDuration,
					scope: this
				});
			}
			
			this.preloadImages();
		},

		updateDetails: function() {
			els.caption.update(images[activeImage][1]);
			els.details.show();
			if (images.length > 1) {
				els.imageNumber.update(this.labelImage + ' ' + (activeImage + 1) + ' ' + this.labelOf + '  ' + images.length);
				els.imageNumber.show();
			}
			this.updateNav();
		},

		updateNav: function(){
			this.enableKeyNav();

			els.hoverNav.show();
			els.navNext.show();

			// don't show previous button if it's 1st image in the set
 			if (activeImage > 0) {
				els.navPrev.show();
			}
		},


		keyNavAction: function(ev) {
			var keyCode = ev.getKey();

			if (
				keyCode == 88 || // x
				keyCode == 67 || // c
				keyCode == 27    // Esc
			) {
				this.close();
			}
			else if (keyCode == 80 || keyCode == 37){ // display previous image
				this.prevImage();
			}
			else if (keyCode == 78 || keyCode == 39){ // display next image
				this.nextImage();
			}
			else if (keyCode == 35){ // display last image // END
				this.lastImage();
			}
			else if (keyCode == 36){ // display first image // HOME
				this.firstImage();
			}			
		},

		preloadImages: function() {
			nextImageIsReady = false;
			prevImageIsReady = false;
			
			var setNextImageIsReady = (function() {
				console.log('next is ready');
				nextImageIsReady = true;
			}).createDelegate(this);
			
			var setPrevImageIsReady = (function() {
				console.log('prev is ready');
				prevImageIsReady = true;
			}).createDelegate(this);
			
			if (images.length > activeImage + 1) {
				next.src = images[activeImage + 1][0];
				next.onload = setNextImageIsReady;
			}
			if (activeImage > 0) {
				prev.src = images[activeImage - 1][0];
				prev.onload = setPrevImageIsReady;
			}
		},

		prevImage: function() {
			if (activeImage != 0) {
				if (prevImageIsReady) {
					this.setImage(activeImage - 1, prev);
				} else {
					this.setImage(activeImage - 1);
				}
			}
		},

		nextImage: function() {
			if (activeImage != (images.length - 1)){
				if (nextImageIsReady) {
					this.setImage(activeImage + 1, next);
				} else {
					this.setImage(activeImage + 1);
				}				
			} else {
				this.close();
			}
		},
		
		firstImage: function() {
			this.setImage(0);
		},
		
		lastImage: function() {
			this.setImage(images.length - 1);
		},

		enableKeyNav: function() {
			Ext.fly(document).on('keydown', this.keyNavAction, this);
		},

		disableKeyNav: function() {
			Ext.fly(document).un('keydown', this.keyNavAction, this);
		},

		close: function() {
			this.disableKeyNav();
			if (slideshowEnabled) {
				this.finishSlideshow();
			}
			els.imageViewer.hide();
			els.overlay.fadeOut({
				duration: this.overlayDuration
			});
		},

		getViewSize: function() {
			return [Ext.lib.Dom.getViewWidth(), Ext.lib.Dom.getViewHeight()];
		}
	}
})();

Ext.onReady(Ext.ux.imageViewer.init, Ext.ux.imageViewer);