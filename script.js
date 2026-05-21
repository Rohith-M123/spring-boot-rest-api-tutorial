/* ==========================================================================
   ADVANCED BACKEND SIMULATION LAB ENGINE
   Governs interactive Postman playground, MySQL tables, JWT validators,
   Microservice network flows, Caching latencies, and Academy graders.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Global sound triggers wrapped to bypass standard browser restrictions
  function playSystemSound(soundId) {
    try {
      const snd = document.getElementById(soundId);
      if (snd) {
        snd.currentTime = 0;
        snd.play().catch(() => {/* Ignore browser audio constraints */});
      }
    } catch (e) {
      console.warn("Audio play blocked: ", e);
    }
  }

  /* ==========================================
     1. MODULAR TAB ROUTER & PROGRESS
     ========================================== */
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const titleLabel = document.getElementById('viewport-title-label');
  const descLabel = document.getElementById('viewport-desc-label');
  const barOverallProgress = document.getElementById('bar-overall-progress');
  const txtOverallProgress = document.getElementById('txt-overall-progress');
  const checkpointIndicator = document.getElementById('checkpoint-indicator');

  // Track achievements/states to feed progress
  const simulationStates = {
    apiRunCount: 0,
    annotationExplored: {},
    jwtGenerated: false,
    jwtAuthAttempted: false,
    msTriggered: false,
    perfTested: false,
    quizScore: 0,
    quizFinished: false,
    unlockedBadges: new Set()
  };

  const tabMetadata = {
    'api-lab': {
      title: "API & Architecture Lab",
      desc: "Interactive developer workshop visualizing layered REST API execution pipelines."
    },
    'annotation-lab': {
      title: "Spring Boot Annotation Explorer",
      desc: "Learn core Spring annotations, dependencies injection, and backend design systems."
    },
    'jwt-lab': {
      title: "JWT Security Sandbox",
      desc: "Analyse stateless session tokens, inspect base64 components, and test locked paths."
    },
    'microservices-lab': {
      title: "Microservice Mesh Arena",
      desc: "Trace distributed cloud transactions, service discovery registries, and resilience failovers."
    },
    'performance-lab': {
      title: "Performance & DevOps Visualizer",
      desc: "Witness Redis in-memory caching speeds and trace production CI/CD pipelines."
    },
    'academy-lab': {
      title: "Academy & Quiz Desk",
      desc: "Test your backend architectural knowledge and secure certified achievement badges."
    }
  };

  function switchTab(tabId) {
    navItems.forEach(item => item.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));

    const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    const activePane = document.getElementById(`tab-${tabId}`);

    if (activeNav && activePane) {
      activeNav.classList.add('active');
      activePane.classList.add('active');

      const meta = tabMetadata[tabId];
      titleLabel.innerText = meta.title;
      descLabel.innerText = meta.desc;
      
      playSystemSound('snd-click');
      updateProgressTelemetry();
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Telemetry Progress system
  function updateProgressTelemetry() {
    let progress = 0;
    
    // API playground completions (15%)
    if (simulationStates.apiRunCount > 0) progress += 15;
    
    // Annotation explorations (20%)
    const exploredCount = Object.keys(simulationStates.annotationExplored).length;
    progress += Math.min(exploredCount * 2, 20);

    // JWT security completion (20%)
    if (simulationStates.jwtGenerated) progress += 10;
    if (simulationStates.jwtAuthAttempted) progress += 10;

    // Microservices and Performance completion (20%)
    if (simulationStates.msTriggered) progress += 10;
    if (simulationStates.perfTested) progress += 10;

    // Quiz completion (25%)
    if (simulationStates.quizFinished) {
      progress += 25;
    } else {
      progress += Math.min(simulationStates.quizScore * 4, 20);
    }

    // Update HTML elements
    barOverallProgress.style.width = `${progress}%`;
    txtOverallProgress.innerText = `${progress}%`;

    // Dynamic Class Rank Title
    if (progress < 30) {
      checkpointIndicator.innerHTML = '<i class="fa-solid fa-flag"></i> Novice Class';
    } else if (progress < 60) {
      checkpointIndicator.innerHTML = '<i class="fa-solid fa-medal"></i> Associate Engineer';
    } else if (progress < 90) {
      checkpointIndicator.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Principal Developer';
    } else {
      checkpointIndicator.innerHTML = '<i class="fa-solid fa-crown"></i> Enterprise Architect';
    }

    // Unlock badges
    checkAndUnlockBadges(progress);
  }

  function checkAndUnlockBadges(progress) {
    // Badge 1: Seedling (Novice)
    if (simulationStates.quizScore >= 1 && !simulationStates.unlockedBadges.has('novice')) {
      unlockBadge('novice');
    }
    // Badge 2: REST Master
    if (simulationStates.apiRunCount >= 3 && !simulationStates.unlockedBadges.has('rest')) {
      unlockBadge('rest');
    }
    // Badge 3: Security Officer
    if (simulationStates.jwtAuthAttempted && simulationStates.unlockedBadges.has('novice') && !simulationStates.unlockedBadges.has('security')) {
      unlockBadge('security');
    }
    // Badge 4: Master Crown
    if (progress >= 95 && simulationStates.quizScore >= 4 && !simulationStates.unlockedBadges.has('master')) {
      unlockBadge('master');
    }
  }

  function unlockBadge(badgeKey) {
    simulationStates.unlockedBadges.add(badgeKey);
    const slot = document.querySelector(`.badge-slot[data-badge="${badgeKey}"]`);
    if (slot) {
      slot.classList.remove('locked');
      slot.classList.add('unlocked');
      playSystemSound('snd-success');
    }
  }


  /* ==========================================
     2. MODULE 1: API PLAYGROUND ENGINE (POSTMAN + DB + CONSOLE)
     ========================================== */
  const btnPresetList = document.querySelectorAll('.btn-preset');
  const selHttpMethod = document.getElementById('sel-http-method');
  const iptPostmanUrl = document.getElementById('ipt-postman-url');
  const txtPostmanBody = document.getElementById('txt-postman-body');
  const postmanBodyWrapper = document.getElementById('postman-body-wrapper');
  const btnPostmanSend = document.getElementById('btn-postman-send');
  const visualTableBody = document.querySelector('#db-visual-table tbody');
  const dbActionStatus = document.getElementById('db-action-status');
  const terminalLogOutput = document.getElementById('terminal-log-output');
  const lblTerminalStatus = document.getElementById('lbl-terminal-status');
  const lblArchitectureExplanation = document.getElementById('lbl-architecture-explanation');

  // Presets mapping dictionary
  const playgroundPresets = {
    'insta-feed': {
      url: 'https://api.instagram.com/v1/feed?userId=2059',
      method: 'GET',
      dbAction: 'SELECT',
      dbTargetRow: 101,
      logs: [
        '2026-05-21 08:12:05.102 INFO  [dispatch-servlet] DispatcherServlet initialized.',
        '2026-05-21 08:12:05.105 INFO  [dispatch-servlet] GET "/v1/feed" matched to InstagramController.getFeed()',
        '2026-05-21 08:12:05.110 DEBUG [insta-service] Validating Instagram API user authentication token...',
        '2026-05-21 08:12:05.115 DEBUG [insta-repository] Executing: SELECT * FROM posts p WHERE p.user_id = 2059 ORDER BY p.created_at DESC;',
        '2026-05-21 08:12:05.120 INFO  [jackson-converter] Serializing InstagramFeedResponse object into JSON body...'
      ],
      json: `{
  "userId": 2059,
  "username": "travel_guru",
  "feed_items_count": 3,
  "posts": [
    {
      "post_id": 402,
      "caption": "Exploring the futuristic matrix visualizer! 🤖",
      "image_url": "sandbox_code.jpg",
      "likes": 1243
    },
    {
      "post_id": 399,
      "caption": "Spring Boot makes REST APIs look clean! 🍃",
      "image_url": "coffee_coding.jpg",
      "likes": 842
    }
  ]
}`,
      responseStatus: '200 OK',
      statusClass: 'ok'
    },
    'swiggy-order': {
      url: 'https://api.swiggy.com/v1/orders/create',
      method: 'POST',
      body: `{\n  "restaurantId": 1403,\n  "items": [\n    {"id": 4, "name": "Butter Naan", "qty": 2},\n    {"id": 9, "name": "Chicken Tikka", "qty": 1}\n  ],\n  "total": 540.00\n}`,
      dbAction: 'INSERT',
      dbTargetRow: 104,
      logs: [
        '2026-05-21 08:12:10.220 INFO  [dispatch-servlet] POST "/v1/orders/create" matched to SwiggyOrderController.createOrder()',
        '2026-05-21 08:12:10.225 DEBUG [jackson-converter] De-serializing JSON Request Body into OrderDto class...',
        '2026-05-21 08:12:10.232 INFO  [order-service] Starting payment gateway handshake balance verification...',
        '2026-05-21 08:12:10.240 DEBUG [order-repository] Executing: INSERT INTO orders (customer, item_name, amount_inr, status) VALUES ("guest_user", "Swiggy Dinner", 540.00, "PENDING");',
        '2026-05-21 08:12:10.245 INFO  [notification-service] Triggered async SMS order notification...'
      ],
      json: `{
  "orderId": 104,
  "restaurant": "Tandoori Palace",
  "status": "ORDER_PLACED",
  "totalPrice": 540.00,
  "deliveryPartner": "Rahul Kumar",
  "estimatedDeliveryMinutes": 32
}`,
      responseStatus: '201 Created',
      statusClass: 'created'
    },
    'amazon-search': {
      url: 'https://api.amazon.com/v1/products/search?query=headphones',
      method: 'GET',
      dbAction: 'SELECT',
      dbTargetRow: 103,
      logs: [
        '2026-05-21 08:12:15.805 INFO  [dispatch-servlet] GET "/v1/products/search" matched to AmazonSearchController.search()',
        '2026-05-21 08:12:15.812 DEBUG [search-service] Routing query request to Elasticsearch Product Catalog Index...',
        '2026-05-21 08:12:15.820 DEBUG [search-repository] Executing: SELECT * FROM products p WHERE p.name LIKE "%headphones%";',
        '2026-05-21 08:12:15.828 INFO  [jackson-converter] Mapping ProductList to JSON array...'
      ],
      json: `{
  "query": "headphones",
  "results_found": 1,
  "products": [
    {
      "productId": 103,
      "name": "Bose QuietComfort 45",
      "price_usd": 329.00,
      "rating": 4.8,
      "stock": 14
    }
  ]
}`,
      responseStatus: '200 OK',
      statusClass: 'ok'
    },
    'whatsapp-send': {
      url: 'https://api.whatsapp.com/v1/messages/send',
      method: 'POST',
      body: `{\n  "recipient": "+919876543210",\n  "message": "Hey! Let's pair-code in Spring Boot! 🚀"\n}`,
      dbAction: 'INSERT',
      dbTargetRow: 105,
      logs: [
        '2026-05-21 08:12:20.402 INFO  [dispatch-servlet] POST "/v1/messages/send" matched to WhatsappController.sendMessage()',
        '2026-05-21 08:12:20.410 DEBUG [message-service] Checking cell connection signal packet validation status...',
        '2026-05-21 08:12:20.415 DEBUG [message-repository] Executing: INSERT INTO message_logs (recipient, payload, timestamp) VALUES ("+919876543210", "Hey! Lets pair-code...", NOW());',
        '2026-05-21 08:12:20.420 INFO  [push-notifier] Transmitting data payload to client mobile gateway...'
      ],
      json: `{
  "messageId": "WA-88492049",
  "status": "SENT_TO_GATEWAY",
  "recipient": "+919876543210",
  "timestamp": "2026-05-21T08:12:20.420Z"
}`,
      responseStatus: '201 Created',
      statusClass: 'created'
    },
    'netflix-rec': {
      url: 'https://api.netflix.com/v1/users/994/recommendations',
      method: 'GET',
      dbAction: 'SELECT',
      dbTargetRow: null,
      logs: [
        '2026-05-21 08:12:25.101 INFO  [dispatch-servlet] GET "/v1/users/{id}/recommendations" matched to NetflixRecController.getRecommendations()',
        '2026-05-21 08:12:25.105 DEBUG [cache-service] Redis Check: checking cache key user:994:recommendations...',
        '2026-05-21 08:12:25.110 INFO  [cache-service] Cache Hit! Skipping database query entirely. Highly optimized!',
        '2026-05-21 08:12:25.115 INFO  [jackson-converter] Formulating payload JSON...'
      ],
      json: `{
  "userId": 994,
  "cache_hit": true,
  "recommended_shows": [
    {
      "showId": 8839,
      "title": "Stranger Things",
      "matchPercentage": 98,
      "genre": "Sci-Fi"
    },
    {
      "showId": 4022,
      "title": "Black Mirror",
      "matchPercentage": 95,
      "genre": "Anthology"
    }
  ]
}`,
      responseStatus: '200 OK',
      statusClass: 'ok'
    },
    'upi-pay': {
      url: 'https://api.upi.pay/v1/transactions/transfer',
      method: 'POST',
      body: `{\n  "payeeVpa": "merchant@ybl",\n  "amount": 2500.00,\n  "remarks": "API Platform Upgrade"\n}`,
      dbAction: 'INSERT',
      dbTargetRow: 106,
      logs: [
        '2026-05-21 08:12:30.902 INFO  [dispatch-servlet] POST "/v1/transactions/transfer" matched to UpiPaymentController.transfer()',
        '2026-05-21 08:12:30.910 DEBUG [security-filter] Decrypting encrypted banking credentials payload...',
        '2026-05-21 08:12:30.918 INFO  [bank-handshake] Contacting central NPCI clearing network...',
        '2026-05-21 08:12:30.925 DEBUG [upi-repository] Executing: INSERT INTO ledgers (payee, amount, status) VALUES ("merchant@ybl", 2500.00, "SUCCESS");',
        '2026-05-21 08:12:30.932 INFO  [jackson-converter] Constructing transaction response packet...'
      ],
      json: `{
  "transactionReference": "TXN-994829104",
  "status": "PAYMENT_SUCCESSFUL",
  "amount": 2500.00,
  "payee": "merchant@ybl",
  "timestamp": "2026-05-21T08:12:30.932Z"
}`,
      responseStatus: '200 OK',
      statusClass: 'ok'
    }
  };

  // Autotyped Spring Boot Startup Banner
  const springBootStartupText = `
  .   ____          _            __ _ _
 /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\
( ( )\\___ | '_ | '_| | '_ \\/ _\` | \\ \\ \\ \\
 \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |__\\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v3.2.0-RELEASE)

2026-05-21 08:10:35.002 INFO  [main] Starting BackendSimulationPlatformApplication using Java 21...
2026-05-21 08:10:35.005 INFO  [main] Tomcat initialized on port(s): 8080 (http)
2026-05-21 08:10:35.012 INFO  [main] Hibernate JPA Engine Loaded. Mapping dialect: MySQL8Dialect
2026-05-21 08:10:35.500 INFO  [main] Application fully booted and ready. Standing by for REST requests...
`;

  // Autotype logs to terminal console
  function printStartupBanner() {
    terminalLogOutput.innerHTML = springBootStartupText;
  }

  printStartupBanner();

  // Preset loading handler
  btnPresetList.forEach(btn => {
    btn.addEventListener('click', () => {
      btnPresetList.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const key = btn.getAttribute('data-preset');
      loadPreset(key);
    });
  });

  function loadPreset(presetKey) {
    const config = playgroundPresets[presetKey];
    selHttpMethod.value = config.method;
    iptPostmanUrl.value = config.url;

    if (config.method === 'POST' || config.method === 'PUT') {
      postmanBodyWrapper.classList.remove('hidden');
      txtPostmanBody.value = config.body || '';
    } else {
      postmanBodyWrapper.classList.add('hidden');
      txtPostmanBody.value = '';
    }
  }

  // Handle manual dropdown switching
  selHttpMethod.addEventListener('change', () => {
    if (selHttpMethod.value === 'POST' || selHttpMethod.value === 'PUT') {
      postmanBodyWrapper.classList.remove('hidden');
      if (!txtPostmanBody.value) txtPostmanBody.value = '{\n  "name": "example_item",\n  "qty": 1\n}';
    } else {
      postmanBodyWrapper.classList.add('hidden');
    }
  });

  // Flow telemetries dictionary
  const layerExplanations = {
    'layer-client': '👉 **1. Client**: Mobile / Web UI triggers an HTTP REST request (like a customer placing a menu order).',
    'layer-gateway': '👉 **2. API Gateway**: The front firewall checks authorization tokens, logs API rates, and routes calls.',
    'layer-controller': '👉 **3. @RestController**: Receives matching routes (like a waiter taking an order to the kitchen) and processes parameters.',
    'layer-service': '👉 **4. @Service**: The chef of the backend executes algorithms, calculations, checks permissions, and manages states.',
    'layer-repository': '👉 **5. @Repository**: Generates Hibernate/JPA queries to write to or retrieve from database tables.',
    'layer-database': '👉 **6. MySQL Database**: Reads or writes files and completes persistence cycles.'
  };

  const layers = document.querySelectorAll('.arch-layer');
  layers.forEach(ly => {
    ly.addEventListener('mouseenter', () => {
      const id = ly.id;
      lblArchitectureExplanation.innerHTML = `<strong>${ly.querySelector('.layer-title').innerText}</strong>:<br>${ly.getAttribute('data-layer-info')}`;
    });
    ly.addEventListener('mouseleave', () => {
      lblArchitectureExplanation.innerHTML = `Click "Send" in the playground to watch the packet travel through all 6 architectural tiers in real-time. Hover over a tier to read its specific duty.`;
    });
  });

  // Main Pipeline Animator Trigger
  btnPostmanSend.addEventListener('click', () => {
    if (btnPostmanSend.disabled) return;
    
    btnPostmanSend.disabled = true;
    playSystemSound('snd-click');

    // Find if a preset matched
    const presetKey = document.querySelector('.btn-preset.active')?.getAttribute('data-preset') || 'insta-feed';
    const config = playgroundPresets[presetKey];

    // Wipe logs and display "Inbound Handshake Request"
    terminalLogOutput.innerHTML = `[REST API REQUEST RECEIVED] ---> Initiating Handshake...\n`;
    lblTerminalStatus.innerText = 'WAITING';
    lblTerminalStatus.className = 'console-telemetry-badge';

    // Step 1: Forward flow
    let step = 0;
    const totalSteps = 6;
    const stepDuration = 850; // ms

    function animateStep() {
      if (step < totalSteps) {
        // Glimmer active layer
        layers.forEach(ly => ly.classList.remove('active-glow'));
        const activeLayerId = `layer-${['client', 'gateway', 'controller', 'service', 'repository', 'database'][step]}`;
        const targetLayer = document.getElementById(activeLayerId);
        targetLayer.classList.add('active-glow');
        
        // Print corresponding log in terminal console
        if (config.logs[step]) {
          terminalLogOutput.innerHTML += `${config.logs[step]}\n`;
        }

        // Animate packet along wire
        if (step < totalSteps - 1) {
          const packet = document.getElementById(`packet-${step + 1}`);
          packet.className = 'arch-packet anim-forward';
          setTimeout(() => {
            packet.className = 'arch-packet';
          }, stepDuration);
        }

        // Database row highlight updates on step 5 (Database Layer reached!)
        if (step === 5) {
          executeVisualDatabaseOperation(config);
        }

        step++;
        setTimeout(animateStep, stepDuration);
      } else {
        // Step 2: Backward Flow (Returning response back)
        terminalLogOutput.innerHTML += `2026-05-21 08:12:35.990 INFO  [dispatch-servlet] Returning response with status: ${config.responseStatus}\n`;
        
        layers.forEach(ly => ly.classList.remove('active-glow'));
        
        // Type write JSON response at the bottom
        typeWriteConsoleJson(config.json, () => {
          lblTerminalStatus.innerText = config.responseStatus;
          lblTerminalStatus.className = `console-telemetry-badge ${config.statusClass}`;
          
          btnPostmanSend.disabled = false;
          simulationStates.apiRunCount++;
          updateProgressTelemetry();
          playSystemSound('snd-success');
        });
      }
    }

    animateStep();
  });

  function executeVisualDatabaseOperation(config) {
    if (!config.dbTargetRow) {
      dbActionStatus.innerText = 'SELECT (CACHE SKIP)';
      return;
    }

    dbActionStatus.innerText = `${config.dbAction} TRIGGERED`;

    if (config.dbAction === 'SELECT') {
      const row = document.querySelector(`tr[data-row-id="${config.dbTargetRow}"]`);
      if (row) {
        row.className = 'highlight-db-update';
        setTimeout(() => { row.className = ''; }, 2000);
      }
    } else if (config.dbAction === 'INSERT') {
      // Create new visual row
      const newRow = document.createElement('tr');
      newRow.setAttribute('data-row-id', config.dbTargetRow);
      newRow.className = 'highlight-db-insert';
      
      let customer = 'guest_user';
      let item = 'Swiggy Dinner';
      let val = '540.00';
      let status = 'PENDING';

      if (config.dbTargetRow === 105) {
        customer = 'mollie_dev';
        item = 'WhatsApp Message Payload';
        val = '0.00';
        status = 'ACTIVE';
      } else if (config.dbTargetRow === 106) {
        customer = 'merchant_pay';
        item = 'UPI Transfer';
        val = '2500.00';
        status = 'COMPLETED';
      }

      newRow.innerHTML = `
        <td>${config.dbTargetRow}</td>
        <td>${customer}</td>
        <td>${item}</td>
        <td>${val}</td>
        <td><span class="db-status success">${status}</span></td>
      `;

      visualTableBody.appendChild(newRow);
      setTimeout(() => { newRow.className = ''; }, 2500);
    }
  }

  function typeWriteConsoleJson(text, callback) {
    const lines = text.split('\n');
    let idx = 0;
    terminalLogOutput.innerHTML += `\n[RESPONSE BODY (JSON)]:\n`;

    const interval = setInterval(() => {
      if (idx < lines.length) {
        let lineHTML = lines[idx]
          .replace(/"([^"]+)":/g, '<span class="string">"$1"</span>:')
          .replace(/: ("[^"]+")/g, ': <span class="string">$1</span>')
          .replace(/: (\d+\.?\d*)/g, ': <span class="number">$1</span>')
          .replace(/: (true|false)/g, ': <span class="keyword">$1</span>');

        terminalLogOutput.innerHTML += `${lineHTML}\n`;
        idx++;
      } else {
        clearInterval(interval);
        if (callback) callback();
      }
    }, 45); // Line speed
  }


  /* ==========================================
     3. MODULE 2: SPRING BOOT ANNOTATION EXPLORER
     ========================================== */
  const annoButtons = document.querySelectorAll('.annotation-btn');
  const detailsPanel = document.getElementById('annotation-details-content');
  const placeholderPanel = document.getElementById('annotation-placeholder');
  const txtTitle = document.getElementById('txt-details-title');
  const txtCategory = document.getElementById('txt-details-category');
  const txtAnalogy = document.getElementById('txt-details-analogy');
  const txtCode = document.getElementById('txt-details-code');
  const txtWhy = document.getElementById('txt-details-why');
  const txtInterview = document.getElementById('txt-details-interview');

  const annotationsDictionary = {
    'restcontroller': {
      title: '@RestController',
      category: 'Controller Layer',
      why: "Combines @Controller and @ResponseBody. Tells Spring Boot that this class is an HTTP endpoint. It bypasses classic HTML rendering and directly maps the returned Java object into lightweight JSON strings.",
      analogy: "The head waiter standing at a restaurant lobby door. When customers walk in requesting specific items, the waiter handles requests directly and brings plates straight back rather than giving directions to the kitchen.",
      interview: "Question: 'What is inside @RestController?' Answer: 'It is a composite annotation combining @Controller (registering the class as a bean) and @ResponseBody (which intercepts return objects and maps them into JSON using Jackson).'",
      code: `@RestController
public class OrderController {
    // Endpoints go here...
}`
    },
    'getmapping': {
      title: '@GetMapping',
      category: 'HTTP Requests Mapping',
      why: "Maps HTTP GET requests to specific Java methods. Used exclusively for reading/fetching data from database records without modifying server state.",
      analogy: "A restaurant's menu board. When you look at the board, you are retrieving prices and ingredients (GET), but you aren't changing anything inside the restaurant's inventory.",
      interview: "Question: 'Are GET requests secure?' Answer: 'GET parameters are sent inside the visible URL query, meaning they remain cached in browser histories. They are NOT safe for sensitive credentials like passwords.'",
      code: `@GetMapping("/orders/{id}")
public Order getOrder(@PathVariable("id") int id) {
    return orderService.fetchOrder(id);
}`
    },
    'postmapping': {
      title: '@PostMapping',
      category: 'HTTP Requests Mapping',
      why: "Routes HTTP POST requests containing dynamic JSON body data to backend logic. Typically used for creating new rows or submitting profiles.",
      analogy: "Placing a brand new food order at the Swiggy checkout register. You fill a basket with food items and submit it (POST) which creates a new transaction entry.",
      interview: "Question: 'What is the default HTTP status code returned by a successful POST in Spring?' Answer: 'Usually 200 OK, but standard REST guidelines recommend returning 201 Created.'",
      code: `@PostMapping("/orders/create")
public String create(@RequestBody Order order) {
    orderService.save(order);
    return "Created successfully!";
}`
    },
    'putmapping': {
      title: '@PutMapping',
      category: 'HTTP Requests Mapping',
      why: "Maps HTTP PUT requests onto methods. Typically used for modifying or replacing entire existing entries in the database.",
      analogy: "Calling Swiggy customer care to completely edit your existing delivery address while the driver is in transit.",
      interview: "Question: 'What is PUT vs PATCH?' Answer: 'PUT completely replaces/updates the entire resource profile. PATCH performs partial updates on specific fields.'",
      code: `@PutMapping("/orders/update/{id}")
public Order update(@PathVariable int id, @RequestBody Order updated) {
    return orderService.replaceOrder(id, updated);
}`
    },
    'deletemapping': {
      title: '@DeleteMapping',
      category: 'HTTP Requests Mapping',
      why: "Routes HTTP DELETE commands. Removes rows from persistent databases.",
      analogy: "Cancelling an order completely and removing its card from your active Swiggy dashboard.",
      interview: "Question: 'Can a DELETE request have a body?' Answer: 'Yes, but standard HTTP structures do not recommend it. It is best to pass identifiers directly in the URL.'",
      code: `@DeleteMapping("/orders/delete/{id}")
public String delete(@PathVariable int id) {
    orderService.remove(id);
    return "Successfully deleted order #" + id;
}`
    },
    'pathvariable': {
      title: '@PathVariable',
      category: 'Parameters Binding',
      why: "Binds dynamic placeholders inside URL strings (e.g. `/products/{id}`) directly into Java method parameters.",
      analogy: "Opening a locker. The locker number is written on the locker key itself (path variable). Tying the number directly to the lock code allows entry.",
      interview: "Question: 'What happens if the variable name doesn't match the path placeholder?' Answer: 'You must declare the exact path name inside path variable parameters: @PathVariable(\"id\") int productId.'",
      code: `@GetMapping("/users/{username}")
public User getProfile(@PathVariable("username") String name) {
    return userService.findByName(name);
}`
    },
    'requestbody': {
      title: '@RequestBody',
      category: 'Parameters Binding',
      why: "Captures raw inbound JSON text payloads from the invisible HTTP Request Body and translates them instantly into Java Objects.",
      analogy: "The cargo loading hold of a delivery truck. Inside the box are raw pieces which the receiver unpacks and maps into internal storage shelves.",
      interview: "Question: 'What exception is thrown if JSON fields are incorrect?' Answer: 'HttpMessageNotReadableException is thrown if the incoming JSON formats are corrupt.'",
      code: `@PostMapping("/users/register")
public User register(@RequestBody User user) {
    return userService.save(user);
}`
    },
    'autowired': {
      title: '@Autowired',
      category: 'Dependency Injection',
      why: "Automates Dependency Injection. Instructs Spring's engine to lookup and auto-inject matching registered classes (beans) without using 'new' keywords.",
      analogy: "The restaurant chef stepping into the kitchen and finding a perfectly forged, sharp knife placed right on their table by the manager.",
      interview: "Question: 'What is the recommended injection strategy?' Answer: 'Constructor injection is preferred over field injection as it ensures immutable beans and supports testing.'",
      code: `@RestController
public class OrderController {
    private final OrderService orderService;

    @Autowired // Auto-injects service bean
    public OrderController(OrderService os) {
        this.orderService = os;
    }
}`
    },
    'service': {
      title: '@Service',
      category: 'Core Service Layer',
      why: "Registers a class as a Spring Bean holding specialized business algorithms, calculations, and rules.",
      analogy: "The Head Chef inside the kitchen. The chef does not talk to clients directly. Instead, they process raw food orders and execute recipes.",
      interview: "Question: 'What is the difference between @Service and @Component?' Answer: '@Service is a specialized stereotype annotation. Underneath it is mapped with @Component, but it makes the architecture self-documenting.'",
      code: `@Service
public class OrderService {
    public void validateOrder(Order o) {
        // Business logic check...
    }
}`
    },
    'repository': {
      title: '@Repository',
      category: 'Repository DB Layer',
      why: "Registers database mapping interfaces, executing high-speed SQL statements via JPA/Hibernate automatically.",
      analogy: "The stock manager in the restaurant basement. When the chef needs items, the manager fetches, updates, or adds crates to the storage racks.",
      interview: "Question: 'How does @Repository handle transactions?' Answer: 'Spring repository actions are @Transactional by default, automatically reverting database rows if exceptions crash mid-process.'",
      code: `@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    // Custom database methods go here...
}`
    },
    'component': {
      title: '@Component',
      category: 'Core Service Layer',
      why: "The core mother annotation. Tells Spring, 'Detect this class during startup scans and register it as an active managed bean.'",
      analogy: "Any custom appliance inside the kitchen (like an automatic timer or a toaster) that is managed and powered by the restaurant's outlets.",
      interview: "Question: 'What are the main stereotypes that inherit @Component?' Answer: '@Controller, @Service, and @Repository all inherit @Component.'",
      code: `@Component
public class TokenGenerator {
    public String generateUuid() {
        return UUID.randomUUID().toString();
    }
}`
    }
  };

  annoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      annoButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const key = btn.getAttribute('data-anno');
      renderAnnotationDetails(key);
      
      // Update explorations state
      simulationStates.annotationExplored[key] = true;
      updateProgressTelemetry();
    });
  });

  function renderAnnotationDetails(key) {
    const config = annotationsDictionary[key];
    
    placeholderPanel.classList.add('hidden');
    detailsPanel.classList.remove('hidden');

    txtTitle.innerText = config.title;
    txtCategory.innerText = config.category;
    txtAnalogy.innerText = config.analogy;
    txtWhy.innerText = config.why;
    txtInterview.innerText = config.interview;
    txtCode.innerText = config.code;
  }

  // Load first annotation by default
  renderAnnotationDetails('restcontroller');


  /* ==========================================
     4. MODULE 3: JWT SECURITY SANDBOX
     ========================================== */
  const btnJwtLogin = document.getElementById('btn-jwt-login');
  const btnJwtTestUnauth = document.getElementById('btn-jwt-test-unauth');
  const btnJwtTestAuth = document.getElementById('btn-jwt-test-auth');
  const iptJwtUser = document.getElementById('ipt-jwt-user');
  const txtJwtDecodedHeader = document.getElementById('txt-jwt-decoded-header');
  const txtJwtDecodedPayload = document.getElementById('txt-jwt-decoded-payload');
  const jwtSecurityPacket = document.getElementById('jwt-security-packet');
  const lblJwtFlowStatus = document.getElementById('lbl-jwt-flow-status');
  const jwtNodeClient = document.getElementById('jwt-node-client');
  const jwtNodeServer = document.getElementById('jwt-node-server');

  let generatedToken = '';

  btnJwtLogin.addEventListener('click', () => {
    playSystemSound('snd-click');
    
    const user = iptJwtUser.value || 'mollie_developer';
    
    // Header & Payload decoders update
    txtJwtDecodedHeader.innerHTML = JSON.stringify({ "alg": "HS256", "typ": "JWT" }, null, 2);
    txtJwtDecodedPayload.innerHTML = JSON.stringify({
      "sub": user,
      "exp": 1798530000,
      "role": "ROLE_PRINCIPAL_DEVELOPER",
      "scope": "read:dashboard write:db"
    }, null, 2);

    // Glowing animations
    const parts = document.querySelectorAll('.jwt-part');
    parts.forEach(p => {
      p.style.animation = 'pulse-amber-glow 1s ease 2';
      setTimeout(() => { p.style.removeProperty('animation'); }, 2000);
    });

    btnJwtTestAuth.disabled = false;
    simulationStates.jwtGenerated = true;
    updateProgressTelemetry();
    playSystemSound('snd-success');
  });

  // Access secured endpoint without token
  btnJwtTestUnauth.addEventListener('click', () => {
    if (btnJwtTestUnauth.disabled) return;
    triggerJwtRequestSimulation(false);
  });

  // Access secured endpoint with token
  btnJwtTestAuth.addEventListener('click', () => {
    if (btnJwtTestAuth.disabled) return;
    triggerJwtRequestSimulation(true);
  });

  function triggerJwtRequestSimulation(isAuth) {
    btnJwtTestUnauth.disabled = true;
    btnJwtTestAuth.disabled = true;

    // Reset nodes
    jwtNodeClient.className = 'jwt-node';
    jwtNodeServer.className = 'jwt-node';
    jwtSecurityPacket.style.opacity = '1';

    if (isAuth) {
      lblJwtFlowStatus.innerText = 'Transmitting Token in Headers...';
      jwtSecurityPacket.className = 'jwt-flow-packet anim-forward-ok';
      jwtNodeClient.classList.add('active-success');

      setTimeout(() => {
        lblJwtFlowStatus.innerText = 'JPA Verification Successful!';
        jwtNodeServer.classList.add('active-success');
        playSystemSound('snd-success');
        
        simulationStates.jwtAuthAttempted = true;
        updateProgressTelemetry();
      }, 1200);

    } else {
      lblJwtFlowStatus.innerText = 'Transmitting Anonymous Call...';
      jwtSecurityPacket.className = 'jwt-flow-packet anim-forward-fail';
      jwtNodeClient.classList.add('active-fail');

      setTimeout(() => {
        lblJwtFlowStatus.innerText = 'Spring Security Block: 401 Unauthorized!';
        jwtNodeServer.classList.add('active-fail');
        playSystemSound('snd-fail');
      }, 1200);
    }

    setTimeout(() => {
      jwtSecurityPacket.style.opacity = '0';
      jwtSecurityPacket.className = 'jwt-flow-packet';
      btnJwtTestUnauth.disabled = false;
      btnJwtTestAuth.disabled = !simulationStates.jwtGenerated;
    }, 2800);
  }


  /* ==========================================
     5. MODULE 4: MICROSERVICES COMMUNICATION MESH
     ========================================== */
  const btnMsTrigger = document.getElementById('btn-ms-trigger');
  const btnMsToggleOutage = document.getElementById('btn-ms-toggle-outage');
  const lblMsTelemetry = document.getElementById('lbl-ms-telemetry');
  
  let isPaymentServiceDown = false;

  btnMsToggleOutage.addEventListener('click', () => {
    isPaymentServiceDown = !isPaymentServiceDown;
    playSystemSound('snd-click');

    const nodeA = document.getElementById('ms-node-payment-1');
    const nodeB = document.getElementById('ms-node-payment-2');

    if (isPaymentServiceDown) {
      btnMsToggleOutage.innerHTML = '<i class="fa-solid fa-plug"></i> Fix Outage: Payment UP';
      btnMsToggleOutage.className = 'btn-fire-request status-up mt-1';
      nodeA.classList.add('node-outage');
      nodeB.classList.add('node-outage');
      lblMsTelemetry.innerText = 'Telemetry Alert: Payment node offline!';
    } else {
      btnMsToggleOutage.innerHTML = '<i class="fa-solid fa-plug-circle-xmark"></i> Outage: Payment Down';
      btnMsToggleOutage.className = 'btn-fire-request status-down mt-1';
      nodeA.classList.remove('node-outage');
      nodeB.classList.remove('node-outage');
      lblMsTelemetry.innerText = 'Telemetry: All nodes standard status.';
    }
  });

  // Swiggy Order Checkout Microservices Flow simulation
  btnMsTrigger.addEventListener('click', () => {
    if (btnMsTrigger.disabled) return;
    
    btnMsTrigger.disabled = true;
    playSystemSound('snd-click');

    // Canvas nodes elements
    const gateway = document.getElementById('ms-node-gateway');
    const user = document.getElementById('ms-node-user');
    const order = document.getElementById('ms-node-order');
    const eureka = document.getElementById('ms-node-eureka');
    const payment1 = document.getElementById('ms-node-payment-1');
    const payment2 = document.getElementById('ms-node-payment-2');
    const notification = document.getElementById('ms-node-notification');

    const pacA = document.getElementById('ms-packet-a');
    const pacB = document.getElementById('ms-packet-b');

    // Wipe previous node states
    const nodes = [gateway, user, order, eureka, payment1, payment2, notification];
    nodes.forEach(n => n.classList.remove('node-load-hit'));

    // Step 1: Client to API Gateway
    lblMsTelemetry.innerText = 'Step 1: REST POST received at API Gateway...';
    gateway.classList.add('node-load-hit');
    
    // Step 2: Gateway contacts Eureka Service Registry (Service Discovery)
    setTimeout(() => {
      lblMsTelemetry.innerText = 'Step 2: Gateway checks service addresses on Eureka...';
      eureka.classList.add('node-load-hit');
      
      pacA.style.opacity = '1';
      pacA.className = 'ms-packet-agent success-color';
      pacA.style.top = '10%';
      pacA.style.left = '45%';
    }, 1000);

    // Step 3: Gateway forwards to User Service
    setTimeout(() => {
      pacA.style.opacity = '0';
      eureka.classList.remove('node-load-hit');

      lblMsTelemetry.innerText = 'Step 3: Loading User Account Profile...';
      user.classList.add('node-load-hit');
    }, 2000);

    // Step 4: User Service checks out to Order Service
    setTimeout(() => {
      user.classList.remove('node-load-hit');
      lblMsTelemetry.innerText = 'Step 4: Executing Order Creation...';
      order.classList.add('node-load-hit');
    }, 3000);

    // Step 5: Order service triggers Payment Service (with Load Balancing logic!)
    setTimeout(() => {
      order.classList.remove('node-load-hit');
      
      if (isPaymentServiceDown) {
        // Failure flow! Circuit Breaker triggers
        lblMsTelemetry.innerText = 'Step 5 ALERT: Payment node down! Circuit Breaker (Resilience4j) triggered!';
        pacB.style.opacity = '1';
        pacB.className = 'ms-packet-agent fail-color';
        pacB.style.top = '48%';
        pacB.style.left = '75%';
        
        playSystemSound('snd-fail');
      } else {
        // Normal Flow: Alternate load balancing hit on Payment Node B
        lblMsTelemetry.innerText = 'Step 5: Load balancer routing to payment instance B...';
        payment2.classList.add('node-load-hit');
        
        pacB.style.opacity = '1';
        pacB.className = 'ms-packet-agent success-color';
        pacB.style.top = '58%';
        pacB.style.left = '75%';
      }
    }, 4000);

    // Step 6: Order triggers Notification service
    setTimeout(() => {
      pacB.style.opacity = '0';
      payment1.classList.remove('node-load-hit');
      payment2.classList.remove('node-load-hit');

      if (isPaymentServiceDown) {
        lblMsTelemetry.innerText = 'Step 6: Payment failed (Offline Fallback: queued notification sent).';
      } else {
        lblMsTelemetry.innerText = 'Step 6: Processing Complete! SMS Invoice delivered.';
      }
      
      notification.classList.add('node-load-hit');
      playSystemSound('snd-success');
    }, 5500);

    // Finished
    setTimeout(() => {
      nodes.forEach(n => n.classList.remove('node-load-hit'));
      btnMsTrigger.disabled = false;
      
      simulationStates.msTriggered = true;
      updateProgressTelemetry();
    }, 7200);

  });


  /* ==========================================
     6. MODULE 5: PERFORMANCE CACHING COMPARISON
     ========================================== */
  const btnPerfTestDb = document.getElementById('btn-perf-test-db');
  const btnPerfTestCache = document.getElementById('btn-perf-test-cache');
  const barPerfDb = document.getElementById('bar-perf-db');
  const barPerfCache = document.getElementById('bar-perf-cache');
  const txtPerfDbLatency = document.getElementById('txt-perf-db-latency');
  const txtPerfCacheLatency = document.getElementById('txt-perf-cache-latency');
  const lblPerfAnalysis = document.getElementById('lbl-perf-analysis');

  // DevOps pipeline step bindings
  const pipelineSteps = document.querySelectorAll('.pipeline-step');
  const lblDevopsExplanation = document.getElementById('lbl-devops-explanation');

  btnPerfTestDb.addEventListener('click', () => {
    playSystemSound('snd-click');
    btnPerfTestDb.disabled = true;

    // Simulate high latency Direct Database Select query
    txtPerfDbLatency.innerText = 'Calculating...';
    barPerfDb.style.width = '0%';
    
    setTimeout(() => {
      const randLatency = Math.floor(Math.random() * 150) + 280; // 280-430ms
      txtPerfDbLatency.innerText = `${randLatency} ms`;
      barPerfDb.style.width = '95%';
      
      lblPerfAnalysis.innerHTML = `⚠️ **DB Direct Access Overload**: Spring Boot was forced to map raw JPA interfaces, open direct DB connection threads, scan millions of files on storage, and serialize details. **Server load: High.**`;
      btnPerfTestDb.disabled = false;
      playSystemSound('snd-fail');

      simulationStates.perfTested = true;
      updateProgressTelemetry();
    }, 1500);
  });

  btnPerfTestCache.addEventListener('click', () => {
    playSystemSound('snd-click');
    btnPerfTestCache.disabled = true;

    // Simulate direct instant in-memory Redis Cache Hit
    txtPerfCacheLatency.innerText = 'Calculating...';
    barPerfCache.style.width = '0%';
    
    setTimeout(() => {
      const randLatency = Math.floor(Math.random() * 7) + 3; // 3-10ms
      txtPerfCacheLatency.innerText = `${randLatency} ms`;
      barPerfCache.style.width = '8%';
      
      lblPerfAnalysis.innerHTML = `⚡ **Redis Cache Hit (98% Speedup)**: Spring @Cacheable intercepted requests. Jackson bypassed DB lookups entirely and served the pre-compiled JSON payload straight from RAM. **Server load: Zero.**`;
      btnPerfTestCache.disabled = false;
      playSystemSound('snd-success');
    }, 800);
  });

  // DevOps dynamic descriptions
  const devopsDescriptions = {
    'local': '**Step 1: Local Host**: The developer sets up standard properties inside `application.properties` and boots Tomcat locally on port 8080. Hot-swapping modules helps inspect edits instantaneously.',
    'docker': '**Step 2: Docker Container**: A custom `Dockerfile` bundles the compiled `.jar` build package alongside a lightweight OpenJDK Java Runtime Environment. This ensures the app boots identical environments globally.',
    'cicd': '**Step 3: GitHub Actions CI/CD**: Pushing updates to GitHub launches automated container runner tests. Code quality coverage analysis executes, and build files are packaged.',
    'aws': '**Step 4: AWS Cloud Deploy**: Containers deploy to Amazon ECS / EC2 cloud networks. Incoming requests are balanced across multi-zone instances for high-availability access.'
  };

  pipelineSteps.forEach(step => {
    step.addEventListener('click', () => {
      pipelineSteps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');

      const val = step.getAttribute('data-step');
      lblDevopsExplanation.innerHTML = devopsDescriptions[val];
      playSystemSound('snd-click');
    });
  });


  /* ==========================================
     7. MODULE 6: MCQ QUIZ CHALLENGE
     ========================================== */
  const quizWorkspacePanel = document.getElementById('quiz-workspace-panel');
  const activeQuizBlock = document.getElementById('active-quiz-block');
  const quizCompleteBlock = document.getElementById('quiz-complete-block');
  
  const txtQuizCounter = document.getElementById('txt-quiz-counter');
  const txtQuizScore = document.getElementById('txt-quiz-score');
  const txtQuizQuestion = document.getElementById('txt-quiz-question');
  const listQuizAnswers = document.getElementById('list-quiz-answers');
  const btnQuizNext = document.getElementById('btn-quiz-next');
  
  const lblFinalScore = document.getElementById('lbl-final-score');
  const lblCompletionBadge = document.getElementById('lbl-completion-badge');
  const btnQuizRestart = document.getElementById('btn-quiz-restart');

  const quizQuestions = [
    {
      q: "Which Spring Boot annotation combines @Controller and @ResponseBody into one?",
      options: [
        { text: "@RestController", correct: true },
        { text: "@Service", correct: false },
        { text: "@Component", correct: false },
        { text: "@Repository", correct: false }
      ]
    },
    {
      q: "What is the primary role of the @Autowired annotation?",
      options: [
        { text: "It maps incoming HTTP GET requests", correct: false },
        { text: "It executes visual JPA database commands", correct: false },
        { text: "It triggers automatic Dependency Injection on beans", correct: true },
        { text: "It decrypts JWT stateless signatures", correct: false }
      ]
    },
    {
      q: "Which HTTP request method should strictly be used to retrieve profile details without modifying records?",
      options: [
        { text: "POST", correct: false },
        { text: "DELETE", correct: false },
        { text: "PUT", correct: false },
        { text: "GET", correct: true }
      ]
    },
    {
      q: "Stateless REST APIs transmit authentication tokens (like JWT) primarily where?",
      options: [
        { text: "Inside the local MySQL row metadata", correct: false },
        { text: "Inside the HTTP Authorization Header", correct: true },
        { text: "Inside the @PathVariable URL dynamic parameters", correct: false },
        { text: "Inside the Spring Boot terminal logs", correct: false }
      ]
    },
    {
      q: "What is Eureka in a microservices architecture?",
      options: [
        { text: "A high-speed Redis in-memory cache system", correct: false },
        { text: "A service discovery registry tracking active node addresses", correct: true },
        { text: "A security filter generating JWT tokens", correct: false },
        { text: "A Docker deployment compiler", correct: false }
      ]
    }
  ];

  let currentQuestionIdx = 0;
  let score = 0;
  let hasAnswered = false;

  function loadQuestion(idx) {
    hasAnswered = false;
    btnQuizNext.classList.add('hidden');
    
    const config = quizQuestions[idx];
    txtQuizQuestion.innerText = config.q;
    txtQuizCounter.innerText = `Question ${idx + 1} of ${quizQuestions.length}`;
    
    listQuizAnswers.innerHTML = '';
    
    config.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'answer-option';
      btn.innerText = opt.text;
      btn.addEventListener('click', () => selectAnswer(btn, opt.correct));
      listQuizAnswers.appendChild(btn);
    });
  }

  function selectAnswer(button, isCorrect) {
    if (hasAnswered) return;
    
    hasAnswered = true;
    
    const options = listQuizAnswers.querySelectorAll('.answer-option');
    options.forEach(opt => opt.disabled = true);

    if (isCorrect) {
      button.classList.add('correct-choice');
      score++;
      txtQuizScore.innerText = score;
      playSystemSound('snd-success');
      
      // Update global states
      simulationStates.quizScore = score;
      updateProgressTelemetry();
    } else {
      button.classList.add('wrong-choice');
      playSystemSound('snd-fail');

      // Highlight the correct one
      options.forEach(opt => {
        const text = opt.innerText;
        const matchingQ = quizQuestions[currentQuestionIdx].options.find(o => o.text === text);
        if (matchingQ && matchingQ.correct) {
          opt.classList.add('correct-choice');
        }
      });
    }

    btnQuizNext.classList.remove('hidden');
  }

  btnQuizNext.addEventListener('click', () => {
    currentQuestionIdx++;
    if (currentQuestionIdx < quizQuestions.length) {
      loadQuestion(currentQuestionIdx);
    } else {
      finishQuiz();
    }
  });

  function finishQuiz() {
    activeQuizBlock.classList.add('hidden');
    quizCompleteBlock.classList.remove('hidden');

    lblFinalScore.innerText = `${score} / ${quizQuestions.length}`;
    
    let badge = 'No Badge';
    if (score >= 4) {
      badge = 'Enterprise Architect 👑';
    } else if (score >= 2) {
      badge = 'Associate Engineer 🏅';
    }

    lblCompletionBadge.innerText = badge;
    simulationStates.quizFinished = true;
    updateProgressTelemetry();
  }

  btnQuizRestart.addEventListener('click', () => {
    currentQuestionIdx = 0;
    score = 0;
    txtQuizScore.innerText = '0';
    activeQuizBlock.classList.remove('hidden');
    quizCompleteBlock.classList.add('hidden');
    loadQuestion(0);
  });

  // Load first question
  loadQuestion(0);


  /* ==========================================
     8. TECHNICAL INTERVIEW FLASHCARDS
     ========================================== */
  const flashcards = document.querySelectorAll('.flashcard');
  flashcards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      playSystemSound('snd-click');
    });
  });

});
