/** Portfolio facts transcribed from the original project pages and CV. */
export const profile = {
  name: "Rivindu Kowlinda",
  email: "rivindulkowlinda@gmail.com",
  github: "https://github.com/Rivindu-Kowlinda",
  linkedin: "https://www.linkedin.com/in/rivindu-kowlinda-52929527b",
  instagram: "https://www.instagram.com/rivindu_kowlinda",
  facebook: "https://www.facebook.com/share/1CD857PFUY/",
};
export const projects = [
  {
    id: "axion",
    number: "01",
    title: "Axion",
    kind: "Mobile development",
    year: "2025",
    color: "#b4a2e7",
    short: "A little clarity. A lot of care.",
    description:
      "Making medical records easier to understand. A cross-platform app that brings health reports and doctor connections into one considered experience.",
    role: "Frontend developer · SDGP group project",
    stack: ["Flutter", "Dart", "GraphQL"],
    images: [
      "images/mobile2.jpg",
      "images/mobile3.jpg",
      "images/mobile1.jpg",
      "images/mobile4.jpg",
      "images/mobile5.jpg",
    ],
    challenge:
      "Health reports contain complex information. The interface needed to make different report types approachable while supporting personalised data and multiple languages.",
    solution:
      "I developed the Flutter frontend for the group project, with reusable report cards, a structured login flow, and a modular interface for CBC and lipid reports. The app integrates APIs and GraphQL, with ARB files for localisation.",
    architecture: [
      "Flutter interface",
      "API / GraphQL services",
      "Report data models",
    ],
    details: [
      "Reusable UI components and report cards",
      "JSON serialisation with json_serializable",
      "Session handling and personalised report views",
      "ARB-based localisation for multiple languages",
    ],
  },
  {
    id: "ticket",
    number: "02",
    title: "Ticket Manager",
    kind: "Full-stack engineering",
    year: "2024",
    color: "#a7c9de",
    short: "Connected from interface to API.",
    description:
      "A ticket management application connecting an Angular interface to a Java and Spring Boot backend, with object-oriented design and multithreading.",
    role: "Full-stack project",
    stack: ["Angular", "Spring Boot", "Java", "TypeScript"],
    images: [
      "images/ticket-preview.jpg",
      "images/OOP_Frontend.jpg",
      "images/OOP_Backend.jpg",
    ],
    video: "videos/video2.mp4",
    challenge:
      "Coordinate ticket operations and live interface state while concurrent work runs in the Java backend.",
    solution:
      "The project combines a component-based Angular frontend with Java and Spring Boot services. Object-oriented design and multithreading structure the backend. The interface exposes system controls, ticket operations, customer and vendor counts, and live logs; REST endpoints connect the two layers.",
    architecture: [
      "Angular components",
      "Spring MVC REST API",
      "Java ticket logic",
    ],
    details: [
      "Angular interface with ticket operations and live logs",
      "Java backend using multithreading and OOP",
      "Modular Spring Boot services",
      "API integration verified with Postman",
    ],
  },
  {
    id: "snake",
    number: "03",
    title: "Snake Battle",
    kind: "Algorithms & desktop",
    year: "2025",
    color: "#a5d1bc",
    short: "Two snakes. One smart little rivalry.",
    description:
      "An autonomous head-to-head snake game. Breadth-first search and predictive collision avoidance turn a familiar game into an exercise in decision-making.",
    role: "Java desktop game",
    stack: ["Java", "Swing", "BFS"],
    images: ["images/snake-preview.jpg", "images/snakeGameCode.png"],
    video: "videos/video3.mp4",
    challenge:
      "Two autonomous agents need to reach food while avoiding walls, their own bodies, and each other in a changing board state.",
    solution:
      "Breadth-first search finds routes to the target. Predictive safety logic checks opposing heads and obstacles, while a Swing timer updates the game loop at 150 ms intervals.",
    architecture: ["Swing game board", "GameController", "BFS PathFinder"],
    details: [
      "30 × 30 game board with live scores",
      "Predictive collision avoidance",
      "Separate Snake, Ball, controller and pathfinder classes",
      "Collision-safe spawn and target placement",
    ],
  },
  {
    id: "tree",
    number: "04",
    title: "3D Tree Portfolio",
    kind: "Creative development",
    year: "2025",
    color: "#d7bc96",
    short: "An interface that grows branches.",
    description:
      "A procedurally generated tree turns portfolio navigation into a spatial experience, with interactive fruit nodes and smoothly focused content.",
    role: "Interactive Three.js project",
    stack: ["Three.js", "JavaScript", "WebGL"],
    images: ["images/tree-preview.jpg", "images/3dPortfolioCode.png"],
    video: "videos/video1.mp4",
    challenge:
      "Connect an organic, procedural 3D scene to usable portfolio navigation without losing the visitor’s sense of place.",
    solution:
      "Recursive branches follow Catmull–Rom curves, with leaves and coloured content nodes. Raycasting identifies selected fruit, then interpolated camera motion brings the related content into focus.",
    architecture: [
      "Procedural geometry",
      "Raycast interaction",
      "Content / camera state",
    ],
    details: [
      "Recursive branch generation",
      "OrbitControls for spatial navigation",
      "Raycast-based content selection",
      "Interpolated camera and interface transitions",
    ],
  },
  {
    id: "plane",
    number: "05",
    title: "Plane Seat Manager",
    kind: "Core programming",
    year: "2024",
    color: "#abc2db",
    short: "A solid foundation, seat by seat.",
    description:
      "A Java console application for airplane reservations, with seat availability, dynamic pricing, cancellation, and file-based ticket records.",
    role: "Java console project",
    stack: ["Java", "OOP", "File I/O"],
    images: ["images/SD2_CLI.jpg", "images/SD2_Code.jpg"],
    challenge:
      "Model a seating plan and preserve accurate ticket data while handling invalid input and changing reservations.",
    solution:
      "PlaneManagement, Ticket, and Person classes separate responsibilities. Arrays track seating, pricing reflects seat location, and file operations save or delete ticket records.",
    architecture: [
      "Console interface",
      "Seat / ticket domain",
      "Text-file persistence",
    ],
    details: [
      "Seat booking, cancellation and search",
      "Location-based ticket pricing",
      "Persistent ticket records",
      "Exception handling for invalid input",
    ],
  },
  {
    id: "progress",
    number: "06",
    title: "Student Progress",
    kind: "Data & visualisation",
    year: "2023",
    color: "#d7b6bd",
    short: "From credits to a clearer picture.",
    description:
      "A Python application that validates academic credits, calculates progression outcomes, and visualises the results in a histogram.",
    role: "Python console & graphics project",
    stack: ["Python", "Data validation", "Graphics"],
    images: [
      "images/SD1_Histogram.jpg",
      "images/SD1_CLI.jpg",
      "images/SD1_Code.jpg",
    ],
    challenge:
      "Turn credit rules into reliable outcomes for both individual students and staff processing multiple entries.",
    solution:
      "Dedicated functions validate allowed credit values and a total of 120, calculate progression status, and draw a scaled histogram. Staff can aggregate outcomes and save records to a text file.",
    architecture: [
      "Credit input validation",
      "Progression rules",
      "Histogram / text records",
    ],
    details: [
      "Separate student and staff modes",
      "Validated credit totals and values",
      "Scaled outcome histogram",
      "File-based results logging",
    ],
  },
];
export const skillGroups = [
  {
    id: "interfaces",
    label: "Interfaces",
    symbol: "◫",
    title: "Where people meet the system.",
    text: "Responsive web interfaces and cross-platform mobile experiences, with an eye for clear structure and thoughtful interaction.",
    tech: [
      "Angular",
      "Flutter",
      "TypeScript",
      "JavaScript",
      "Dart",
      "HTML & CSS",
    ],
    related: ["axion", "ticket", "tree"],
  },
  {
    id: "logic",
    label: "Logic & services",
    symbol: "⌘",
    title: "The thinking beneath the surface.",
    text: "From object-oriented models to API services and pathfinding: working through the logic that makes an application useful.",
    tech: [
      "Java",
      "Spring Boot",
      "Python",
      "SQL",
      "Kotlin",
      "REST APIs",
      "GraphQL",
    ],
    related: ["ticket", "snake", "plane", "progress"],
  },
  {
    id: "creative",
    label: "Creative systems",
    symbol: "◇",
    title: "A little curiosity, in every dimension.",
    text: "Exploring how procedural geometry, spatial interaction, and visual feedback can make software more expressive.",
    tech: ["Three.js", "WebGL", "JavaScript", "Figma"],
    related: ["tree"],
  },
  {
    id: "workflow",
    label: "Tools & workflow",
    symbol: "↗",
    title: "Good tools. Intentional process.",
    text: "Designing, building, and checking ideas with tools that keep the development process clear and collaborative.",
    tech: ["GitHub", "VS Code", "IntelliJ IDEA", "Figma", "Postman"],
    related: ["axion", "ticket", "snake", "tree", "plane", "progress"],
  },
];
