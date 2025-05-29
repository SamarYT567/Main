// js/utils.js

/**
 * Applies the selected cursor style to the body.
 * Handles both CSS cursor properties and custom cursor elements.
 * @param {string} cursorType - The type of cursor to apply ('default', 'crosshair', 'pointer-dot', 'animated-ring').
 */
export function applyCursor(cursorType) {
    const body = document.body;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    let customCursorElement = document.getElementById('custom-cursor');

    // Disable custom cursors on mobile
    if (isMobile) {
        body.style.cursor = 'auto'; // Ensure default cursor on mobile
        body.classList.remove('cursor-crosshair', 'cursor-pointer-dot', 'cursor-animated-ring');
        if (customCursorElement) {
            customCursorElement.style.display = 'none'; // Hide custom element
        }
        // Disable cursor radio buttons in menu on mobile
        document.querySelectorAll('input[name="cursor-style"]').forEach(radio => radio.disabled = true);
        return;
    }

    // Enable cursor radio buttons on desktop
    document.querySelectorAll('input[name="cursor-style"]').forEach(radio => radio.disabled = false);

    // Remove any existing custom cursor classes from body
    body.classList.remove('cursor-default', 'cursor-crosshair', 'cursor-pointer-dot', 'cursor-animated-ring');

    // Apply the new cursor class to the body
    body.classList.add(`cursor-${cursorType}`);
    localStorage.setItem('selectedCursor', cursorType);

    // Handle custom cursor elements (pointer-dot, animated-ring)
    if (cursorType === 'pointer-dot' || cursorType === 'animated-ring') {
        if (!customCursorElement) {
            customCursorElement = document.createElement('div');
            customCursorElement.id = 'custom-cursor';
            customCursorElement.classList.add('cursor-element'); // Add base class
            document.body.appendChild(customCursorElement);
        }
        customCursorElement.className = `cursor-element cursor-${cursorType}`; // Set specific class
        customCursorElement.style.display = 'block'; // Ensure it's visible

        // Add mousemove listener for custom cursor position
        document.addEventListener('mousemove', (e) => {
            if (customCursorElement && (cursorType === 'pointer-dot' || cursorType === 'animated-ring')) {
                customCursorElement.style.left = `${e.clientX}px`;
                customCursorElement.style.top = `${e.clientY}px`;
            }
        });
    } else {
        // Remove custom cursor element if not needed
        if (customCursorElement) {
            customCursorElement.style.display = 'none';
        }
    }
}

/**
 * Applies or removes the 'reduce-motion' class and manages Locomotive Scroll.
 * @param {boolean} isReduced - True to enable reduce motion, false otherwise.
 */
export function applyReduceMotion(isReduced) {
    const body = document.body;
    const htmlElement = document.documentElement;

    body.classList.toggle('reduce-motion', isReduced);
    localStorage.setItem('reduceMotion', isReduced ? 'true' : 'false');

    // Re-initialize or destroy Locomotive Scroll based on reduce motion setting
    if (isReduced) {
        if (window.locoScroll) {
            window.locoScroll.destroy();
            window.locoScroll = null;
        }
        // Clean up classes Locomotive Scroll might add
        htmlElement.classList.remove('has-scroll-smooth', 'has-scroll-dragging');
        body.classList.remove('has-scroll-smooth', 'has-scroll-dragging');
        htmlElement.classList.add('reduce-motion-active'); // Signal that native scroll is active
        // Add native scroll listener if needed for other features (not for scroll-to-top here)
        if (!window.nativeScrollListenerActive) {
            window.addEventListener('scroll', window.handleNativeScroll);
            window.nativeScrollListenerActive = true;
        }
    } else {
        // Only initialize if not already initialized
        if (!window.locoScroll && typeof window.initLocomotiveScroll === 'function') {
            window.initLocomotiveScroll();
        }
        // Remove native scroll listener if it was active
        if (window.nativeScrollListenerActive) {
            window.removeEventListener('scroll', window.handleNativeScroll);
            window.nativeScrollListenerActive = false;
        }
        htmlElement.classList.remove('reduce-motion-active'); // Ensure this is removed
    }
}

/**
 * Updates the CSS custom property for header height.
 */
export function updateHeaderHeightVar() {
    const headerElement = document.querySelector('header');
    if (headerElement) {
        const headerHeight = headerElement.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }
}

/**
 * Handles native scroll events for features like scroll-to-top button visibility.
 * This is a placeholder and can be expanded.
 */
export function handleNativeScroll() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        scrollTopBtn.classList.toggle('visible', window.scrollY > window.innerHeight / 2);
    }
}

/**
 * Sets up the feedback modal and its form validation.
 */
export function setupFeedbackModal() {
    const openFeedbackFormBtn = document.getElementById('openFeedbackFormBtn');
    const feedbackModal = document.getElementById('feedbackModal');
    const closeButton = feedbackModal ? feedbackModal.querySelector('.close-button') : null;
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackNameInput = document.getElementById('feedbackName');
    const feedbackEmailInput = document.getElementById('feedbackEmail');
    const feedbackMessageInput = document.getElementById('feedbackMessage');
    const feedbackFormMessages = document.getElementById('feedbackFormMessages');

    if (openFeedbackFormBtn && feedbackModal && closeButton && feedbackForm) {
        openFeedbackFormBtn.addEventListener('click', () => {
            feedbackModal.classList.add('show');
        });

        closeButton.addEventListener('click', () => {
            feedbackModal.classList.remove('show');
            feedbackForm.reset(); // Clear form on close
            feedbackFormMessages.textContent = ''; // Clear messages
            feedbackFormMessages.classList.remove('success');
        });

        // Close modal if user clicks outside of it
        window.addEventListener('click', (event) => {
            if (event.target === feedbackModal) {
                feedbackModal.classList.remove('show');
                feedbackForm.reset();
                feedbackFormMessages.textContent = '';
                feedbackFormMessages.classList.remove('success');
            }
        });

        feedbackForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
            feedbackFormMessages.textContent = ''; // Clear previous messages
            feedbackFormMessages.classList.remove('success');

            let isValid = true;
            let messages = [];

            // Name validation
            if (feedbackNameInput.value.trim() === '') {
                messages.push('Name is required.');
                isValid = false;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (feedbackEmailInput.value.trim() === '') {
                messages.push('Email is required.');
                isValid = false;
            } else if (!emailRegex.test(feedbackEmailInput.value.trim())) {
                messages.push('Please enter a valid email address.');
                isValid = false;
            }

            // Message validation
            if (feedbackMessageInput.value.trim() === '') {
                messages.push('Message is required.');
                isValid = false;
            }

            if (isValid) {
                // In a real application, you would send this data to a server
                console.log('Feedback submitted:', {
                    name: feedbackNameInput.value,
                    email: feedbackEmailInput.value,
                    message: feedbackMessageInput.value
                });
                feedbackFormMessages.textContent = 'Thank you for your feedback!';
                feedbackFormMessages.classList.add('success');
                feedbackForm.reset(); // Clear form fields
                // Optionally, close modal after a short delay
                setTimeout(() => {
                    feedbackModal.classList.remove('show');
                    feedbackFormMessages.textContent = '';
                    feedbackFormMessages.classList.remove('success');
                }, 2000);
            } else {
                feedbackFormMessages.textContent = messages.join(' ');
            }
        });
    }
}