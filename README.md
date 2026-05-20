# 🍃 Spring Boot REST API Interactive Visual Guide

An elegant, modern, and highly interactive single-page web presentation designed to teach **REST APIs in Spring Boot** from scratch. Styled with a premium glassmorphic developer aesthetic, it features live interactive animations, hoverable code explorers, and an API request simulator for real-world scenarios.

👉 **Live Demo / View Locally**: Just double-click the `index.html` file to open it in your browser!

---

## 🚀 Key Features

* **Interactive Slide Deck**: Clean step-by-step layout explaining core Spring Boot topics with dynamic progress tracking.
* **Live API Request Simulator**: Select real-world scenarios (**Instagram GET**, **Swiggy POST**, or **Amazon GET with `@PathVariable`**) and watch:
  1. Animated data packets travel from the mobile client to the Spring Boot server.
  2. The server rack blinking while processing the request.
  3. The matching Spring Boot annotations glowing green.
  4. The lightweight JSON payload rendering in real-time inside the console.
  5. The mobile screen rendering a styled interactive mockup of the output!
* **Aesthetic Theme Switcher**: Easily toggle between the default dark-mode developer theme and an elegant light theme.
* **Hover Annotation Explorer**: Hover or tap on highlights in code snippets to read beginner-friendly real-world analogies (e.g. `@RestController` compared to a restaurant waiter).
* **Interactive Interview Prep**: Flips cards and accordion panels covering top Spring Boot REST API interview questions with precise answers.
* **HTML/CSS Flow Diagrams**: Lightweight animated visuals mapping out Client-Server request-response structures without bulky external image assets.

---

## 📂 Project Structure

```bash
spring-boot-rest-api-tutorial/
├── index.html     # Semantic structure, visual diagrams & interactive UI slide containers
├── style.css      # Cohesive CSS variables, glassmorphic card classes & keyframe animations
├── script.js     # Slide deck navigation, tooltip displays, and simulator animation timelines
└── README.md      # Documentation of features, architecture & setup
```

---

## 💡 Core Concepts Taught

1. **What is REST API?**: Explaining clients, servers, and standard HTTP requests using the famous *Restaurant & Waiter* metaphor.
2. **Why APIs are Needed**: Showing centralized business logic and cross-platform capabilities with Swiggy, Instagram, and Amazon examples.
3. **`@RestController`**: Understanding how Spring Boot registers classes to directly serialize output responses.
4. **GET vs POST**: Visualizing when to read data vs when to submit data into databases.
5. **`@PathVariable`**: Dissecting how dynamic values inside URLs connect straight to your Java code parameters.
6. **JSON Serialization**: Seeing how the **Jackson** library automatically maps Java classes into lightweight JSON files.

---

## 🛠️ How to Run Locally

### Option A: Direct Local View (Zero Setup)
Simply open the folder on your local machine and double-click:
```bash
index.html
```
It will open instantly in your default web browser (Chrome, Edge, Firefox, etc.) without requiring any web server!

### Option B: Local Web Server (Node.js/npm)
If you prefer running it hosted on a local port:
1. Open your terminal in the project directory.
2. Run the following command:
   ```bash
   npx serve -l 3000
   ```
3. Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 📝 Technologies Used

* **HTML5**: Semantic tags, canvas simulators, and layout trees.
* **CSS3**: CSS grid, flexbox, glassmorphic filters, variables, and complex animation keyframes.
* **Vanilla JavaScript**: Interactive event listeners, visual timers, and console typing effect engines.
* **Google Fonts**: *Plus Jakarta Sans* (Body text) and *JetBrains Mono* (Code elements).
* **FontAwesome Icons**: Premium tech vector icons.

---

