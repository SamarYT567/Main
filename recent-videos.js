let locoScroll;
    let nativeScrollListenerActive = false;

    const loader = document.getElementById("loader");
    const menuBtn = document.getElementById('menuBtn');
    const sideMenu = document.getElementById('sideMenu');
    const cursorRadios = document.querySelectorAll('input[name="cursor-style"]');
    const reduceMotionToggle = document.getElementById('reduceMotionToggle');
    const scrollContainer = document.querySelector('[data-scroll-container]');
    const htmlElement = document.documentElement;
    const goBackBtn = document.querySelector('.go-back-btn');
    const headerElement = document.querySelector('header');


    function updateHeaderHeightVar() {
        if (headerElement) {
            const headerHeight = headerElement.offsetHeight;
            document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        }
    }


    function handleNativeScroll() { /* Only for fallback if needed, not primary for scroll-to-top */ }

    function initLocomotiveScroll() {
        if (!scrollContainer) {
            console.warn('Locomotive Scroll container not found.');
            return;
        }
        if (locoScroll) locoScroll.destroy();

        locoScroll = new LocomotiveScroll({
            el: scrollContainer,
            smooth: true,
            tablet: { smooth: true },
            smartphone: { smooth: true },
        });

        imagesLoaded(scrollContainer, { background: true }, () => {
            if (locoScroll) locoScroll.update();
        });
        
        window.addEventListener('resize', () => {
            if (locoScroll) locoScroll.update();
            updateHeaderHeightVar();
        });
        updateHeaderHeightVar();


        if (nativeScrollListenerActive) {
            window.removeEventListener('scroll', handleNativeScroll);
            nativeScrollListenerActive = false;
        }
        htmlElement.classList.remove('reduce-motion-active');
    }

    function destroyLocomotiveScroll() {
        if (locoScroll) {
            locoScroll.destroy();
            locoScroll = null;
        }
        htmlElement.classList.remove('has-scroll-smooth', 'has-scroll-dragging');
        document.body.classList.remove('has-scroll-smooth', 'has-scroll-dragging');
        htmlElement.classList.add('reduce-motion-active');

        if (!nativeScrollListenerActive) {
            window.addEventListener('scroll', handleNativeScroll); // Basic listener if needed for other things
            nativeScrollListenerActive = true;
        }
    }
    
    function applyReduceMotion(isReduced) {
        document.body.classList.toggle('reduce-motion', isReduced);
        localStorage.setItem('reduceMotion', isReduced ? 'true' : 'false');
        
        if (isReduced) {
            destroyLocomotiveScroll();
        } else {
            initLocomotiveScroll();
        }
    }

    function applyCursor(cursorType) {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      if (isMobile) {
          document.body.style.cursor = 'auto';
          document.body.classList.remove('cursor-crosshair');
          cursorRadios.forEach(radio => radio.disabled = true);
          return;
      }
      cursorRadios.forEach(radio => radio.disabled = false);
      document.body.classList.remove('cursor-default', 'cursor-crosshair');
      if (cursorType !== 'default') {
          document.body.classList.add(`cursor-${cursorType}`);
      }
      localStorage.setItem('selectedCursor', cursorType);
    }

    document.addEventListener('DOMContentLoaded', () => {
      const firstVisitSessionKey = 'recentVideosFirstVisitDone';
      const isFirstVisit = !localStorage.getItem(firstVisitSessionKey);
      const loaderDisplayDuration = isFirstVisit ? 4000 : 200; // 4 seconds for first visit, 200ms otherwise

      if (loader) {
        setTimeout(() => {
            loader.classList.add("hide");
            if (isFirstVisit) {
                localStorage.setItem(firstVisitSessionKey, 'true');
            }
        }, loaderDisplayDuration);
      }
      
      if (menuBtn && sideMenu) {
          menuBtn.addEventListener('click', (event) => {
              event.stopPropagation();
              menuBtn.classList.toggle('open');
              sideMenu.classList.toggle('visible');
          });
          sideMenu.addEventListener('click', (event) => {
              if (event.target === sideMenu) {
                 menuBtn.classList.remove('open');
                 sideMenu.classList.remove('visible');
              }
          });
      }

      const savedCursor = localStorage.getItem('selectedCursor') || 'default';
      cursorRadios.forEach(radio => {
        if (radio.value === savedCursor) { radio.checked = true; }
        radio.addEventListener('change', (e) => { if (e.target.checked) { applyCursor(e.target.value); } });
      });
      applyCursor(savedCursor);
      window.addEventListener('resize', () => applyCursor(localStorage.getItem('selectedCursor') || 'default'));

      const savedReduceMotion = localStorage.getItem('reduceMotion') === 'true';
      reduceMotionToggle.checked = savedReduceMotion;
      applyReduceMotion(savedReduceMotion); 

      reduceMotionToggle.addEventListener('change', () => {
          applyReduceMotion(reduceMotionToggle.checked);
      });
      
      const videoBoxes = document.querySelectorAll('.video-box');
      videoBoxes.forEach(box => {
        box.addEventListener('contextmenu', (event) => event.preventDefault());
        const img = box.querySelector('img');
        if (img) {
          img.addEventListener('dragstart', (event) => event.preventDefault());
        }
      });
      updateHeaderHeightVar(); // Initial call
    });