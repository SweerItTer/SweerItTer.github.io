// ============================================
// 欢迎页交互逻辑 - 性能优化版本
// ============================================

(function() {
    'use strict';

    // 等待 DOM 加载完成
    document.addEventListener('DOMContentLoaded', () => {
        initWelcomePage();
    });

    // ============================================
    // 核心初始化函数
    // ============================================
    function initWelcomePage() {
        // 获取 DOM 元素
        const container = document.querySelector('.container');
        const mainTitle = document.querySelector('.main-title');
        const gradientCircles = document.querySelectorAll('.gradient-circle');
        const floatingShapes = document.querySelectorAll('.shape');

        // 初始化状态
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

        // 初始化样式
        initStyles();

        // 初始化事件监听器
        initEventListeners(container, mainTitle, gradientCircles, floatingShapes, state);

        // 启动主动画循环（合并了多个 RAF 循环）
        startMainAnimationLoop(gradientCircles, state);

        // 控制台欢迎消息
        console.log('%c欢迎来到艺术感欢迎页！', 'color: #667eea; font-size: 24px; font-weight: bold;');
        console.log('%cWelcome to the Artistic Welcome Page!', 'color: #f093fb; font-size: 18px;');
    }

    // ============================================
    // 初始化样式
    // ============================================
    function initStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 涟波效果样式 */
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

            /* 粒子样式 - 使用 CSS 动画避免 JS 循环 */
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

            /* 渐变圆圈使用 CSS 动画 */
            .gradient-circle {
                animation: gradientShift 8s ease-in-out infinite alternate;
            }

            .gradient-circle:nth-child(1) { animation-delay: 0s; }
            .gradient-circle:nth-child(2) { animation-delay: 1s; }
            .gradient-circle:nth-child(3) { animation-delay: 2s; }

            @keyframes gradientShift {
                0% {
                    filter: hue-rotate(0deg);
                }
                100% {
                    filter: hue-rotate(60deg);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // 初始化事件监听器
    // ============================================
    function initEventListeners(container, mainTitle, gradientCircles, floatingShapes, state) {
        // 鼠标移动事件（节流）
        let mouseThrottleTimer = null;
        document.addEventListener('mousemove', (e) => {
            if (mouseThrottleTimer) return;

            mouseThrottleTimer = setTimeout(() => {
                state.mouseX = (e.clientX - window.innerWidth / 2) / 50;
                state.mouseY = (e.clientY - window.innerHeight / 2) / 50;

                // 创建粒子（限制频率）
                const now = Date.now();
                if (now - state.lastParticleTime > 150) { // 增加间隔到 150ms
                    createParticle(e.clientX, e.clientY, state.particlePool);
                    state.lastParticleTime = now;
                }

                mouseThrottleTimer = null;
            }, 16); // 约 60fps
        });

        // 点击涟波效果和页面跳转
        container.addEventListener('click', (e) => {
            createRipple(e.clientX, e.clientY);

            // 延迟跳转到博客页面，让涟波效果先播放
            setTimeout(() => {
                if (window.Router && window.Router.navigate) {
                    window.Router.navigate('blog');
                }
            }, 300);
        });

        // 浮动形状悬停效果
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

        // 标题悬停效果
        mainTitle.addEventListener('mouseenter', () => {
            mainTitle.style.transform = 'scale(1.05)';
            mainTitle.style.transition = 'transform 0.3s ease';
        });

        mainTitle.addEventListener('mouseleave', () => {
            mainTitle.style.transform = 'scale(1)';
        });

        // 窗口大小改变（节流）
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // 重新计算位置（如果需要）
            }, 250);
        });

        // 页面可见性变化 - 优化性能
        document.addEventListener('visibilitychange', () => {
            state.isAnimating = !document.hidden;
            if (state.isAnimating) {
                startMainAnimationLoop(gradientCircles, state);
            }
        });
    }

    // ============================================
    // 主动画循环 - 合并了多个 RAF 循环
    // ============================================
    function startMainAnimationLoop(gradientCircles, state) {
        if (!state.isAnimating) return;

        function animate() {
            if (!state.isAnimating) return;

            // 平滑鼠标移动（视差效果）
            state.currentX += (state.mouseX - state.currentX) * 0.05;
            state.currentY += (state.mouseY - state.currentY) * 0.05;

            // 更新渐变圆圈位置
            gradientCircles.forEach((circle, index) => {
                const depth = (index + 1) * 2;
                circle.style.transform = `translate(${state.currentX * depth}px, ${state.currentY * depth}px)`;
            });

            // 继续下一帧
            requestAnimationFrame(animate);
        }

        animate();
    }

    // ============================================
    // 创建涟波效果
    // ============================================
    function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        document.body.appendChild(ripple);

        // 使用 setTimeout 在动画结束后移除元素
        setTimeout(() => {
            ripple.remove();
        }, 1000);
    }

    // ============================================
    // 创建粒子 - 使用对象池模式
    // ============================================
    function createParticle(x, y, pool) {
        // 从对象池获取或创建新粒子
        let particle = pool.find(p => !p.active);

        if (!particle && pool.length < 15) { // 限制最大粒子数
            particle = {
                element: document.createElement('div'),
                active: false
            };
            particle.element.className = 'particle';
            document.body.appendChild(particle);
            pool.push(particle);
        }

        if (!particle) return; // 达到最大粒子数，不再创建

        // 重置粒子状态
        particle.active = true;
        const element = particle.element;

        // 随机大小
        const size = Math.random() * 8 + 4;
        element.style.width = size + 'px';
        element.style.height = size + 'px';
        element.style.left = x + 'px';
        element.style.top = y + 'px';

        // 随机运动方向（通过 CSS 变量传递给动画）
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 30;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;

        element.style.setProperty('--tx', endX + 'px');
        element.style.setProperty('--ty', endY + 'px');

        // 重新触发动画
        element.style.animation = 'none';
        element.offsetHeight; // 触发重绘
        element.style.animation = `particleFloat 1s ease-out forwards`;

        // 动画结束后标记为不活跃
        element.addEventListener('animationend', () => {
            particle.active = false;
        }, { once: true });
    }
})();