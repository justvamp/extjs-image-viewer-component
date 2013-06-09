### What Is It?
This is a pretty simple image viewer component that uses ExtJS 3.4. You just have to define an id of an element containing the images, and - voila! - it just works!

### Component Usage Example

    Ext.onReady(function() {
        // set up an id of an element that contains the images
        Ext.ux.imageViewer.register('#imagebox');
        // few additional parameters that are described below
        Ext.ux.imageViewer.slideshowDelay = 5000;
        Ext.ux.imageViewer.isAnimationEnabled = false;
    });

### Configurable Parameters List

* **slideshowDelay** (default: 5000) - a delay between slides in a slideshow mode;
* **isAnimationEnabled** (default: true) - set to false to disable the animations between slides in both modes;
* **overlayOpacity** (default: 0.85) - opacity for the overlay in a normal mode;
* **fadeSpeed** (default: 8) - speed for a picture to fade in;
* **borderSize** (default: 10) - border width of main elements in a normal mode;
* **labelImage** (default: "Изображение") - a label for the "image" word;
* **labelOf** (default: "из") - a label for the "of" word;
* **hintNext** (default: "Следующая") - a hint for the "Next" button ;
* **hintPrev** (default: "Предыдущая") - a hint for the "Previous" button;
* **hintSlideshow** (default: "Слайдшоу") - a hint for the "Slideshow" button;
* **hintSlideshowClose** (default: "Закончить слайдшоу") - a hint for the "Close" button in a slideshow mode;
* **hintClose** (default: "Закрыть") a hint for the "Close" button in a normal mode.
