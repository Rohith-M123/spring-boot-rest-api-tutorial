/* ==========================================================================
   INTERACTIVE ENGINE: SPRING BOOT REST API TUTORIAL
   Handles slide deck views, simulators, accordion prep tabs, and visual highlights.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. DECK NAVIGATION & SLIDE MANAGEMENT
     ========================================== */
  const slides = document.querySelectorAll('.slide-card');
  const navItems = document.querySelectorAll('.nav-menu li');
  const btnPrev = document.getElementById('btn-prev-slide');
  const btnNext = document.getElementById('btn-next-slide');
  const dotsContainer = document.getElementById('footer-dots');
  const progressPercentText = document.getElementById('progress-percentage');
  const progressBarFill = document.getElementById('progress-bar');
  const currentSlideTitle = document.getElementById('current-slide-title');

  let currentSlideIndex = 0;
  const totalSlides = slides.length;

  // Slide names to update Header Title dynamically
  const slideTitles = [
    "What is a REST API?",
    "Why APIs are Needed",
    "Understanding @RestController",
    "HTTP Methods: GET vs POST",
    "Dynamic Routes: @PathVariable",
    "Data Delivery: JSON Response Format",
    "Live API Simulator Playground",
    "Technical Interview Preparation Desk"
  ];

  // Initialize navigation dots at footer
  function initFooterDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('div');
      dot.classList.add('footer-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  // Primary navigation function
  window.goToSlide = function(index) {
    if (index < 0 || index >= totalSlides) return;

    // Reset slide cards
    slides.forEach(slide => {
      slide.classList.remove('active');
    });
    
    // Reset sidebar items
    navItems.forEach(item => {
      item.classList.remove('active');
    });

    // Set new active slide
    slides[index].classList.add('active');
    navItems[index].classList.add('active');
    currentSlideIndex = index;

    // Update Header Title
    currentSlideTitle.innerText = slideTitles[index];

    // Update progress tracker
    const percentage = Math.round(((index + 1) / totalSlides) * 100);
    progressPercentText.innerText = `${percentage}%`;
    progressBarFill.style.width = `${percentage}%`;

    // Update footer dots
    const dots = document.querySelectorAll('.footer-dot');
    dots.forEach((dot, dIdx) => {
      if (dIdx === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Handle next/prev button disable states
    btnPrev.disabled = (index === 0);
    btnNext.disabled = (index === totalSlides - 1);
  };

  // Nav Arrow Event Handlers
  btnPrev.addEventListener('click', () => {
    goToSlide(currentSlideIndex - 1);
  });

  btnNext.addEventListener('click', () => {
    goToSlide(currentSlideIndex + 1);
  });

  // Sidebar Menu Clicks
  navItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      goToSlide(idx);
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      goToSlide(currentSlideIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      goToSlide(currentSlideIndex - 1);
    }
  });

  // Initialize
  initFooterDots();
  goToSlide(0);


  /* ==========================================
     2. AESTHETIC INTEGRATIONS: THEME TOGGLE
     ========================================== */
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
  });


  /* ==========================================
     3. SLIDE 3: INTERACTIVE CODE TOOLTIPS
     ========================================== */
  const highlightElements = document.querySelectorAll('.code-highlight-interactive');
  const tooltipBox = document.getElementById('editor-tooltip-box');
  const tooltipTitle = document.getElementById('tooltip-title');
  const tooltipDesc = document.getElementById('tooltip-desc');

  const tooltipDictionary = {
    't-restcontroller': {
      title: '@RestController Annotation',
      desc: "This magical annotation does two things: registering the class as an MVC Request Listener, and automatically serializing Java responses to JSON. Tells Spring, 'Don't look for an HTML page, just output raw data directly!'"
    },
    't-getmapping': {
      title: '@GetMapping Annotation',
      desc: "Routes incoming HTTP GET requests to this specific Java method. In this example, hitting 'GET /welcome' inside your browser will invoke getWelcomeMessage() and return the custom welcome string."
    }
  };

  highlightElements.forEach(elem => {
    // Show Tooltip
    elem.addEventListener('mouseenter', (e) => {
      const tipId = elem.getAttribute('data-tip');
      if (tooltipDictionary[tipId]) {
        tooltipTitle.innerText = tooltipDictionary[tipId].title;
        tooltipDesc.innerText = tooltipDictionary[tipId].desc;
        tooltipBox.classList.add('show');
      }
    });

    // Hide Tooltip
    elem.addEventListener('mouseleave', () => {
      tooltipBox.classList.remove('show');
    });

    // Click behavior for mobile device learners
    elem.addEventListener('click', () => {
      const tipId = elem.getAttribute('data-tip');
      if (tooltipDictionary[tipId]) {
        tooltipTitle.innerText = tooltipDictionary[tipId].title;
        tooltipDesc.innerText = tooltipDictionary[tipId].desc;
        tooltipBox.classList.toggle('show');
      }
    });
  });


  /* ==========================================
     4. SLIDE 6: JAVA TO JSON TRANSLATOR
     ========================================== */
  const btnShowJava = document.getElementById('btn-show-java');
  const btnShowJson = document.getElementById('btn-show-json');
  const javaBlock = document.getElementById('java-translator-block');
  const jsonBlock = document.getElementById('json-translator-block');
  const translationFileName = document.getElementById('translation-file-name');

  btnShowJava.addEventListener('click', () => {
    btnShowJava.classList.add('active');
    btnShowJson.classList.remove('active');
    javaBlock.classList.remove('d-none');
    jsonBlock.classList.add('d-none');
    translationFileName.innerText = 'Post.java';
  });

  btnShowJson.addEventListener('click', () => {
    btnShowJson.classList.add('active');
    btnShowJava.classList.remove('active');
    jsonBlock.classList.remove('d-none');
    javaBlock.classList.add('d-none');
    translationFileName.innerText = 'post.json';
  });


  /* ==========================================
     5. SLIDE 7: LIVE API SIMULATOR ENGINE
     ========================================= */
  const selectorCards = document.querySelectorAll('.selector-card');
  const btnFireSim = document.getElementById('btn-fire-sim');
  const simDataPacket = document.getElementById('sim-data-packet');
  const simWireLabel = document.getElementById('wire-state-text');
  const serverBox = document.getElementById('server-box');
  const simAppDisplay = document.getElementById('sim-app-display');
  const simScreenTitle = document.getElementById('sim-screen-title');
  const consoleOutputText = document.getElementById('console-output-text');
  const simStatusCode = document.getElementById('sim-status-code');
  const serverAnnotationGlow = document.getElementById('server-annotation-glow');

  let activeScenario = 'instagram';

  const simulatorScenarios = {
    'instagram': {
      title: 'Instagram App',
      annotation: '@GetMapping("/posts/{id}")',
      status: '200 OK',
      statusClass: 'ok',
      wireStart: 'GET Request targeting post 405...',
      json: `{
  "post_id": 405,
  "username": "travel_guru",
  "image_url": "sunset_greece.jpg",
  "caption": "Sunset in Santorini! 🌅",
  "likes_count": 8942,
  "verified_author": true
}`,
      // Client screen layout updates
      initialScreen: `
        <div class="app-post-placeholder">
          <div class="circle-avatar"></div>
          <div class="line-skeleton short"></div>
          <div class="rect-skeleton"></div>
        </div>
      `,
      finalScreen: `
        <div class="insta-rendered-post" style="width:100%; display:flex; flex-direction:column; gap:0.25rem;">
          <div class="insta-author" style="display:flex; align-items:center; gap:0.25rem;">
            <div class="circle-avatar" style="background:#e1306c; width:16px; height:16px;"></div>
            <span style="font-size:0.55rem; font-weight:700; color:white;">travel_guru</span>
          </div>
          <div class="insta-image" style="width:100%; height:45px; background:linear-gradient(45deg, #f09433, #bc1888); border-radius:4px; display:flex; align-items:center; justify-content:center;">
            <i class="fa-solid fa-image" style="font-size:0.75rem; color:white;"></i>
          </div>
          <span style="font-size:0.5rem; color:#cbd5e1; line-height:1.2;">Sunset in Santorini! 🌅</span>
          <span style="font-size:0.45rem; font-weight:700; color:#f43f5e;"><i class="fa-solid fa-heart"></i> 8,942 likes</span>
        </div>
      `
    },
    'swiggy': {
      title: 'Swiggy App',
      annotation: '@PostMapping("/orders/create")',
      status: '201 Created',
      statusClass: 'created',
      wireStart: 'POST Request with JSON body order detail...',
      json: `{
  "order_id": "SW-77491",
  "status": "ORDER_CONFIRMED",
  "items": [
    {"name": "Paneer Butter Masala", "quantity": 1},
    {"name": "Garlic Naan", "quantity": 2}
  ],
  "total_price_inr": 450.00,
  "restaurant": "Punjabi Rasoi",
  "delivery_eta_minutes": 25
}`,
      initialScreen: `
        <div class="app-post-placeholder">
          <div class="line-skeleton"></div>
          <div class="line-skeleton short"></div>
          <div class="rect-skeleton" style="height:30px;"></div>
        </div>
      `,
      finalScreen: `
        <div class="swiggy-rendered-order" style="width:100%; text-align:center; display:flex; flex-direction:column; gap:0.25rem;">
          <i class="fa-solid fa-circle-check" style="font-size:1rem; color:#10b981;"></i>
          <span style="font-size:0.55rem; font-weight:700; color:white;">Order Confirmed!</span>
          <span style="font-size:0.45rem; color:#cbd5e1;">Punjabi Rasoi</span>
          <span style="font-size:0.5rem; font-weight:700; color:#fc8019;">Total: ₹450.00</span>
          <div style="background:rgba(16,185,129,0.1); font-size:0.4rem; padding:2px; border-radius:3px; color:#10b981;">ETA: 25 mins</div>
        </div>
      `
    },
    'amazon': {
      title: 'Amazon App',
      annotation: '@GetMapping("/products/{id}")',
      status: '200 OK',
      statusClass: 'ok',
      wireStart: 'GET Request targeting product id 8992...',
      json: `{
  "product_id": 8992,
  "title": "Redragon Mechanical Keyboard",
  "price_usd": 39.99,
  "rating_stars": 4.7,
  "stock_remaining": 14,
  "prime_eligible": true
}`,
      initialScreen: `
        <div class="app-post-placeholder">
          <div class="rect-skeleton" style="height:35px;"></div>
          <div class="line-skeleton"></div>
          <div class="line-skeleton short"></div>
        </div>
      `,
      finalScreen: `
        <div class="amazon-rendered-product" style="width:100%; display:flex; flex-direction:column; gap:0.2rem;">
          <div style="width:100%; height:40px; background:#232f3e; border-radius:4px; display:flex; align-items:center; justify-content:center;">
            <i class="fa-solid fa-keyboard" style="font-size:0.75rem; color:#ff9900;"></i>
          </div>
          <span style="font-size:0.5rem; font-weight:700; color:white; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">Redragon Keyboard</span>
          <span style="font-size:0.55rem; font-weight:700; color:#f59e0b;">$39.99</span>
          <span style="font-size:0.4rem; color:#cbd5e1;">⭐⭐⭐⭐⭐ 4.7</span>
          <span style="font-size:0.4rem; font-weight:700; color:#10b981;"><i class="fa-solid fa-truck-fast"></i> Prime Free</span>
        </div>
      `
    }
  };

  // Scenario Selector Interaction
  selectorCards.forEach(card => {
    card.addEventListener('click', () => {
      if (btnFireSim.disabled) return; // Prevent clicking scenario while animating

      // Active state toggling
      selectorCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      activeScenario = card.getAttribute('data-scenario');
      resetSimulatorUI();
    });
  });

  function resetSimulatorUI() {
    const config = simulatorScenarios[activeScenario];
    simScreenTitle.innerText = config.title;
    simAppDisplay.innerHTML = config.initialScreen;
    simWireLabel.innerText = 'Ready to Send';
    simStatusCode.innerText = '---';
    simStatusCode.className = 'status-light-indicator';
    consoleOutputText.innerHTML = '// Console clear. Press "Send HTTP Request"';
    
    serverBox.classList.remove('active');
    serverAnnotationGlow.style.opacity = '0';
    serverAnnotationGlow.innerText = config.annotation;
    
    simDataPacket.style.opacity = '0';
    simDataPacket.style.removeProperty('animation');
  }

  // Run the full visual flow simulation pipeline
  btnFireSim.addEventListener('click', () => {
    if (btnFireSim.disabled) return;

    btnFireSim.disabled = true;
    resetSimulatorUI();

    const config = simulatorScenarios[activeScenario];
    
    // Step 1: Fire Request Packet
    simWireLabel.innerText = config.wireStart;
    simDataPacket.style.opacity = '1';
    simDataPacket.style.animation = 'packet-forward 1s cubic-bezier(0.4, 0, 0.2, 1) forwards';

    // Step 2: Packet arrives at Server
    setTimeout(() => {
      simWireLabel.innerText = 'Processing Request...';
      serverBox.classList.add('active');
      serverAnnotationGlow.style.opacity = '1';

      // Blinking rack animation simulated via CSS
    }, 1000);

    // Step 3: Server completes work and sends Response Packet back
    setTimeout(() => {
      simWireLabel.innerText = 'Sending Back JSON Response...';
      simDataPacket.style.removeProperty('animation');
      
      // Force reflow to restart animation
      void simDataPacket.offsetWidth;
      
      simDataPacket.style.animation = 'packet-backward 1s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    }, 2200);

    // Step 4: Packet returns to Client Device -> Render Console Output & UI
    setTimeout(() => {
      simWireLabel.innerText = 'Response Completed!';
      simDataPacket.style.opacity = '0';

      // Update response status code
      simStatusCode.innerText = config.status;
      simStatusCode.classList.add(config.statusClass);

      // Typing animation for JSON console
      typeWriteJsonConsole(config.json, () => {
        // Render completed client UI inside phone screen
        simAppDisplay.innerHTML = config.finalScreen;
        btnFireSim.disabled = false;
      });

    }, 3200);
  });

  // Typing effect helper for JSON console
  function typeWriteJsonConsole(text, callback) {
    consoleOutputText.innerHTML = '';
    
    // Instead of character-by-character typing which is slow for large JSON,
    // we type line-by-line using intervals to maintain rich fluid visuals!
    const lines = text.split('\n');
    let lineIdx = 0;
    
    const interval = setInterval(() => {
      if (lineIdx < lines.length) {
        // Escapes or applies simple colors for highlights
        let lineHTML = lines[lineIdx]
          .replace(/"([^"]+)":/g, '<span class="string">"$1"</span>:')
          .replace(/: ("[^"]+")/g, ': <span class="string">$1</span>')
          .replace(/: (\d+)/g, ': <span class="number">$1</span>')
          .replace(/: (true|false)/g, ': <span class="keyword">$1</span>');
          
        consoleOutputText.innerHTML += lineHTML + '\n';
        consoleOutputText.scrollTop = consoleOutputText.scrollHeight; // Auto-scroll
        lineIdx++;
      } else {
        clearInterval(interval);
        if (callback) callback();
      }
    }, 60); // fast line printing
  }

  // Initialize visual states on startup
  resetSimulatorUI();


  /* ==========================================
     6. SLIDE 8: ACCORDION PREP PANEL
     ========================================== */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const parentItem = header.parentElement;
      const isActive = parentItem.classList.contains('active');

      // Collapse all items first for clean, single-open accordion behavior
      document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
      });

      // Toggle active state
      if (!isActive) {
        parentItem.classList.add('active');
      }
    });
  });

});
