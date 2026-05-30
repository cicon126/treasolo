const celestialBodies = {
    sun: {
        name: '太阳',
        nameEn: 'Sun',
        color: '#ffb347',
        tagline: '太阳系的心脏，生命能量的源泉',
        data: {
            diameter: '1,392,700 km',
            mass: '1.989 × 10³⁰ kg',
            surfaceTemp: '5,500°C',
            coreTemp: '15,000,000°C',
            age: '46亿年',
            composition: '73% 氢, 25% 氦',
            description: '太阳是位于太阳系中心的恒星，占据了太阳系总质量的99.86%。这颗巨大的等离子球体通过核聚变反应将氢转化为氦，持续不断地向宇宙空间释放光和热。太阳的能量驱动着地球的气候、天气和生命活动。每秒钟，太阳有超过400万吨的物质被转化为能量。太阳活动周期约为11年，包括太阳黑子、耀斑和日冕物质抛射等现象。'
        },
        imagePrompt: 'sun solar system glowing fiery sphere with solar flares corona in deep space photorealistic'
    },
    mercury: {
        name: '水星',
        nameEn: 'Mercury',
        size: 8,
        orbitRadius: 80,
        orbitSpeed: 4.74,
        color: '#b5b5b5',
        glowColor: 'rgba(181, 181, 181, 0.6)',
        tagline: '距离太阳最近的星球，冰火两重天',
        data: {
            diameter: '4,879 km',
            mass: '3.285 × 10²³ kg',
            orbitPeriod: '88 地球日',
            rotationPeriod: '58.6 地球日',
            temperature: '-173°C 至 427°C',
            moons: 0,
            description: '水星是太阳系中最小的行星，也是距离太阳最近的行星。由于没有大气层保护，水星表面温度变化极端，白天可达427°C，夜间降至-173°C。水星表面布满陨石坑，外观类似月球。它的公转速度是太阳系中最快的，仅需88个地球日即可完成一次公转。水星拥有一个巨大的铁核，占据其半径的85%。'
        },
        imagePrompt: 'mercury planet grey cratered surface solar system deep space photorealistic'
    },
    venus: {
        name: '金星',
        nameEn: 'Venus',
        size: 14,
        orbitRadius: 120,
        orbitSpeed: 3.50,
        color: '#e8cda0',
        glowColor: 'rgba(232, 205, 160, 0.6)',
        tagline: '地球的"恶魔双胞胎"，太阳系最热的行星',
        data: {
            diameter: '12,104 km',
            mass: '4.867 × 10²⁴ kg',
            orbitPeriod: '225 地球日',
            rotationPeriod: '243 地球日',
            temperature: '462°C',
            moons: 0,
            description: '金星是太阳系中最热的行星，表面温度高达462°C，甚至比距离太阳更近的水星还要热。这是由于金星浓厚的二氧化碳大气层造成的极端温室效应。金星的自转方向与大多数行星相反，而且自转极其缓慢，一天比一年还长。金星被浓密的硫酸云覆盖，表面大气压力是地球的92倍。'
        },
        imagePrompt: 'venus planet yellowish white cloudy atmosphere solar system deep space photorealistic'
    },
    earth: {
        name: '地球',
        nameEn: 'Earth',
        size: 15,
        orbitRadius: 170,
        orbitSpeed: 2.98,
        color: '#4da6ff',
        glowColor: 'rgba(77, 166, 255, 0.6)',
        tagline: '我们的蓝色家园，已知唯一存在生命的星球',
        data: {
            diameter: '12,742 km',
            mass: '5.972 × 10²⁴ kg',
            orbitPeriod: '365.25 天',
            rotationPeriod: '24 小时',
            temperature: '-88°C 至 58°C',
            moons: 1,
            description: '地球是太阳系中第三颗行星，也是目前已知唯一存在生命的星球。地球表面71%被水覆盖，拥有适宜的大气层和温度范围。地球的天然卫星——月球，稳定了地球的自转轴倾角，使得四季变化更为温和。地球的磁层保护我们免受有害的太阳辐射。地球是人类的家园，孕育了数百万种生命形式。'
        },
        imagePrompt: 'earth planet blue oceans white clouds green continents solar system deep space photorealistic'
    },
    mars: {
        name: '火星',
        nameEn: 'Mars',
        size: 11,
        orbitRadius: 220,
        orbitSpeed: 2.41,
        color: '#ff6b4a',
        glowColor: 'rgba(255, 107, 74, 0.6)',
        tagline: '红色星球，人类探索太空的下一站',
        data: {
            diameter: '6,779 km',
            mass: '6.39 × 10²³ kg',
            orbitPeriod: '687 地球日',
            rotationPeriod: '24.6 小时',
            temperature: '-87°C 至 -5°C',
            moons: 2,
            description: '火星因其表面富含氧化铁而呈现红色，被称为"红色星球"。火星拥有太阳系中最高的火山（奥林帕斯山，高度约21公里）和最深的峡谷（水手峡谷，深度约11公里）。火星曾经拥有浓厚的大气层和液态水，现在表面仍有水冰存在。火星是人类太空探索的重要目标，可能成为人类第二个居住地。'
        },
        imagePrompt: 'mars planet red surface craters polar ice caps solar system deep space photorealistic'
    },
    jupiter: {
        name: '木星',
        nameEn: 'Jupiter',
        size: 35,
        orbitRadius: 300,
        orbitSpeed: 1.31,
        color: '#d4a574',
        glowColor: 'rgba(212, 165, 116, 0.6)',
        tagline: '太阳系的巨人，风暴肆虐的气态巨行星',
        data: {
            diameter: '139,820 km',
            mass: '1.898 × 10²⁷ kg',
            orbitPeriod: '11.86 地球年',
            rotationPeriod: '9.9 小时',
            temperature: '-145°C',
            moons: 95,
            description: '木星是太阳系中最大的行星，其质量是其他七颗行星总和的2.5倍。这颗气态巨行星主要由氢和氦组成，拥有壮观的条纹云带和著名的大红斑——一个持续了数百年的巨大风暴系统，大小足以容纳三个地球。木星拥有强大的磁场和至少95颗已知卫星，其中四颗伽利略卫星（木卫一至木卫四）各具特色。'
        },
        imagePrompt: 'jupiter planet giant red spot striped atmosphere solar system deep space photorealistic'
    },
    saturn: {
        name: '土星',
        nameEn: 'Saturn',
        size: 30,
        orbitRadius: 380,
        orbitSpeed: 0.97,
        color: '#f4d59e',
        glowColor: 'rgba(244, 213, 158, 0.6)',
        tagline: '最美丽的行星，拥有壮观光环系统',
        data: {
            diameter: '116,460 km',
            mass: '5.683 × 10²⁶ kg',
            orbitPeriod: '29.46 地球年',
            rotationPeriod: '10.7 小时',
            temperature: '-178°C',
            moons: 146,
            description: '土星以其壮观的光环系统而闻名，这些光环主要由数十亿个冰块和岩石碎片组成。土星是太阳系中密度最低的行星，如果有足够大的海洋，它甚至可以漂浮在水上。土星拥有至少146颗已知卫星，其中土卫六（泰坦）是太阳系中唯一拥有浓厚大气层的卫星，甚至拥有液态甲烷湖泊。土星的六边形北极风暴是太阳系中独特的现象。'
        },
        imagePrompt: 'saturn planet beautiful rings system solar system deep space photorealistic'
    },
    uranus: {
        name: '天王星',
        nameEn: 'Uranus',
        size: 20,
        orbitRadius: 450,
        orbitSpeed: 0.68,
        color: '#7de3f0',
        glowColor: 'rgba(125, 227, 240, 0.6)',
        tagline: '侧躺着公转的冰巨星，独特的蓝绿色世界',
        data: {
            diameter: '50,724 km',
            mass: '8.681 × 10²⁵ kg',
            orbitPeriod: '84 地球年',
            rotationPeriod: '17.2 小时',
            temperature: '-224°C',
            moons: 27,
            description: '天王星是太阳系中最独特的行星之一，它的自转轴几乎与公转平面平行，几乎是"躺着"绕太阳公转。天王星呈现出美丽的蓝绿色，这是由于其大气层中含有甲烷。天王星是一颗冰巨星，主要由岩石、水、氨和甲烷冰组成。它拥有微弱的光环系统和27颗已知卫星，这些卫星都以莎士比亚作品中的角色命名。'
        },
        imagePrompt: 'uranus planet light blue green tilted axis solar system deep space photorealistic'
    },
    neptune: {
        name: '海王星',
        nameEn: 'Neptune',
        size: 19,
        orbitRadius: 520,
        orbitSpeed: 0.54,
        color: '#4166f5',
        glowColor: 'rgba(65, 102, 245, 0.6)',
        tagline: '最遥远的行星，狂风呼啸的深蓝世界',
        data: {
            diameter: '49,244 km',
            mass: '1.024 × 10²⁶ kg',
            orbitPeriod: '164.8 地球年',
            rotationPeriod: '16.1 小时',
            temperature: '-218°C',
            moons: 14,
            description: '海王星是太阳系中最遥远的行星，也是风速最快的行星，风速可达每小时2,100公里。这颗深蓝色的冰巨星拥有太阳系中最强烈的风暴系统。海王星呈现深蓝色是由于其大气层中的甲烷。海王星拥有14颗已知卫星，其中海卫一是太阳系中最大的逆行卫星，它可能是被海王星的引力捕获的柯伊伯带天体。'
        },
        imagePrompt: 'neptune planet deep blue atmosphere dark spot solar system deep space photorealistic'
    }
};

const planetsList = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

const state = {
    isPlaying: true,
    hoverPaused: false,
    speedMultiplier: 1,
    showOrbits: true,
    planetAngles: {},
    lastTimestamp: 0
};

planetsList.forEach(planet => {
    state.planetAngles[planet] = Math.random() * Math.PI * 2;
});

const canvas = document.getElementById('starsCanvas');
const ctx = canvas.getContext('2d');
let stars = [];
let shootingStars = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
}

function initStars() {
    stars = [];
    const starCount = Math.floor((canvas.width * canvas.height) / 3000);
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            baseOpacity: Math.random() * 0.5 + 0.3,
            twinkleSpeed: Math.random() * 0.02 + 0.01,
            twinklePhase: Math.random() * Math.PI * 2
        });
    }
}

function createShootingStar() {
    if (Math.random() < 0.005 && shootingStars.length < 3) {
        shootingStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.5,
            length: Math.random() * 80 + 40,
            speed: Math.random() * 8 + 5,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
            opacity: 1
        });
    }
}

function drawStars(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
        const twinkle = Math.sin(timestamp * star.twinkleSpeed + star.twinklePhase);
        const opacity = star.baseOpacity + twinkle * 0.3;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, opacity))})`;
        ctx.fill();
    });
    
    createShootingStar();
    
    shootingStars = shootingStars.filter(star => {
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.02;
        
        if (star.opacity <= 0 || star.x > canvas.width || star.y > canvas.height) {
            return false;
        }
        
        const gradient = ctx.createLinearGradient(
            star.x, star.y,
            star.x - Math.cos(star.angle) * star.length,
            star.y - Math.sin(star.angle) * star.length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(
            star.x - Math.cos(star.angle) * star.length,
            star.y - Math.sin(star.angle) * star.length
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        return true;
    });
}

function createOrbits() {
    const orbitsContainer = document.getElementById('orbits');
    planetsList.forEach(planetKey => {
        const planet = celestialBodies[planetKey];
        const orbit = document.createElement('div');
        orbit.className = 'orbit';
        orbit.style.width = `${planet.orbitRadius * 2}px`;
        orbit.style.height = `${planet.orbitRadius * 2}px`;
        orbitsContainer.appendChild(orbit);
    });
}

function createPlanets() {
    const planetsContainer = document.getElementById('planets');
    planetsList.forEach(planetKey => {
        const planet = celestialBodies[planetKey];
        
        const planetWrapper = document.createElement('div');
        planetWrapper.className = 'planet-wrapper';
        planetWrapper.dataset.planet = planetKey;
        planetWrapper.style.width = `${planet.size * 2}px`;
        planetWrapper.style.height = `${planet.size * 2}px`;
        
        const planetBody = document.createElement('div');
        planetBody.className = 'planet';
        planetBody.style.width = `${planet.size}px`;
        planetBody.style.height = `${planet.size}px`;
        planetBody.style.background = `radial-gradient(circle at 30% 30%, ${lightenColor(planet.color, 30)}, ${planet.color}, ${darkenColor(planet.color, 30)})`;
        planetBody.style.boxShadow = `0 0 ${planet.size}px ${planet.glowColor}, inset -${planet.size/4}px -${planet.size/4}px ${planet.size/2}px rgba(0,0,0,0.4)`;
        
        const glow = document.createElement('div');
        glow.className = 'planet-glow';
        glow.style.width = `${planet.size * 1.8}px`;
        glow.style.height = `${planet.size * 1.8}px`;
        glow.style.background = `radial-gradient(circle, ${planet.glowColor}, transparent 70%)`;
        planetBody.appendChild(glow);
        
        planetWrapper.appendChild(planetBody);
        
        planetWrapper.addEventListener('click', () => openPlanetModal(planetKey));
        
        planetWrapper.addEventListener('mouseenter', () => {
            state.hoverPaused = true;
        });
        
        planetWrapper.addEventListener('mouseleave', () => {
            state.hoverPaused = false;
        });
        
        planetsContainer.appendChild(planetWrapper);
    });
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function updatePlanetPositions(timestamp) {
    if (!state.lastTimestamp) state.lastTimestamp = timestamp;
    const deltaTime = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;
    
    const solarSystem = document.getElementById('solarSystem');
    const centerX = solarSystem.offsetWidth / 2;
    const centerY = solarSystem.offsetHeight / 2;
    
    planetsList.forEach(planetKey => {
        const planet = celestialBodies[planetKey];
        const planetWrapper = document.querySelector(`[data-planet="${planetKey}"]`);
        
        if (state.isPlaying && !state.hoverPaused) {
            state.planetAngles[planetKey] += (planet.orbitSpeed * 0.1 * state.speedMultiplier * deltaTime);
        }
        
        const angle = state.planetAngles[planetKey];
        const wrapperSize = planet.size * 2;
        const x = centerX + Math.cos(angle) * planet.orbitRadius - wrapperSize / 2;
        const y = centerY + Math.sin(angle) * planet.orbitRadius - wrapperSize / 2;
        
        planetWrapper.style.transform = `translate(${x}px, ${y}px)`;
    });
}

function animate(timestamp) {
    drawStars(timestamp);
    updatePlanetPositions(timestamp);
    requestAnimationFrame(animate);
}

function openPlanetModal(planetKey) {
    const planet = celestialBodies[planetKey];
    const modalOverlay = document.getElementById('modalOverlay');
    const modalBody = document.getElementById('modalBody');
    
    const imageUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(planet.imagePrompt)}&image_size=square_hd`;
    
    modalBody.innerHTML = `
        <div class="planet-header">
            <div class="planet-image-container" style="color: ${planet.color}">
                <div class="planet-image-glow" style="background: ${planet.color}"></div>
                <img class="planet-image" src="${imageUrl}" alt="${planet.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 30% 30%, ${lightenColor(planet.color, 40)}, ${planet.color}, ${darkenColor(planet.color, 40)});box-shadow:0 0 40px ${planet.color};\\'></div>'">
            </div>
            <div class="planet-titles">
                <h2 class="planet-name">${planet.name}</h2>
                <p class="planet-name-en">${planet.nameEn.toUpperCase()}</p>
                <p class="planet-tagline">"${planet.tagline}"</p>
            </div>
        </div>
        
        <p class="planet-description">${planet.data.description}</p>
        
        <div class="info-grid">
            <div class="info-card">
                <div class="info-icon">📏</div>
                <div class="info-label">直径</div>
                <div class="info-value">${planet.data.diameter}</div>
            </div>
            <div class="info-card">
                <div class="info-icon">⚖️</div>
                <div class="info-label">质量</div>
                <div class="info-value">${planet.data.mass}</div>
            </div>
            <div class="info-card">
                <div class="info-icon">🔄</div>
                <div class="info-label">公转周期</div>
                <div class="info-value">${planet.data.orbitPeriod}</div>
            </div>
            <div class="info-card">
                <div class="info-icon">🌍</div>
                <div class="info-label">自转周期</div>
                <div class="info-value">${planet.data.rotationPeriod}</div>
            </div>
            <div class="info-card">
                <div class="info-icon">🌡️</div>
                <div class="info-label">表面温度</div>
                <div class="info-value">${planet.data.temperature}</div>
            </div>
            <div class="info-card">
                <div class="info-icon">🌙</div>
                <div class="info-label">已知卫星</div>
                <div class="info-value">${planet.data.moons} 颗</div>
            </div>
        </div>
    `;
    
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openSunModal() {
    const sun = celestialBodies.sun;
    const modalOverlay = document.getElementById('modalOverlay');
    const modalBody = document.getElementById('modalBody');
    
    const imageUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(sun.imagePrompt)}&image_size=square_hd`;
    
    modalBody.innerHTML = `
        <div class="planet-header">
            <div class="planet-image-container" style="color: ${sun.color}">
                <div class="planet-image-glow" style="background: ${sun.color}"></div>
                <img class="planet-image" src="${imageUrl}" alt="${sun.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 30% 30%, #fff7e0, #ffd700, #ff8c00, #ff4500);box-shadow:0 0 60px #ffb347;\\'></div>'">
            </div>
            <div class="planet-titles">
                <h2 class="planet-name">${sun.name}</h2>
                <p class="planet-name-en">${sun.nameEn.toUpperCase()}</p>
                <p class="planet-tagline">"${sun.tagline}"</p>
            </div>
        </div>
        
        <p class="planet-description">${sun.data.description}</p>
        
        <div class="info-grid">
            <div class="info-card">
                <div class="info-icon">📏</div>
                <div class="info-label">直径</div>
                <div class="info-value">${sun.data.diameter}</div>
            </div>
            <div class="info-card">
                <div class="info-icon">⚖️</div>
                <div class="info-label">质量</div>
                <div class="info-value">${sun.data.mass}</div>
            </div>
            <div class="info-card">
                <div class="info-icon">🌡️</div>
                <div class="info-label">表面温度</div>
                <div class="info-value">${sun.data.surfaceTemp}</div>
            </div>
            <div class="info-card">
                <div class="info-icon">🔥</div>
                <div class="info-label">核心温度</div>
                <div class="info-value">${sun.data.coreTemp}</div>
            </div>
            <div class="info-card">
                <div class="info-icon">📅</div>
                <div class="info-label">年龄</div>
                <div class="info-value">${sun.data.age}</div>
            </div>
            <div class="info-card">
                <div class="info-icon">🔬</div>
                <div class="info-label">主要成分</div>
                <div class="info-value">${sun.data.composition}</div>
            </div>
        </div>
    `;
    
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    state.hoverPaused = false;
}

function initControls() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const playText = document.getElementById('playText');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const orbitToggle = document.getElementById('orbitToggle');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    const sun = document.getElementById('sun');
    
    playPauseBtn.addEventListener('click', () => {
        state.isPlaying = !state.isPlaying;
        playIcon.textContent = state.isPlaying ? '⏸' : '▶';
        playText.textContent = state.isPlaying ? '暂停' : '播放';
    });
    
    speedSlider.addEventListener('input', (e) => {
        state.speedMultiplier = parseFloat(e.target.value);
        speedValue.textContent = `${state.speedMultiplier.toFixed(1)}x`;
    });
    
    orbitToggle.addEventListener('change', (e) => {
        state.showOrbits = e.target.checked;
        const orbits = document.querySelectorAll('.orbit');
        orbits.forEach(orbit => {
            if (state.showOrbits) {
                orbit.classList.remove('hidden');
            } else {
                orbit.classList.add('hidden');
            }
        });
    });
    
    modalClose.addEventListener('click', closeModal);
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    sun.addEventListener('click', openSunModal);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function init() {
    resizeCanvas();
    createOrbits();
    createPlanets();
    initControls();
    requestAnimationFrame(animate);
    
    window.addEventListener('resize', resizeCanvas);
}

document.addEventListener('DOMContentLoaded', init);
