/* ==========================================================================
   SPRING DINER SIMULATION LAB - INTERACTIVE JS ENGINE
   Translates complex Spring Boot architectures into simple restaurant analogies.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Global sound triggers
  function playSystemSound(soundId) {
    try {
      const snd = document.getElementById(soundId);
      if (snd) {
        snd.currentTime = 0;
        snd.play().catch(() => {/* Ignore browser audio rules */});
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

  const simulationStates = {
    apiRunCount: 0,
    annotationExplored: {},
    jwtGenerated: false,
    jwtAuthAttempted: false,
    perfTested: false,
    quizScore: 0,
    quizFinished: false,
    unlockedBadges: new Set()
  };

  const tabMetadata = {
    'api-lab': {
      title: "Diner Flow (REST API)",
      desc: "Witness how an API works using the simple analogy of a restaurant diner!"
    },
    'annotation-lab': {
      title: "Spring Kitchen Annotations",
      desc: "Learn Spring's special code stickers using helpful everyday kitchen roles."
    },
    'jwt-lab': {
      title: "Ticket Security (JWT Sandbox)",
      desc: "Understand secure, stateless API logins using stamped VIP paper wristbands."
    },
    'academy-lab': {
      title: "Academy & Caching Desk",
      desc: "Simulate fast fruit-bowl caching speed and graduate with your final Diner check-points."
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

  // Simple progression scorer
  function updateProgressTelemetry() {
    let progress = 0;
    
    // Diner Playground presets executed (25%)
    if (simulationStates.apiRunCount > 0) progress += 25;
    
    // Stickers explored (25%)
    const exploredCount = Object.keys(simulationStates.annotationExplored).length;
    progress += Math.min(exploredCount * 4, 25);

    // Security Sandbox tests completed (25%)
    if (simulationStates.jwtGenerated) progress += 12;
    if (simulationStates.jwtAuthAttempted) progress += 13;

    // Caching & Quiz completed (25%)
    if (simulationStates.perfTested) progress += 10;
    if (simulationStates.quizFinished) {
      progress += 15;
    } else {
      progress += Math.min(simulationStates.quizScore * 3, 12);
    }

    barOverallProgress.style.width = `${progress}%`;
    txtOverallProgress.innerText = `${progress}%`;

    // Dynamic Beginner Ranks
    if (progress < 30) {
      checkpointIndicator.innerHTML = '<i class="fa-solid fa-baby"></i> Diner Novice';
    } else if (progress < 65) {
      checkpointIndicator.innerHTML = '<i class="fa-solid fa-cookie"></i> Apprentice Cook';
    } else if (progress < 90) {
      checkpointIndicator.innerHTML = '<i class="fa-solid fa-fire-burner"></i> Kitchen Manager';
    } else {
      checkpointIndicator.innerHTML = '<i class="fa-solid fa-crown"></i> Diner Master Chef';
    }

    checkAndUnlockBadges(progress);
  }

  function checkAndUnlockBadges(progress) {
    // 1. Helper Badge
    if (simulationStates.quizScore >= 1 && !simulationStates.unlockedBadges.has('novice')) {
      unlockBadge('novice');
    }
    // 2. Manager Badge
    if (simulationStates.apiRunCount >= 3 && !simulationStates.unlockedBadges.has('rest')) {
      unlockBadge('rest');
    }
    // 3. VIP Badge
    if (simulationStates.jwtAuthAttempted && !simulationStates.unlockedBadges.has('security')) {
      unlockBadge('security');
    }
    // 4. Crown Badge
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
     2. MODULE 1: DINER FLOW SIMULATOR (POSTMAN & RESTAURANT WORKERS)
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

  const playgroundPresets = {
    'insta-feed': {
      url: 'https://api.instagram.com/v1/feed?userId=2059',
      method: 'GET',
      dbAction: 'SELECT',
      dbTargetRow: 101,
      logs: [
        'INFO  [DispatcherServlet] GET "/v1/feed" matched to InstagramController (Waiter greeted client & read the Instagram order request)',
        'DEBUG [SecurityFilter] API Key verified successfully (Security Guard checked user VIP card)',
        'INFO  [RestController] Extracting parameters: userId=2059 (Waiter writes down your table number)',
        'INFO  [InstagramService] Fetching posts feed calculations (Chef starts executing the Instagram feed recipe)',
        'DEBUG [InstagramRepository] SQL Executed: SELECT * FROM posts p WHERE p.user_id = 2059 (Pantry Assistant grabs raw ingredients from fridge)',
        'INFO  [JacksonSerializer] Mapping Java to JSON string response (Waiter plates the meal in clean bowls)'
      ],
      json: `{
  "userId": 2059,
  "username": "travel_dave",
  "feed_items": [
    {
      "post_id": 402,
      "caption": "Exploring beautiful mountain peaks! 🏔️",
      "likes_count": 890
    },
    {
      "post_id": 399,
      "caption": "Writing code in a cozy cafe ☕",
      "likes_count": 1240
    }
  ]
}`,
      responseStatus: '200 OK',
      statusClass: 'ok'
    },
    'swiggy-order': {
      url: 'https://api.swiggy.com/v1/orders/create',
      method: 'POST',
      body: `{\n  "itemName": "Double Cheese Burger",\n  "price": 9.99,\n  "customer": "sarah_k"\n}`,
      dbAction: 'INSERT',
      dbTargetRow: 104,
      logs: [
        'INFO  [DispatcherServlet] POST "/v1/orders/create" matched to SwiggyOrderController (Waiter reads order card)',
        'DEBUG [JacksonParser] Parsing request body JSON into Order object (Waiter translates customer details for chef)',
        'INFO  [OrderService] Cooking logic started. Checking price minimums (Chef checks food expiration dates)',
        'DEBUG [OrderRepository] SQL Executed: INSERT INTO orders (customer, item, price) VALUES ("sarah_k", "Burger", 9.99) (Pantry Assistant adds a new bag to fridge storage)',
        'INFO  [NotificationService] SMS Invoice triggered asynchronously (Diner rings cash register bell)'
      ],
      json: `{
  "orderId": 104,
  "status": "ORDER_COOKING",
  "estimatedDeliveryMinutes": 25,
  "totalPrice": 9.99
}`,
      responseStatus: '201 Created',
      statusClass: 'created'
    },
    'amazon-search': {
      url: 'https://api.amazon.com/v1/products/search?query=mouse',
      method: 'GET',
      dbAction: 'SELECT',
      dbTargetRow: 103,
      logs: [
        'INFO  [DispatcherServlet] GET "/v1/products/search" matched to ProductController (Waiter routes product request)',
        'INFO  [ProductService] Searching warehouse catalog directories (Chef pulls catalog maps)',
        'DEBUG [ProductRepository] SQL Executed: SELECT * FROM products WHERE name LIKE "%mouse%" (Pantry Assistant searches shelves)',
        'INFO  [JacksonSerializer] Binders packaging details array (Waiter plates items neatly)'
      ],
      json: `{
  "query": "mouse",
  "items_found": 1,
  "results": [
    {
      "productId": 103,
      "name": "Wireless Mouse",
      "price": 45.00,
      "stock_count": 8
    }
  ]
}`,
      responseStatus: '200 OK',
      statusClass: 'ok'
    },
    'whatsapp-send': {
      url: 'https://api.whatsapp.com/v1/messages/send',
      method: 'POST',
      body: `{\n  "to": "+12345",\n  "message": "Hi, let's learn Spring Boot! 🚀"\n}`,
      dbAction: 'INSERT',
      dbTargetRow: 105,
      logs: [
        'INFO  [DispatcherServlet] POST "/v1/messages/send" matched to WhatsappController (Waiter captures message)',
        'INFO  [MessageService] Validating phone carrier routing keys (Chef checks delivery routes)',
        'DEBUG [MessageRepository] SQL Executed: INSERT INTO messages (recipient, text) VALUES ("+12345", "Hi...") (Pantry Assistant stores logs in box)',
        'INFO  [PushGateway] Transmitting packet to cellular nodes (Diner hands plate to courier)'
      ],
      json: `{
  "messageId": "MSG-774920",
  "status": "DELIVERED_TO_PHONE",
  "to": "+12345"
}`,
      responseStatus: '201 Created',
      statusClass: 'created'
    }
  };

  const springBootStartupText = `
  .   ____          _            __ _ _
 /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\
( ( )\\___ | '_ | '_| | '_ \\/ _\` | \\ \\ \\ \\
 \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |__\\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot Diner :: (v3.2.0-RELEASE)

INFO  [main] Starting SpringDinerPlatformApplication (Tomcat booted on port 8080)
INFO  [main] Hibernate JPA Engine mapped successfully to 'mock_restaurant_db'
INFO  [main] Server fully ready! Standing by for customer orders...
`;

  function printStartupBanner() {
    terminalLogOutput.innerHTML = springBootStartupText;
  }
  printStartupBanner();

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

    if (config.method === 'POST') {
      postmanBodyWrapper.classList.remove('hidden');
      txtPostmanBody.value = config.body || '';
    } else {
      postmanBodyWrapper.classList.add('hidden');
      txtPostmanBody.value = '';
    }
  }

  // Handle manual dropdown switches
  selHttpMethod.addEventListener('change', () => {
    if (selHttpMethod.value === 'POST') {
      postmanBodyWrapper.classList.remove('hidden');
      if (!txtPostmanBody.value) txtPostmanBody.value = '{\n  "itemName": "New Dish",\n  "price": 5.99\n}';
    } else {
      postmanBodyWrapper.classList.add('hidden');
    }
  });

  const layers = document.querySelectorAll('.arch-layer');
  layers.forEach(ly => {
    ly.addEventListener('mouseenter', () => {
      lblArchitectureExplanation.innerHTML = `<strong>${ly.querySelector('.layer-title').innerText} (${ly.querySelector('.layer-badge').innerText})</strong>:<br>${ly.getAttribute('data-layer-info')}`;
    });
    ly.addEventListener('mouseleave', () => {
      lblArchitectureExplanation.innerHTML = `Click "Send Request" above to watch the order packet travel from the Customer to the Kitchen Fridge. Hover over any worker node to learn what they do.`;
    });
  });

  // Diner Pipeline Animator
  btnPostmanSend.addEventListener('click', () => {
    if (btnPostmanSend.disabled) return;
    
    btnPostmanSend.disabled = true;
    playSystemSound('snd-click');

    const presetKey = document.querySelector('.btn-preset.active')?.getAttribute('data-preset') || 'insta-feed';
    const config = playgroundPresets[presetKey];

    terminalLogOutput.innerHTML = `[DINER ORDER PLACED] ---> Waiter starting request pipeline...\n`;
    lblTerminalStatus.innerText = 'WAITING';
    lblTerminalStatus.className = 'console-telemetry-badge';

    let step = 0;
    const totalSteps = 6;
    const stepDuration = 800; // ms

    function animateStep() {
      if (step < totalSteps) {
        layers.forEach(ly => ly.classList.remove('active-glow'));
        const activeLayerId = `layer-${['client', 'gateway', 'controller', 'service', 'repository', 'database'][step]}`;
        const targetLayer = document.getElementById(activeLayerId);
        targetLayer.classList.add('active-glow');
        
        if (config.logs[step]) {
          terminalLogOutput.innerHTML += `${config.logs[step]}\n`;
          terminalLogOutput.scrollTop = terminalLogOutput.scrollHeight;
        }

        if (step < totalSteps - 1) {
          const packet = document.getElementById(`packet-${step + 1}`);
          packet.className = 'arch-packet anim-forward';
          setTimeout(() => { packet.className = 'arch-packet'; }, stepDuration);
        }

        // Database row highlight updates on step 5 (Database fridge reached!)
        if (step === 5) {
          executeVisualDatabaseOperation(config);
        }

        step++;
        setTimeout(animateStep, stepDuration);
      } else {
        // Return food back to user!
        terminalLogOutput.innerHTML += `INFO  [DispatcherServlet] Returning response to Customer with status: ${config.responseStatus}\n`;
        layers.forEach(ly => ly.classList.remove('active-glow'));
        
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
      dbActionStatus.innerText = 'SELECT';
      return;
    }

    dbActionStatus.innerText = `${config.dbAction} COMPLETE`;

    if (config.dbAction === 'SELECT') {
      const row = document.querySelector(`tr[data-row-id="${config.dbTargetRow}"]`);
      if (row) {
        row.className = 'highlight-db-update';
        setTimeout(() => { row.className = ''; }, 2000);
      }
    } else if (config.dbAction === 'INSERT') {
      // Create new visual database row
      const newRow = document.createElement('tr');
      newRow.setAttribute('data-row-id', config.dbTargetRow);
      newRow.className = 'highlight-db-insert';
      
      let customer = 'guest_user';
      let item = 'Swiggy Burger';
      let val = '$9.99';
      let status = 'PREPARING';

      if (config.dbTargetRow === 105) {
        customer = 'sam_chat';
        item = '💬 WhatsApp API Payload';
        val = '$0.00';
        status = 'SERVED';
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
    terminalLogOutput.innerHTML += `\n[MEAL SERVED (RESPONSE JSON)]:\n`;

    const interval = setInterval(() => {
      if (idx < lines.length) {
        let lineHTML = lines[idx]
          .replace(/"([^"]+)":/g, '<span class="string">"$1"</span>:')
          .replace(/: ("[^"]+")/g, ': <span class="string">$1</span>')
          .replace(/: (\d+\.?\d*)/g, ': <span class="number">$1</span>')
          .replace(/: (true|false)/g, ': <span class="keyword">$1</span>');

        terminalLogOutput.innerHTML += `${lineHTML}\n`;
        terminalLogOutput.scrollTop = terminalLogOutput.scrollHeight;
        idx++;
      } else {
        clearInterval(interval);
        if (callback) callback();
      }
    }, 50); // Speed line-by-line
  }


  /* ==========================================
     3. MODULE 2: KITCHEN ANNOTATIONS
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
      category: 'Ordering System (HTTP)',
      why: "Tells Spring Boot: 'This class represents an active waiter'. It intercepts custom REST requests (like GET/POST) and serves data directly back in standard lightweight formats (JSON).",
      analogy: "<strong>The Restaurant Waiter</strong>. The waiter stands right at the front counter. When you request a menu item, they fetch it and bring you the dish immediately on a clean tray, without forcing you to go visit the kitchen chefs.",
      interview: "Question: What does @RestController do? Answer: It tells Spring Boot that this class is an API entry point, returning raw data (JSON) directly instead of compiling old web pages.",
      code: `@RestController
public class BurgerController {
    // Waiter handles customer orders inside this class!
}`
    },
    'getmapping': {
      title: '@GetMapping',
      category: 'Ordering System (HTTP)',
      why: "Tells the waiter: 'Only trigger this method when customers request to VIEW something' (e.g. reading a menu card or looking up a profile).",
      analogy: "<strong>Reading the Menu Card</strong>. You are looking up what dishes are available and checking prices. You are fetching data, but you aren't adding any new food onto the kitchen counters.",
      interview: "Question: Can GET requests send secret passwords? Answer: No, GET parameters are written openly in the website URL bar, making them unsafe for logins.",
      code: `@GetMapping("/menu")
public List<Dish> readMenu() {
    return menuService.fetchTodayMenu();
}`
    },
    'postmapping': {
      title: '@PostMapping',
      category: 'Ordering System (HTTP)',
      why: "Tells the waiter: 'Only trigger this when a customer is SUBMITTING or CREATING something brand new' (e.g. creating an order or posting a photo).",
      analogy: "<strong>Placing a New Order Slip</strong>. You choose a double cheese burger and submit your checkout (POST), which creates a new order ticket in the kitchen's active queue.",
      interview: "Question: What code status is best for successful POST requests? Answer: While 200 OK is fine, standard guidelines recommend returning '201 Created'.",
      code: `@PostMapping("/orders/new")
public Order cookNewFood(@RequestBody Order orderDetails) {
    return orderService.startCooking(orderDetails);
}`
    },
    'pathvariable': {
      title: '@PathVariable',
      category: 'Ordering System (HTTP)',
      why: "Extracts dynamic, changing values straight out of the URL path (like `/orders/{id}`) and delivers them directly into Java method parameters.",
      analogy: "<strong>Specific Table Numbers</strong>. The waiter looks at the table number written right on your table card. It tells them exactly which specific seat to bring the burger to.",
      interview: "Question: How do you match path variables? Answer: Make sure the spelling inside the path braces matches the parameter: @PathVariable(\"id\") int orderId.",
      code: `@GetMapping("/orders/{id}")
public Order findMyFood(@PathVariable("id") int orderId) {
    return orderService.getById(orderId);
}`
    },
    'requestbody': {
      title: '@RequestBody',
      category: 'Ordering System (HTTP)',
      why: "Unpacks the incoming JSON payload card submitted by the customer and automatically converts it into a structured Java Object.",
      analogy: "<strong>The Food Customization Form</strong>. You write specific choices (e.g. 'extra cheese, no pickles') on a paper slip. The waiter takes the slip and translates it into a checklist the chef can read.",
      interview: "Question: What parses JSON in Spring? Answer: A built-in tool called 'Jackson' maps JSON strings into Java variables automatically.",
      code: `@PostMapping("/diner/register")
public Diner welcomeGuest(@RequestBody Diner details) {
    return dinerService.save(details);
}`
    },
    'autowired': {
      title: '@Autowired',
      category: 'Kitchen Staff & Tools',
      why: "Automates 'Dependency Injection'. Instead of you manually instantiating classes with the 'new' keyword, Spring automatically locates and delivers matching beans into your variables.",
      analogy: "<strong>The Automatic Utensil Hand-off</strong>. The head chef steps up to the kitchen counter. Before they can even ask, the restaurant manager automatically slides a perfectly sharpened, clean knife right into their hand (@Autowired)!",
      interview: "Question: What is Dependency Injection? Answer: It means classes do not create their helpers. Spring instantiates and injects helper dependencies automatically, keeping components isolated and easy to test.",
      code: `@RestController
public class DinerController {
    private final DinerService service;

    @Autowired // Spring automatically injects the DinerService!
    public DinerController(DinerService ds) {
        this.service = ds;
    }
}`
    },
    'service': {
      title: '@Service',
      category: 'Kitchen Staff & Tools',
      why: "Sticks a 'Chef' label on a Java class, telling Spring: 'Register this class as the core executor of business algorithms and kitchen recipes.'",
      analogy: "<strong>The Master Chef</strong>. The chef does not talk to guests at the door. Instead, they stand inside the kitchen, reading order tickets and executing recipes to turn raw assets into cooked meals.",
      interview: "Question: What is @Service under the hood? Answer: It is a specialized form of @Component, used to declare business controllers self-documenting.",
      code: `@Service
public class BurgerService {
    public void executeSecretRecipe(Burger b) {
        // Business logic recipes happen here!
    }
}`
    },
    'repository': {
      title: '@Repository',
      category: 'Kitchen Staff & Tools',
      why: "Declares a class as the 'Pantry Clerk', responsible for executing SQL commands to retrieve or save items inside the database fridge.",
      analogy: "<strong>The Pantry Assistant</strong>. When the chef needs items (like flour or beef), they yell to the assistant. The assistant runs to the fridge (Database), grabs the assets, and hands them to the chef.",
      interview: "Question: What is the main advantage of @Repository? Answer: It automatically translates database driver failures into general Spring data exceptions.",
      code: `@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    // Speaks directly to the MySQL Fridge!
}`
    }
  };

  annoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      annoButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const key = btn.getAttribute('data-anno');
      renderAnnotationDetails(key);
      
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
    txtAnalogy.innerHTML = config.analogy;
    txtWhy.innerText = config.why;
    txtInterview.innerText = config.interview;
    txtCode.innerText = config.code;
  }

  // Load first annotation sticker by default
  renderAnnotationDetails('restcontroller');


  /* ==========================================
     4. MODULE 3: TICKET SECURITY (JWT)
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

  btnJwtLogin.addEventListener('click', () => {
    playSystemSound('snd-click');
    
    const user = iptJwtUser.value || 'sam_hungry';
    
    txtJwtDecodedHeader.innerHTML = JSON.stringify({ "alg": "HS256", "typ": "JWT" }, null, 2);
    txtJwtDecodedPayload.innerHTML = JSON.stringify({
      "sub": user,
      "role": "VIP_DINER",
      "wristband_color": "neon_blue",
      "exp": 1798530000
    }, null, 2);

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

  btnJwtTestUnauth.addEventListener('click', () => {
    if (btnJwtTestUnauth.disabled) return;
    triggerJwtRequestSimulation(false);
  });

  btnJwtTestAuth.addEventListener('click', () => {
    if (btnJwtTestAuth.disabled) return;
    triggerJwtRequestSimulation(true);
  });

  function triggerJwtRequestSimulation(isAuth) {
    btnJwtTestUnauth.disabled = true;
    btnJwtTestAuth.disabled = true;

    jwtNodeClient.className = 'jwt-node';
    jwtNodeServer.className = 'jwt-node';
    jwtSecurityPacket.style.opacity = '1';

    if (isAuth) {
      lblJwtFlowStatus.innerText = 'Flashing VIP Wristband...';
      jwtSecurityPacket.className = 'jwt-flow-packet anim-forward-ok';
      jwtNodeClient.classList.add('active-success');

      setTimeout(() => {
        lblJwtFlowStatus.innerText = 'Gate Stamp Verified: Welcome VIP!';
        jwtNodeServer.classList.add('active-success');
        playSystemSound('snd-success');
        
        simulationStates.jwtAuthAttempted = true;
        updateProgressTelemetry();
      }, 1200);

    } else {
      lblJwtFlowStatus.innerText = 'Trying to sneak through gate...';
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
     5. MODULE 4: ACADEMY & FRUIT BOWL CACHE
     ========================================== */
  const btnPerfTestDb = document.getElementById('btn-perf-test-db');
  const btnPerfTestCache = document.getElementById('btn-perf-test-cache');
  const barPerfDb = document.getElementById('bar-perf-db');
  const barPerfCache = document.getElementById('bar-perf-cache');
  const txtPerfDbLatency = document.getElementById('txt-perf-db-latency');
  const txtPerfCacheLatency = document.getElementById('txt-perf-cache-latency');
  const lblPerfAnalysis = document.getElementById('lbl-perf-analysis');

  btnPerfTestDb.addEventListener('click', () => {
    playSystemSound('snd-click');
    btnPerfTestDb.disabled = true;

    txtPerfDbLatency.innerText = 'Driving...';
    barPerfDb.style.width = '0%';
    
    setTimeout(() => {
      const randLatency = Math.floor(Math.random() * 120) + 240; // 240-360ms
      txtPerfDbLatency.innerText = `${randLatency} ms`;
      barPerfDb.style.width = '95%';
      
      lblPerfAnalysis.innerHTML = `⚠️ **DB Trip complete (Slow)**: Bypassed the cache. We had to open database connections, scan the physical hard drive tables, parse rows, and package values. **Diner status: Hungry & waiting.**`;
      btnPerfTestDb.disabled = false;
      playSystemSound('snd-fail');

      simulationStates.perfTested = true;
      updateProgressTelemetry();
    }, 1500);
  });

  btnPerfTestCache.addEventListener('click', () => {
    playSystemSound('snd-click');
    btnPerfTestCache.disabled = true;

    txtPerfCacheLatency.innerText = 'Grabbing...';
    barPerfCache.style.width = '0%';
    
    setTimeout(() => {
      const randLatency = Math.floor(Math.random() * 6) + 2; // 2-8ms
      txtPerfCacheLatency.innerText = `${randLatency} ms`;
      barPerfCache.style.width = '10%';
      
      lblPerfAnalysis.innerHTML = `⚡ **Fruit Bowl Grab complete (Instant!)**: Bypassed the database entirely! The data was cached in memory (RAM). Jackson grabbed it instantly in under 10ms. **Diner status: Happily served!**`;
      btnPerfTestCache.disabled = false;
      playSystemSound('snd-success');
    }, 800);
  });


  /* ==========================================
     6. CHECKPOINT QUIZ & FLASHCARDS
     ========================================== */
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
      q: "In our Restaurant analogy, who represents the '@RestController'?",
      options: [
        { text: "The Master Chef preparing recipes", correct: false },
        { text: "The Pantry Clerk fetching ingredients", correct: false },
        { text: "The Waiter who receives orders and serves JSON meals", correct: true },
        { text: "The Fridge storing raw vegetables", correct: false }
      ]
    },
    {
      q: "What is the primary role of the '@Autowired' annotation sticker?",
      options: [
        { text: "To unlock the REST security gate", correct: false },
        { text: "To automatically hand utensils/beans to the staff without using 'new'", correct: true },
        { text: "To delete items from the database fridge", correct: false },
        { text: "To set table numbers in the URL path", correct: false }
      ]
    },
    {
      q: "Which request type should strictly be mapped using @GetMapping?",
      options: [
        { text: "Adding a new order slip to the queue", correct: false },
        { text: "Viewing the menu items without changing any server data", correct: true },
        { text: "Removing cancelled orders from the kitchen list", correct: false },
        { text: "Replacing an entire meal profile", correct: false }
      ]
    },
    {
      q: "Stateless REST APIs secure their gates by issuing what?",
      options: [
        { text: "A list of IP directories in text logs", correct: false },
        { text: "A physical locker key in the database", correct: false },
        { text: "A stamped paper VIP wristband (JWT) containing token claims", correct: true },
        { text: "An automatic knife tool from Autowired", correct: false }
      ]
    },
    {
      q: "What is the 'Fruit Bowl on the Kitchen Table' in backend engineering?",
      options: [
        { text: "A physical server fridge (Database)", correct: false },
        { text: "High-speed in-memory Caching (like Redis)", correct: true },
        { text: "A constructor dependency scanner", correct: false },
        { text: "The front desk security guard", correct: false }
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
    
    let badge = 'Novice Helper';
    if (score >= 4) {
      badge = 'Diner Master Chef 👑';
    } else if (score >= 2) {
      badge = 'Kitchen Manager 🏅';
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

  loadQuestion(0);

  // Flashcards toggle
  const flashcards = document.querySelectorAll('.flashcard');
  flashcards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      playSystemSound('snd-click');
    });
  });

  // Light/Dark Theme Switcher
  const btnTheme = document.getElementById('btn-theme-switcher');
  btnTheme.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    playSystemSound('snd-click');
  });

});
