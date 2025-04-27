// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化粒子效果
    initParticles();
    
    // 初始化悬浮卡片效果
    initFloatingCards();
    
    // 初始化图表
    initCharts();
    
    // 初始化3D模型效果
    init3DModel();
    
    // 初始化轮播图
    initCarousel();
    
    // 初始化demo步骤
    initDemoSteps();
    
    // 滚动效果
    initScrollEffects();
    
    // 导航栏滚动效果
    initNavScroll();
});

// 粒子效果初始化
function initParticles() {
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ffffff"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }
}

// 悬浮卡片效果
function initFloatingCards() {
    document.addEventListener('mousemove', function(e) {
        const cards = document.querySelectorAll('.floating-card');
        cards.forEach(card => {
            const offset = card.getAttribute('data-offset') || 20;
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const moveX = (e.clientX - centerX) / window.innerWidth * offset;
            const moveY = (e.clientY - centerY) / window.innerHeight * offset;
            
            card.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });
}

// 初始化图表
function initCharts() {
    // 营养雷达图
    const nutritionChart = document.getElementById('nutritionChart');
    if (nutritionChart) {
        new Chart(nutritionChart, {
            type: 'radar',
            data: {
                labels: ['蛋白质', '碳水化合物', '脂肪', '纤维素', '维生素', '矿物质'],
                datasets: [{
                    label: '营养成分',
                    data: [65, 45, 30, 80, 60, 55],
                    backgroundColor: 'rgba(76, 201, 240, 0.2)',
                    borderColor: 'rgba(76, 201, 240, 1)',
                    pointBackgroundColor: 'rgba(76, 201, 240, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(76, 201, 240, 1)'
                }]
            },
            options: {
                elements: {
                    line: {
                        tension: 0.1
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            display: false,
                            beginAtZero: true,
                            max: 100
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // 生命体征图表
    const vitalsChart = document.getElementById('vitalsChart');
    if (vitalsChart) {
        const gradient = vitalsChart.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(67, 97, 238, 0.7)');
        gradient.addColorStop(1, 'rgba(67, 97, 238, 0.1)');

        new Chart(vitalsChart, {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
                datasets: [{
                    label: '心率',
                    data: [72, 75, 73, 78, 71, 74, 72],
                    borderColor: 'rgba(67, 97, 238, 1)',
                    backgroundColor: 'transparent',
                    pointBackgroundColor: 'rgba(67, 97, 238, 1)',
                    tension: 0.4
                }, {
                    label: '血压',
                    data: [120, 118, 125, 122, 119, 121, 118],
                    borderColor: 'rgba(114, 9, 183, 1)',
                    backgroundColor: 'transparent',
                    pointBackgroundColor: 'rgba(114, 9, 183, 1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }
}

// 3D模型效果
function init3DModel() {
    const modelContainer = document.getElementById('3d-model');
    if (modelContainer && typeof THREE !== 'undefined') {
        // 这里只是模拟一个简单的3D效果
        // 真实项目中可以使用Three.js加载更复杂的3D模型
        
        // 基本场景设置
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(70, modelContainer.clientWidth / modelContainer.clientHeight, 0.1, 1000);
        
        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
        renderer.setClearColor(0x000000, 0);
        modelContainer.appendChild(renderer.domElement);
        
        // 添加光源
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0x4cc9f0, 1);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);
        
        // 创建简单的人体形状
        const geometry = new THREE.CylinderGeometry(1, 0.5, 4, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4361ee,
            opacity: 0.7,
            transparent: true,
            wireframe: true
        });
        const humanModel = new THREE.Mesh(geometry, material);
        scene.add(humanModel);
        
        // 添加头部
        const headGeometry = new THREE.SphereGeometry(0.7, 32, 32);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0x4361ee,
            opacity: 0.7,
            transparent: true,
            wireframe: true
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.5;
        scene.add(head);
        
        // 设置摄像机位置
        camera.position.z = 8;
        
        // 动画函数
        function animate() {
            requestAnimationFrame(animate);
            
            // 旋转模型
            humanModel.rotation.y += 0.01;
            head.rotation.y += 0.01;
            
            renderer.render(scene, camera);
        }
        
        animate();
        
        // 响应式调整
        window.addEventListener('resize', function() {
            if (modelContainer) {
                camera.aspect = modelContainer.clientWidth / modelContainer.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
            }
        });
    }
}

// 初始化轮播图
function initCarousel() {
    const cards = document.querySelectorAll('.testimonial-card');
    const indicators = document.querySelectorAll('.indicator');
    let currentIndex = 0;
    
    function showCard(index) {
        // 隐藏所有卡片
        cards.forEach(card => {
            card.classList.remove('active');
            card.style.transform = 'translateX(100%)';
            card.style.opacity = '0';
        });
        
        // 显示当前卡片
        cards[index].classList.add('active');
        cards[index].style.transform = 'translateX(0)';
        cards[index].style.opacity = '1';
        
        // 更新指示器状态
        indicators.forEach(indicator => indicator.classList.remove('active'));
        indicators[index].classList.add('active');
    }
    
    // 指示器点击事件
    indicators.forEach((indicator, idx) => {
        indicator.addEventListener('click', () => {
            currentIndex = idx;
            showCard(currentIndex);
        });
    });
    
    // 自动轮播
    function autoSlide() {
        currentIndex = (currentIndex + 1) % cards.length;
        showCard(currentIndex);
    }
    
    // 每5秒切换一次
    let intervalId = setInterval(autoSlide, 5000);
    
    // 鼠标悬停时暂停轮播
    const carouselContainer = document.querySelector('.testimonial-carousel');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(intervalId);
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            intervalId = setInterval(autoSlide, 5000);
        });
    }
}

// 初始化Demo步骤
function initDemoSteps() {
    const steps = document.querySelectorAll('.demo-step');
    let currentStep = 0;
    
    function showStep(index) {
        steps.forEach((step, idx) => {
            if (idx === index) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
    
    // 初始显示第一步
    showStep(currentStep);
    
    // 每3秒切换一步
    setInterval(() => {
        currentStep = (currentStep + 1) % steps.length;
        showStep(currentStep);
    }, 3000);
    
    // 点击步骤切换
    steps.forEach((step, idx) => {
        step.addEventListener('click', () => {
            currentStep = idx;
            showStep(currentStep);
        });
    });
}

// 滚动效果
function initScrollEffects() {
    // 元素进入视窗时添加动画
    const animateElements = document.querySelectorAll('.section-title, .flip-card, .viz-card, .honeycomb-cell');
    
    function checkIfInView() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    }
    
    // 添加动画类的样式（添加到CSS中）
    const style = document.createElement('style');
    style.innerHTML = `
        .section-title, .flip-card, .viz-card, .honeycomb-cell {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .section-title.animate, .flip-card.animate, .viz-card.animate, .honeycomb-cell.animate {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
    
    // 初始检查
    checkIfInView();
    
    // 滚动时检查
    window.addEventListener('scroll', checkIfInView);
}

// 导航栏滚动效果
function initNavScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.9)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.1)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        }
    });
} 