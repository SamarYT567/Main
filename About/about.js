let locoScroll;
        let nativeScrollListenerActive = false;

        const loader = document.getElementById("loader");
        const menuBtn = document.getElementById('menuBtn');
        const sideMenu = document.getElementById('sideMenu');
        const cursorRadios = document.querySelectorAll('input[name="cursor-style"]');
        const reduceMotionToggle = document.getElementById('reduceMotionToggle');
        const scrollContainer = document.querySelector('[data-scroll-container]');
        const htmlElement = document.documentElement;
        const headerElement = document.querySelector('header');

        // Function to update CSS variable for header height
        function updateHeaderHeightVar() {
            if (headerElement) {
                const headerHeight = headerElement.offsetHeight;
                document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
            }
        }
        
        function handleNativeScroll() { /* Basic handler, can be expanded if needed for other features */ }

        function initLocomotiveScroll() {
            if (!scrollContainer) {
                console.warn('Locomotive Scroll container not found.');
                return;
            }
            if (locoScroll) locoScroll.destroy(); // Destroy existing instance

            locoScroll = new LocomotiveScroll({
                el: scrollContainer,
                smooth: true,
                tablet: { smooth: true }, // Or configure differently for tablet
                smartphone: { smooth: true }, // Or configure differently for smartphone
            });

            // Update Locomotive Scroll on image load
            imagesLoaded(scrollContainer, { background: true }, () => {
                if (locoScroll) locoScroll.update();
            });
            
            // Update on resize
            window.addEventListener('resize', () => {
                if (locoScroll) locoScroll.update();
                updateHeaderHeightVar(); // Update header height on resize
            });
            updateHeaderHeightVar(); // Initial call


            // Remove native scroll listener if it was active
            if (nativeScrollListenerActive) {
                window.removeEventListener('scroll', handleNativeScroll);
                nativeScrollListenerActive = false;
            }
            htmlElement.classList.remove('reduce-motion-active'); // Ensure this is removed
        }

        function destroyLocomotiveScroll() {
            if (locoScroll) {
                locoScroll.destroy();
                locoScroll = null;
            }
            // Clean up classes Locomotive Scroll might add
            htmlElement.classList.remove('has-scroll-smooth', 'has-scroll-dragging');
            document.body.classList.remove('has-scroll-smooth', 'has-scroll-dragging');
            htmlElement.classList.add('reduce-motion-active'); // Signal that native scroll is active

            // Add native scroll listener if needed for other features (not for scroll-to-top here)
            if (!nativeScrollListenerActive) {
                window.addEventListener('scroll', handleNativeScroll);
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
              document.body.classList.remove('cursor-crosshair'); // Ensure custom classes are removed
              cursorRadios.forEach(radio => radio.disabled = true);
              return;
          }
          cursorRadios.forEach(radio => radio.disabled = false);
          // Remove any existing cursor class before adding a new one or reverting to default
          document.body.classList.remove('cursor-default', 'cursor-crosshair');
          if (cursorType !== 'default') {
              document.body.classList.add(`cursor-${cursorType}`);
          }
          localStorage.setItem('selectedCursor', cursorType);
        }

        document.addEventListener('DOMContentLoaded', () => {
          const firstVisitSessionKey = 'aboutPageFirstVisitDone'; 
          const isFirstVisit = !localStorage.getItem(firstVisitSessionKey);
          const loaderDisplayDuration = isFirstVisit ? 4000 : 200;

          if (loader) {
            setTimeout(() => {
                loader.classList.add("hide");
                if (isFirstVisit) {
                    localStorage.setItem(firstVisitSessionKey, 'true');
                }
            }, loaderDisplayDuration);
          }
          
          // Menu Toggle
          if (menuBtn && sideMenu) {
              menuBtn.addEventListener('click', (event) => {
                  event.stopPropagation();
                  menuBtn.classList.toggle('open');
                  sideMenu.classList.toggle('visible');
              });
              sideMenu.addEventListener('click', (event) => {
                  if (event.target === sideMenu) { // Click on overlay closes menu
                     menuBtn.classList.remove('open');
                     sideMenu.classList.remove('visible');
                  }
              });
          }

          // Cursor Style Initialization
          const savedCursor = localStorage.getItem('selectedCursor') || 'default';
          cursorRadios.forEach(radio => {
            if (radio.value === savedCursor) { radio.checked = true; }
            radio.addEventListener('change', (e) => { if (e.target.checked) { applyCursor(e.target.value); } });
          });
          applyCursor(savedCursor); // Apply on load
          window.addEventListener('resize', () => applyCursor(localStorage.getItem('selectedCursor') || 'default')); // Re-check on resize

          // Reduce Motion Initialization
          const savedReduceMotion = localStorage.getItem('reduceMotion') === 'true';
          reduceMotionToggle.checked = savedReduceMotion;
          applyReduceMotion(savedReduceMotion); // This will correctly init or destroy loco-scroll on load

          reduceMotionToggle.addEventListener('change', () => {
              applyReduceMotion(reduceMotionToggle.checked);
          });
          
          // Disable context menu/drag on social icons
          const socialIcons = document.querySelectorAll('.social-icon img');
          socialIcons.forEach(icon => {
              icon.addEventListener('contextmenu', e => e.preventDefault());
              icon.addEventListener('dragstart', e => e.preventDefault());
          });
          updateHeaderHeightVar(); // Initial call to set header height variable
        });