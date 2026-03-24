(function () {
  "use strict";

  function getCurrentPage() {
    const page = decodeURIComponent(
      window.location.pathname.split("/").pop() || "index.html",
    );
    return page.toLowerCase();
  }

  function initRipples() {
    const canvas = document.getElementById("water-ripples");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    const ripples = [];

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function animateRipples() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < ripples.length; i += 1) {
        const ripple = ripples[i];
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(156, 39, 176, ${ripple.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ripple.radius += 1.5;
        ripple.alpha -= 0.01;
        if (ripple.alpha <= 0) {
          ripples.splice(i, 1);
          i -= 1;
        }
      }
      requestAnimationFrame(animateRipples);
    }

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", (event) => {
      if (Math.random() > 0.4) {
        ripples.push({
          x: event.clientX,
          y: event.clientY,
          radius: 0,
          alpha: 0.5,
        });
      }
    });

    resizeCanvas();
    animateRipples();
  }

  function initHeaderScroll() {
    const header = document.getElementById("main-header");
    if (!header) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    });
  }

  function initActivePageHighlight() {
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll("nav a, .site-map a");
    navLinks.forEach((link) => {
      if (
        link.getAttribute("href") === currentPath &&
        !link.classList.contains("no-active")
      ) {
        link.classList.add("active-link");
      }
    });
  }

  function initEventPage(config) {
    const tabs = document.querySelectorAll(".day-tab");
    const grid = document.getElementById("events-grid");
    if (!tabs.length || !grid) return;

    const modal = document.getElementById("event-modal");

    function closeModal() {
      if (!modal) return;
      modal.classList.remove("show");
      document.body.style.overflow = "auto";
    }

    function openModal(eventData) {
      if (!modal) return;

      const title = document.getElementById("modal-title");
      const venue = document.getElementById("modal-venue");
      const datetime = document.getElementById("modal-datetime");
      const type = document.getElementById("modal-type");
      const rules = document.getElementById("modal-rules");
      if (!title || !venue || !datetime || !type || !rules) return;

      title.innerText = eventData.name;
      venue.innerText = eventData.venue;
      datetime.innerHTML = `Day ${eventData.day} | ${eventData.day === 1 ? "March 26" : "March 27"}, 2026 <br> ${eventData.time}`;
      type.innerText = eventData.type;
      rules.innerHTML = `<ul>${(eventData.rules || []).map((rule) => `<li>${rule}</li>`).join("")}</ul>`;

      modal.classList.add("show");
      document.body.style.overflow = "hidden";
    }

    function filterEvents(day) {
      tabs.forEach((tab, index) => {
        if (index + 1 === day) tab.classList.add("active");
        else tab.classList.remove("active");
      });

      const filtered = config.events.filter((ev) => {
        if (ev.day !== day) return false;
        if (!config.department) return true;
        return ev.dept === config.department;
      });

      grid.innerHTML = "";

      if (!filtered.length) {
        grid.innerHTML = `<div class="empty-state">No events scheduled for Day ${day} yet.</div>`;
        return;
      }

      filtered.forEach((ev, index) => {
        const card = document.createElement("div");
        card.className = "event-card";

        if (config.withModal) {
          card.onclick = () => openModal(ev);
          card.innerHTML = `
                        <img src="${ev.img}" class="event-img" alt="Event">
                        <div class="event-overlay"></div>
                        <div class="event-info">
                            <h2 class="event-title">${ev.name}</h2>
                            <div class="event-time">${ev.time}</div>
                        </div>`;
        } else {
          card.innerHTML = `
                        <img src="${ev.img}" class="event-img" alt="${ev.name}">
                        <div class="event-overlay"></div>
                        <div class="event-info">
                            <h2 class="event-title">${ev.name}</h2>
                            <div class="event-time">${ev.time}</div>
                            <div class="event-venue">${ev.venue}</div>
                        </div>`;
        }

        if (window.gsap) {
          window.gsap.fromTo(
            card,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, delay: index * 0.1 },
          );
        }

        grid.appendChild(card);
      });
    }

    window.filterEvents = filterEvents;
    window.closeModal = closeModal;

    if (modal) {
      window.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
      });
    }

    filterEvents(1);
  }

  function initVideoLightbox() {
    const thumbnail = document.getElementById("naksh-video-thumbnail");
    const videoModal = document.getElementById("videoModal");
    const youtubeIframe = document.getElementById("youtube-iframe");

    if (!thumbnail || !videoModal || !youtubeIframe) return;

    // YouTube video ID
    const videoId = "bfnhcA6Iang";

    // Open modal and load video when thumbnail is clicked
    thumbnail.addEventListener("click", () => {
      const modal = new window.bootstrap.Modal(videoModal);
      youtubeIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      modal.show();
    });

    // Stop video when modal is closed
    videoModal.addEventListener("hidden.bs.modal", () => {
      youtubeIframe.src = "";
    });

    // Add hover effect to play button
    const playOverlay = thumbnail.querySelector(".play-button-overlay");
    if (playOverlay) {
      thumbnail.addEventListener("mouseenter", () => {
        playOverlay.style.transform = "translate(-50%, -50%) scale(1.1)";
        playOverlay.style.background = "rgba(0,0,0,0.85)";
      });
      thumbnail.addEventListener("mouseleave", () => {
        playOverlay.style.transform = "translate(-50%, -50%) scale(1)";
        playOverlay.style.background = "rgba(0,0,0,0.7)";
      });
    }
  }

  function initIndexPage() {
    const cards = document.querySelectorAll(".carousel-card");
    if (cards.length) {
      let activeCardIndex = 4;
      window.updateCarousel = function updateCarousel(newActiveIndex) {
        activeCardIndex = newActiveIndex;
        cards.forEach((card, index) => {
          const diff = index - activeCardIndex;
          const zIndex = cards.length - Math.abs(diff);
          const scale = 1 - Math.abs(diff) * 0.12;
          const translateX = diff * 90;
          card.style.transform = `translateX(${translateX}px) scale(${scale})`;
          card.style.zIndex = zIndex;
          card.style.opacity = Math.abs(diff) > 4 ? 0 : 1;
          card.style.pointerEvents = Math.abs(diff) > 4 ? "none" : "auto";
        });
      };
      window.updateCarousel(activeCardIndex);
    }

    // Initialize video lightbox
    initVideoLightbox();

    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question");
      if (!question) return;
      question.addEventListener("click", () => {
        item.classList.toggle("active");
        faqItems.forEach((other) => {
          if (other !== item) other.classList.remove("active");
        });
      });
    });

    const slides = document.getElementsByClassName("mySlides");
    const dots = document.getElementsByClassName("dot");
    if (slides.length && dots.length) {
      let slideIndex = 0;
      (function showSlides() {
        for (let i = 0; i < slides.length; i += 1)
          slides[i].style.display = "none";
        slideIndex += 1;
        if (slideIndex > slides.length) slideIndex = 1;
        for (let i = 0; i < dots.length; i += 1)
          dots[i].className = dots[i].className.replace(" active", "");
        slides[slideIndex - 1].style.display = "block";
        dots[slideIndex - 1].className += " active";
        setTimeout(showSlides, 2000);
      })();
    }
  }

  function initContactPage() {
    if (!window.gsap || !window.gsap.utils) return;
    window.gsap.utils.toArray(".team-dept").forEach((dept) => {
      const cards = dept.querySelectorAll(".team-card");
      if (!cards.length) return;
      window.gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: { trigger: dept, start: "top 85%" },
        },
      );
    });
  }

  function initCraftBazaarPage() {
    const slides = document.querySelectorAll(".cb-slide");
    if (slides.length) {
      let currentSlide = 0;
      setInterval(() => {
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add("active");
      }, 3000);
    }

    const craftsData = [
      { name: "Terracotta", img: "images/terracotta.jpeg" },
      { name: "Pattachitra", img: "images/pattachitra.webp" },
      { name: "Applique", img: "images/applique.webp" },
      { name: "Jamdani", img: "images/jamdani.webp" },
      { name: "Silver Filigree", img: "images/silver.webp" },
      { name: "Single Ikkat", img: "images/single ikkat.webp" },
      { name: "Double Ikkat", img: "images/double ikkat.webp" },
      { name: "Cane & Bamboo", img: "images/cane & bamboo.webp" },
      { name: "Wood Carving", img: "images/wood carving.webp" },
      { name: "Khandua Silk Sarees", img: "images/khandua.webp" },
      { name: "Jute", img: "images/jute.webp" },
      { name: "Chanderi Handloom", img: "images/chanderi.webp" },
      { name: "Bawanbuti Sarees", img: "images/bawanbuti.webp" },
      { name: "Bhujodi Weaving", img: "images/bhujodi.webp" },
      { name: "Lac Bangle", img: "images/lac bangle.webp" },
      { name: "Meenakari Jewellary", img: "images/meenakari.webp" },
      { name: "Cow Dung Toys", img: "images/cow dung toys.webp" },
      { name: "Paper Mache", img: "images/paper mache.webp" },
      { name: "Wooden Turning Toys", img: "images/wooden turning toys.webp" },
      { name: "Handloom Fabrics", img: "images/handloom fabrics.webp" },
    ];

    const craftGrid = document.getElementById("crafts-grid");
    if (craftGrid) {
      craftsData.forEach((craft) => {
        const card = document.createElement("div");
        card.className = "craft-card";
        card.innerHTML = `<img src="${craft.img}" alt="${craft.name}" class="craft-img"><h4 class="craft-name">${craft.name}</h4>`;
        craftGrid.appendChild(card);
      });
    }

    if (window.gsap) {
      window.gsap.fromTo(
        ".craft-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: { trigger: ".crafts-grid", start: "top 85%" },
        },
      );
    }
  }

  function initEventsPage() {
    initActivePageHighlight();
    if (window.gsap) {
      window.gsap.fromTo(
        ".dept-card",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: { trigger: "#departments-section", start: "top 80%" },
        },
      );
    }
  }

  const culturalEvents = [
    {
      name: "Solo Singing",
      day: 1,
      time: "3:30 PM",
      venue: "FD 222",
      type: "Solo",
      img: "images/SoloS.webp",
      rules: [
        "Theme: Gazal.",
        "Time Limit: 2 min stage setup + 3 min performance.",
        "Participants can perform any number of songs (Hindi, English, or both).",
        "Medley of two or more songs is permitted.",
        "One instrumental accompaniment or backing track allowed (judging solely on vocal performance).",
      ],
    },
    {
      name: "Duet Singing",
      day: 1,
      time: "4:30 PM",
      venue: "FD 222",
      type: "Duet",
      img: "images/duosing.webp",
      rules: [
        "Theme: Two States.",
        "Time Limit: 2 min stage setup + 3 min performance.",
        "Participants can perform any number of songs (Hindi, English, or both).",
        "Medley of two or more songs is permitted.",
        "One instrumental accompaniment or backing track allowed.",
      ],
    },
    {
      name: "Solo Dance",
      day: 2,
      time: "3:30 PM",
      venue: "Activity Hall",
      type: "Solo",
      img: "images/soloD.webp",
      rules: [
        "Theme: Era Swap (Lyrical Contemporary).",
        "Time Limit: 1 min stage setup + 3 min performance.",
        "Participants should get their songs on a pen drive. Live music is not allowed.",
        "Accessories, costumes, and props must be arranged by the participants.",
      ],
    },
    {
      name: "Duet Dance (Dance Drama)",
      day: 2,
      time: "4:30 PM",
      venue: "Activity Hall",
      type: "Duet",
      img: "images/duadance.webp",
      rules: [
        "Theme: Literary Classics.",
        "Performance time: 3 minutes.",
        "The act should contain both dance as well as drama through dialogue or expression of a storyline.",
        "Music to be submitted at the time of registration in MP3 format.",
      ],
    },
    {
      name: "Group Dance",
      day: 2,
      time: "5:30 PM",
      venue: "Main Stage",
      type: "Group",
      img: "images/groupdance.webp",
      rules: [
        "Theme: Tribal Celebration (Street Style).",
        "Team Size: 6-8 participants. Any combination of gender is allowed.",
        "Time Limit: 2 min stage setup + 5 min performance.",
        "Participants should get their songs on a pen drive. Live music is not allowed.",
      ],
    },
    {
      name: "Fashion Show",
      day: 2,
      time: "7:30 PM",
      venue: "Main Stage",
      type: "Group",
      img: "images/FS.webp",
      rules: [
        "Theme: Circus.",
        "Time Limit: 90 seconds for round 1 and 90 seconds for walk.",
        "Judging Criteria: Relevance to the theme, Creativity and Talent, Confidence, and Overall Impact.",
      ],
    },
  ];

  const environmentEvents = [
    {
      name: "Eco Styling and Makeup",
      day: 1,
      time: "9:30 AM",
      venue: "FD 222",
      type: "Group",
      dept: "Environment",
      img: "images/EcoS.webp",
      rules: [
        "Participation: Group of 3 (including a model).",
        "Theme given on spot. Time limit: 30 mins.",
        "The look should be done using eco makeup. Natural fabrics should be used for styling.",
        "Maximum 2 sarees or 2 dupattas allowed. Drape it creatively or make accessories.",
        "No usual makeup is allowed. If found, participant will be disqualified.",
      ],
    },
    {
      name: "Face Painting",
      day: 2,
      time: "9:30 AM",
      venue: "FD 121",
      type: "Duet",
      dept: "Environment",
      img: "images/FaceP.webp",
      rules: [
        "Participation: Individual (must bring your own model).",
        "Theme given on the spot. Time limit: 30 minutes.",
        "Participants are required to reach with their model at least 10 mins prior.",
        "Participants must bring their own colours.",
        "Any kind of plagiarism or use of mobile phones for reference will lead to disqualification.",
      ],
    },
  ];

  const sportsEvents = [
    {
      name: "Throw ball (Girls)",
      day: 1,
      time: "7:00 AM",
      venue: "Volleyball ground",
      type: "Group",
      img: "images/throw.webp",
      rules: [
        "Each match will be of 15 points and best of 3 sets.",
        "One time-out (2 minutes) per team in a match is allowed.",
        "Service can be given by any side behind the back line (corners only).",
        "Double touches are not allowed for receiving the service ball.",
        "A player can hold the ball for a maximum of 3 seconds.",
      ],
    },
    {
      name: "Basketball (Boys)",
      day: 1,
      time: "7:00 AM",
      venue: "Basketball Court",
      type: "Group",
      img: "images/BB.webp",
      rules: [
        "There will be 4 quarters in the match, each lasting 5 mins, for a total of 20 mins.",
        "In the order of 5-1-5-2-5-1-5 minutes, there is a 4-min break. Knockout-based competitions will take place.",
        "Throughout a game, each team is permitted to take two 1-min timeouts.",
        "Should there be a tie, each team will play five more minutes of extra time.",
        "All other rules will be as per FIBA (International Basketball Federation).",
        "Referee's judgement is conclusive.",
      ],
    },
    {
      name: "Chess",
      day: 1,
      time: "11:00 AM",
      venue: "FD 122",
      type: "Solo",
      img: "images/Chess.webp",
      rules: [
        "The player scoring maximum points will win the round.",
        "Thumbing or backstroke is not allowed.",
        "Red coins will be worth 3 points, and black or white coins will be worth 1 point.",
        "If a striker or carrom man leaves the board, it will result in a foul.",
        "If the player touches the opponent's coin before his or her own, a penalty of one coin will be allotted.",
      ],
    },
    {
      name: "E-Sports (FIFA)",
      day: 1,
      time: "1:30 PM",
      venue: "BFT 004, BFT 005",
      type: "Solo",
      img: "images/FIFA.webp",
      rules: [
        "Match Type: 1 vs 1.",
        "Half Length: 6 minutes per half.",
        "Difficulty Level: Legendary.",
        "Any drawn match will go directly to penalties.",
        "Controllers & System will be provided by the organisers.",
      ],
    },
    {
      name: "Volley ball (Boys)",
      day: 2,
      time: "7:00 AM",
      venue: "Volley Ball Ground",
      type: "Group",
      img: "images/volley.webp",
      rules: [
        "There will be 6 players on each squad.",
        "Each match will consist of 3 sets, each consisting of 15 rally points.",
        "Each team is permitted two 1-min timeouts during a game.",
        "LIBERO is going to be allowed.",
        "In the event of a Deuce in a regular set, a maximum 2-point differential up to 17 or 27 points will be played; the team that scores 17 or 27 points first will be deemed the winner.",
        "Referee's judgement is conclusive.",
      ],
    },
    {
      name: "Basket ball (Girls)",
      day: 2,
      time: "7:00 AM",
      venue: "Basketball Court",
      type: "Group",
      img: "images/BB.webp",
      rules: [
        "There will be 4 quarters in the match, each lasting 5 mins, for a total of 20 mins.",
        "In the order of 5-1-5-2-5-1-5 minutes, there is a 4-min break. Knockout-based competitions will take place.",
        "Throughout a game, each team is permitted to take two 1-min timeouts.",
        "Should there be a tie, each team will play five more minutes of extra time.",
        "All other rules will be as per FIBA (International Basketball Federation).",
        "Referee's judgement is conclusive.",
      ],
    },
    {
      name: "Table tennis (Mixed)",
      day: 2,
      time: "1:30 PM",
      venue: "TD Lobby",
      type: "Duet",
      img: "images/TT.webp",
      rules: [
        "Matches for mixed doubles are best of 3 sets of 11 points each.",
        "Participants are to carry their own bats. Ball will NOT be provided.",
        "The ball must rest on an open hand palm. Then it must be tossed up at least 6 inches.",
        "In case of Deuce, in the deciding set a difference of 2 points should be scored compulsorily to win the match.",
      ],
    },
    {
      name: "Carrom",
      day: 2,
      time: "1:30 PM",
      venue: "TD Surface Lab",
      type: "Solo",
      img: "images/Carrom.webp",
      rules: [
        "Maximum of 20 mins per game (each player 10 mins).",
        "Duration between each move will be 30 seconds.",
        "Maximum of 3 illegal moves will be allowed.",
        "Touch and move rules will be followed.",
      ],
    },
  ];

  const photographyEvents = [
    {
      name: "Meme the Fest",
      day: 1,
      time: "9:30 AM",
      venue: "FD 125",
      type: "Solo",
      dept: "Photography",
      img: "images/Meme.webp",
      rules: [
        "Create original memes based on fest events or happenings around the campus.",
        "Memes must be submitted before the designated deadline.",
        "No offensive, targeted, or vulgar content will be tolerated.",
        "Judging will be based on humor, creativity, and relevance to the fest.",
      ],
    },
    {
      name: "Scavenger Hunt",
      day: 1,
      time: "11:00 AM",
      venue: "Theme Reveal (Reception)",
      type: "Group",
      dept: "Photography",
      img: "images/treasure.webp",
      rules: [
        "Participation requires a team of 5 members.",
        "Teams must solve clues to locate designated checkpoints around the campus.",
        "Use of electronic devices (phones, tablets, smartwatches) is strictly prohibited.",
        "The winner will be decided by completion accuracy and the least time taken.",
      ],
    },
    {
      name: "10 Second Click",
      day: 2,
      time: "9:30 AM",
      venue: "FD 125",
      type: "Solo",
      dept: "Photography",
      img: "images/photo.webp",
      rules: [
        "Participants will be given subjects or themes on the spot.",
        "You will have exactly 10 seconds to capture the perfect shot of the given subject.",
        "Use of personal cameras or smartphones is required.",
        "No post-processing, filters, or editing allowed. Raw photos will be judged.",
      ],
    },
  ];

  const literaryEvents = [
    {
      name: "Blind date with a book",
      day: 1,
      time: "9:30 AM",
      venue: "FD 223",
      type: "Solo",
      dept: "Literary",
      img: "images/blind.webp",
      rules: [
        "One random book will be assigned to each participant on the spot. A short summary will be provided with each book.",
        "Participants get 30 mins to skim through the book and another 30 mins to write an original ending.",
        "Maximum word count is 200 words.",
        "Participants are not allowed to use any electronics.",
        "Evaluation will be based on creativity, originality, writing style, and expression.",
      ],
    },
    {
      name: "Pictionary",
      day: 1,
      time: "1:30 PM",
      venue: "FD 121",
      type: "Group",
      dept: "Literary",
      img: "images/Pictionary.webp",
      rules: [
        "Each team must consist of exactly four (4) members. Time limit: 60 seconds per round.",
        "One team member will draw while the remaining guess. The drawer will rotate among team members in different rounds.",
        "Words or phrases will be provided via chits.",
        "The drawer may only draw-no speaking, mouthing words, or using gestures.",
        "Letters, numbers, symbols, or written words are strictly prohibited.",
      ],
    },
    {
      name: "Ad Mad",
      day: 2,
      time: "10:30 AM",
      venue: "FD 222",
      type: "Duet",
      dept: "Literary",
      img: "images/admad.webp",
      rules: [
        "Each team must consist of exactly two (2) members.",
        "The advertisement topic will be given on the spot. Teams get 10 minutes of preparation time.",
        "Use of electronics is prohibited. Safe and minimal props can be used.",
        "The performance may include acting, dialogue, slogans, or jingles in Hindi and English only.",
        "Teams will be evaluated based on creativity, originality, expression, presentation, and relevance to the topic.",
      ],
    },
  ];

  const essEvents = [
    {
      name: "What's in the box",
      day: 1,
      time: "10:30 AM",
      venue: "FD 219",
      type: "Solo",
      dept: "ESS",
      img: "images/WIB.webp",
      rules: [
        "Individual participation. 15-20 seconds per item.",
        "Guess mystery objects using touch, smell, or sound (blindfolded).",
        "No discussion allowed within the team.",
        "Judging based on observation skills, imagination, and accuracy.",
      ],
    },
    {
      name: "Fireless Cooking",
      day: 1,
      time: "11:00 AM",
      venue: "TD 203",
      type: "Duet",
      dept: "ESS",
      img: "images/Firecook.webp",
      rules: [
        "Team of 2 members. Time limit: 1 hour.",
        "No fire, gas, electricity, or heating appliances allowed.",
        "Only ready-to-eat, raw, soaked, or pre-processed ingredients permitted.",
        "Dish must be decided in advance and prepared on the spot.",
      ],
    },
    {
      name: "Nukkad Natak",
      day: 2,
      time: "10:30 AM",
      venue: "AD TD Passage",
      type: "Group",
      dept: "ESS",
      img: "images/nukkad-card.webp",
      rules: [
        "Group performance focusing on a social or ethical theme.",
        "Time limits must be strictly adhered to.",
        "Use of offensive language or inappropriate gestures is strictly prohibited.",
        "Minimal props allowed; emphasis should be on acting, voice, and message.",
      ],
    },
    {
      name: "Caricature Competition",
      day: 2,
      time: "1:30 PM",
      venue: "FD 219",
      type: "Solo",
      dept: "ESS",
      img: "images/Caricature.webp",
      rules: [
        "Individual participation. Theme given on the spot. Time limit: 1 hour.",
        "Must be created on the spot using only the sheets provided by organizers.",
        "Bring your own drawing materials. No tracing or pre-made sketches.",
        "No reference images, mobile phones, or photographs allowed.",
      ],
    },
  ];

  const showsEvents = [
    {
      name: "Mr. & Ms. Spectrum",
      day: 1,
      time: "6:30 PM",
      venue: "Main Stage",
      img: "Innauguration.webp",
    },
    {
      name: "Star Night / DJ Night",
      day: 1,
      time: "7:00 PM",
      venue: "Main Stage",
      img: "shows.jpeg",
    },
    {
      name: "Fashion Show",
      day: 2,
      time: "7:30 PM",
      venue: "Main Stage",
      img: "images/FS.webp",
    },
    {
      name: "Nift Band Performance",
      day: 2,
      time: "9:00 PM",
      venue: "Main Stage",
      img: "shows.jpeg",
    },
  ];

  // Increments a localStorage visit counter once per browser session and
  // populates the #visitor-counter element in the footer.
  function initVisitorCounter() {
    const el = document.getElementById("visitor-counter");
    if (!el) return;

    const STORAGE_KEY = "spectrum_visit_count";
    const SESSION_KEY = "spectrum_session_counted";

    let count = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);

    // Only increment once per session so refreshing does not keep inflating the count.
    if (!sessionStorage.getItem(SESSION_KEY)) {
      count += 1;
      localStorage.setItem(STORAGE_KEY, String(count));
      sessionStorage.setItem(SESSION_KEY, "1");
    }

    el.innerHTML =
      '<span class="vc-icon">&#128065;</span>' +
      '<span class="vc-count">' +
      count.toLocaleString() +
      "</span>" +
      '<span class="vc-label">visitors</span>';
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.filterEvents = function () {};
    window.closeModal = function () {};
    window.updateCarousel = function () {};

    initRipples();
    initHeaderScroll();
    initVisitorCounter();

    const page = getCurrentPage();

    if (page === "index.html") initIndexPage();
    else if (page === "contact.html") initContactPage();
    else if (page === "craft bazaar.html") initCraftBazaarPage();
    else if (page === "events.html") initEventsPage();
    else if (page === "cultural.html")
      initEventPage({ events: culturalEvents, withModal: true });
    else if (page === "environment.html")
      initEventPage({
        events: environmentEvents,
        department: "Environment",
        withModal: true,
      });
    else if (page === "sports.html")
      initEventPage({ events: sportsEvents, withModal: true });
    else if (page === "photography.html")
      initEventPage({
        events: photographyEvents,
        department: "Photography",
        withModal: true,
      });
    else if (page === "literary.html")
      initEventPage({
        events: literaryEvents,
        department: "Literary",
        withModal: true,
      });
    else if (page === "ess.html")
      initEventPage({ events: essEvents, department: "ESS", withModal: true });
    else if (page === "shows.html")
      initEventPage({ events: showsEvents, withModal: false });
  });
})();
