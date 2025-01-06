document.querySelector(".gate-button").addEventListener("click", function () {
  document.querySelector(".gate").classList.add("open");
});

// Create floating bubbles
function createBubbles() {
  const content = document.querySelector(".content");
  const bubbleCount = 15;

  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement("div");
    bubble.className = "bubble";

    const size = Math.random() * 80 + 20;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    bubble.style.left = `${Math.random() * 100}%`;

    const duration = Math.random() * 15 + 15;
    bubble.style.animationDuration = `${duration}s`;

    bubble.style.animationDelay = `${Math.random() * 15}s`;

    content.appendChild(bubble);
  }
}

// Add parallax effect on scroll
function handleParallax() {
  const scrolled = window.pageYOffset;

  // Parallax for h1
  const h1 = document.querySelector(".content h1");
  if (h1) {
    h1.style.transform = `translateY(${
      scrolled * 0.5
    }px) translateZ(0.5px) scale(0.75)`;
  }

  // Parallax for p
  const p = document.querySelector(".content p");
  if (p) {
    p.style.transform = `translateY(${
      scrolled * 0.7
    }px) translateZ(1px) scale(0.5)`;
  }

  // Parallax for bubbles
  const bubbles = document.querySelectorAll(".bubble");
  bubbles.forEach((bubble, index) => {
    const speed = 0.2 + (index % 3) * 0.1;
    bubble.style.transform = `translateY(${
      scrolled * speed
    }px) translateZ(0.2px)`;
  });
}

// Mouse trail effect
function createPaintTrail() {
  const colors = ["#ff6b6b", "#4ecdc4", "#ffbe0b", "#ff006e"];
  const trail = document.createElement("div");
  trail.className = "paint-trail";
  trail.style.background = colors[Math.floor(Math.random() * colors.length)];
  addRandomness(trail);
  document.body.appendChild(trail);

  setTimeout(() => {
    trail.style.opacity = "0";
    setTimeout(() => {
      trail.remove();
    }, 300);
  }, 500);

  return trail;
}

function handleMouseMove(e) {
  // Create paint trail
  const trail = createPaintTrail();
  trail.style.left = e.clientX + "px";
  trail.style.top = e.clientY + "px";

  // Bubble avoidance
  const bubbles = document.querySelectorAll(".bubble");
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  const avoidanceRadius = 100; // Distance at which bubbles start avoiding the cursor

  bubbles.forEach((bubble) => {
    const rect = bubble.getBoundingClientRect();
    const bubbleX = rect.left + rect.width / 2;
    const bubbleY = rect.top + rect.height / 2;

    const dx = mouseX - bubbleX;
    const dy = mouseY - bubbleY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < avoidanceRadius) {
      const angle = Math.atan2(dy, dx);
      const pushX = (avoidanceRadius - distance) * Math.cos(angle) * -0.5;
      const pushY = (avoidanceRadius - distance) * Math.sin(angle) * -0.5;

      bubble.style.transform = `translate(${pushX}px, ${pushY}px) translateZ(0.2px)`;
    } else {
      bubble.style.transform = "translate(0, 0) translateZ(0.2px)";
    }
  });
}

// Initialize
window.addEventListener("load", () => {
  createBubbles();
  window.addEventListener("scroll", handleParallax);
  window.addEventListener("mousemove", handleMouseMove);
});

// Optional: Add some randomness to the paint trail
function addRandomness(trail) {
  const size = 5 + Math.random() * 15;
  const rotation = Math.random() * 360;
  trail.style.width = size + "px";
  trail.style.height = size + "px";
  trail.style.transform = `rotate(${rotation}deg)`;
}
