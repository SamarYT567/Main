let locoScroll; // Locomotive Scroll instance
let nativeScrollListenerActive = false; // Flag for native scroll listener

// --- DOM Element References ---
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const cursorRadios = document.querySelectorAll('input[name="cursor-style"]');
const reduceMotionToggle = document.getElementById('reduceMotionToggle');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const faqQuestions = document.querySelectorAll('.faq-question');
const secondPageImg = document.querySelector('.second-page img');
const scrollContainer = document.querySelector('[data-scroll-container]');
const htmlElement = document.documentElement; // Reference to <html>

// --- Native Scroll Event Handler (for scroll-to-top when LocoScroll is off) ---
function handleNativeScroll() {
    if (scrollTopBtn) {
        scrollTopBtn.classList.toggle('visible', window.scrollY > window.innerHeight / 2);
    }
}

// --- Initialize Locomotive Scroll ---
function initLocomotiveScroll() {
    if (!scrollContainer) {
        console.warn('Locomotive Scroll container not found.');
        return;
    }
    if (locoScroll) locoScroll.destroy(); // Destroy existing instance if any

    locoScroll = new LocomotiveScroll({
        el: scrollContainer,
        smooth: true,
        tablet: { smooth: true },
        smartphone: { smooth: true },
    });

    // Update Locomotive Scroll on image load
    imagesLoaded(scrollContainer, { background: true }, () => {
        if (locoScroll) locoScroll.update();
    });

    // Handle scroll-to-top button visibility with Locomotive Scroll
    locoScroll.on('scroll', (args) => {
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('visible', args.scroll.y > window.innerHeight / 2);
        }
    });

    // Update on resize
    window.addEventListener('resize', () => {
        if (locoScroll) locoScroll.update();
    });

    // Remove native scroll listener if it was active
    if (nativeScrollListenerActive) {
        window.removeEventListener('scroll', handleNativeScroll);
        nativeScrollListenerActive = false;
    }
    htmlElement.classList.remove('reduce-motion-active'); // Ensure this is removed
}

// --- Destroy Locomotive Scroll ---
function destroyLocomotiveScroll() {
    if (locoScroll) {
        locoScroll.destroy();
        locoScroll = null;
    }
    // Clean up classes Locomotive Scroll might add to html/body
    htmlElement.classList.remove('has-scroll-smooth', 'has-scroll-dragging');
    document.body.classList.remove('has-scroll-smooth', 'has-scroll-dragging');
    htmlElement.classList.add('reduce-motion-active');


    // Add native scroll listener for scroll-to-top button
    if (!nativeScrollListenerActive) {
        window.addEventListener('scroll', handleNativeScroll);
        nativeScrollListenerActive = true;
        handleNativeScroll(); // Initial check
    }
}

// --- Apply Reduce Motion Setting ---
function applyReduceMotion(isReduced) {
    document.body.classList.toggle('reduce-motion', isReduced);
    localStorage.setItem('reduceMotion', isReduced ? 'true' : 'false');

    if (isReduced) {
        destroyLocomotiveScroll();
    } else {
        initLocomotiveScroll();
    }
}

// --- Apply Cursor Style ---
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

// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {

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

  // FAQ Accordion
  faqQuestions.forEach(button => {
    button.addEventListener('click', () => {
      const faqItem = button.closest('.faq-item');
      const answer = faqItem?.querySelector('.faq-answer');
      const wasActive = button.classList.contains('active');

      // Close other open FAQs
      document.querySelectorAll('.faq-item .faq-question.active').forEach(activeButton => {
        if (activeButton !== button) {
          activeButton.classList.remove('active');
          activeButton.closest('.faq-item')?.querySelector('.faq-answer')?.classList.remove('show');
        }
      });

      // Toggle current FAQ
      button.classList.toggle('active', !wasActive);
      answer?.classList.toggle('show', !wasActive);

      // Update Locomotive Scroll if active
      if (locoScroll) {
        setTimeout(() => locoScroll.update(), 450); // Delay to allow animation
      }
    });
  });

  // Scroll-to-Top Button Click
  if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', () => {
        if (locoScroll) {
          locoScroll.scrollTo('top');
        } else {
          window.scrollTo({ top: 0, behavior: document.body.classList.contains('reduce-motion') ? 'auto' : 'smooth' });
        }
      });
  }

  // Prevent Context Menu/Drag on Specific Image
  if (secondPageImg) {
    secondPageImg.addEventListener('contextmenu', (e) => e.preventDefault());
    secondPageImg.addEventListener('dragstart', (e) => e.preventDefault());
  }

  // --- Initializations from localStorage ---
  // Cursor
  const savedCursor = localStorage.getItem('selectedCursor') || 'default';
  cursorRadios.forEach(radio => {
    if (radio.value === savedCursor) { radio.checked = true; }
    radio.addEventListener('change', (e) => { if (e.target.checked) { applyCursor(e.target.value); } });
  });
  applyCursor(savedCursor); // Apply on load
  window.addEventListener('resize', () => applyCursor(localStorage.getItem('selectedCursor') || 'default')); // Re-check on resize

  // Reduce Motion
  const savedReduceMotion = localStorage.getItem('reduceMotion') === 'true';
  reduceMotionToggle.checked = savedReduceMotion;
  applyReduceMotion(savedReduceMotion); // This will correctly init or destroy loco-scroll on load

  reduceMotionToggle.addEventListener('change', () => {
      applyReduceMotion(reduceMotionToggle.checked);
  });

});
const loader = document.getElementById("loader");
  const firstVisitSessionKey = 'homePageFirstVisitDone'; 
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