// ============================================
// 欢迎页交互逻辑 - 性能优化版本
// ============================================

import { initRouter, navigate } from './router.js';
import { initBlog, loadBlog } from './blog.js';
import { initArticle, loadArticle } from './article.js';
import { initThemeSwitch } from './ui/theme-switch.js';

// 等待 DOM 加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
} else {
  initApp();
}

function initApp() {
  initWelcomePage();
  initNavigationButtons();
  initBlog();
  initArticle();
  initThemeSwitch(document.getElementById('theme-select'));
  initRouter({ blog: loadBlog, article: loadArticle });
}

function initNavigationButtons() {
  const navButtons = document.querySelectorAll('[data-nav]');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-nav') || '';
      navigate(target === 'welcome' ? '' : target);
    });
  });
}

// ============================================
// 核心初始化函数
// ============================================
function initWelcomePage() {
  const container = document.querySelector('.container');
  const mainTitle = document.querySelector('.main-title');
  const gradientCircles = document.querySelectorAll('.gradient-circle');
  const floatingShapes = document.querySelectorAll('.shape');

  if (!container) return;

  const state = {
    mouseX: 0,
    mouseY: 0,
    currentX: 0,
    currentY: 0,
    lastParticleTime: 0,
    particlePool: [],
    maxParticles: 15,
    isAnimating: true
  };

  initStyles();
  initEventListeners(container, mainTitle, gradientCircles, floatingShapes, state);
  startMainAnimationLoop(gradientCircles, state);

  console.log('%c欢迎来到艺术感欢迎页！', 'color: #667eea; font-size: 24px; font-weight: bold;');
  console.log('%cWelcome to the Artistic Welcome Page!', 'color: #f093fb; font-size: 18px;');
}

function initStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .ripple {
      position: fixed;
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0);
      animation: rippleEffect 1s ease-out forwards;
      pointer-events: none;
      z-index: 1000;
    }

    @keyframes rippleEffect {
      to {
        transform: translate(-50%, -50%) scale(50);
        opacity: 0;
      }
    }

    .particle {
      position: fixed;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
      pointer-events: none;
      z-index: 100;
      opacity: 0;
      animation: particleFloat 1s ease-out forwards;
    }

    @keyframes particleFloat {
      0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
      }
      100% {
        transform: translate(calc(-50% + var(--tx, 0px)), calc(-50% + var(--ty, 0px))) scale(1);
        opacity: 0;
      }
    }

    .gradient-circle {
      animation: gradientShift 8s ease-in-out infinite alternate;
    }

    .gradient-circle:nth-child(1) { animation-delay: 0s; }
    .gradient-circle:nth-child(2) { animation-delay: 1s; }
    .gradient-circle:nth-child(3) { animation-delay: 2s; }

    @keyframes gradientShift {
      0% { filter: hue-rotate(0deg); }
      100% { filter: hue-rotate(60deg); }
    }
  `;
  document.head.appendChild(style);
}

function initEventListeners(container, mainTitle, gradientCircles, floatingShapes, state) {
  let mouseThrottleTimer = null;
  document.addEventListener('mousemove', (e) => {
    if (mouseThrottleTimer) return;

    mouseThrottleTimer = setTimeout(() => {
      state.mouseX = (e.clientX - window.innerWidth / 2) / 50;
      state.mouseY = (e.clientY - window.innerHeight / 2) / 50;

      const now = Date.now();
      if (now - state.lastParticleTime > 150) {
        createParticle(e.clientX, e.clientY, state.particlePool);
        state.lastParticleTime = now;
      }

      mouseThrottleTimer = null;
    }, 16);
  });

  container.addEventListener('click', (e) => {
    createRipple(e.clientX, e.clientY);

    setTimeout(() => {
      navigate('blog');
    }, 300);
  });

  floatingShapes.forEach((shape) => {
    shape.addEventListener('mouseover', () => {
      shape.style.transform = `scale(1.5) rotate(${Math.random() * 360}deg)`;
      shape.style.background = 'rgba(255, 255, 255, 0.3)';
    });

    shape.addEventListener('mouseout', () => {
      shape.style.transform = 'scale(1) rotate(0deg)';
      shape.style.background = 'rgba(255, 255, 255, 0.1)';
    });
  });

  if (mainTitle) {
    mainTitle.addEventListener('mouseenter', () => {
      mainTitle.style.transform = 'scale(1.05)';
      mainTitle.style.transition = 'transform 0.3s ease';
    });

    mainTitle.addEventListener('mouseleave', () => {
      mainTitle.style.transform = 'scale(1)';
    });
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // reserved for layout recalculation
    }, 250);
  });

  document.addEventListener('visibilitychange', () => {
    state.isAnimating = !document.hidden;
    if (state.isAnimating) {
      startMainAnimationLoop(gradientCircles, state);
    }
  });
}

function startMainAnimationLoop(gradientCircles, state) {
  if (!state.isAnimating) return;

  function animate() {
    if (!state.isAnimating) return;

    state.currentX += (state.mouseX - state.currentX) * 0.05;
    state.currentY += (state.mouseY - state.currentY) * 0.05;

    gradientCircles.forEach((circle) => {
      circle.style.transform = `translate(${state.currentX}px, ${state.currentY}px)`;
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function createRipple(x, y) {
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  document.body.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 1000);
}

function createParticle(x, y, pool) {
  let particle = pool.find(p => !p.inUse);
  if (!particle) {
    particle = { element: document.createElement('div'), inUse: false };
    particle.element.className = 'particle';
    document.body.appendChild(particle.element);
    pool.push(particle);
  }

  particle.inUse = true;
  particle.element.style.left = `${x}px`;
  particle.element.style.top = `${y}px`;

  const tx = (Math.random() - 0.5) * 100;
  const ty = (Math.random() - 0.5) * 100;
  particle.element.style.setProperty('--tx', `${tx}px`);
  particle.element.style.setProperty('--ty', `${ty}px`);

  particle.element.addEventListener('animationend', () => {
    particle.inUse = false;
  }, { once: true });
}
