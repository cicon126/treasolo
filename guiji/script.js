class VehicleSimulator {
    constructor() {
        this.map = null;
        this.vehicleMarker = null;
        this.polyline = null;
        this.path = [];
        this.currentPathIndex = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.animationId = null;
        this.vehicleColor = '#e74c3c';
        this.vehicleType = 'car';
        this.speed = 60;
        this.distance = 0;
        this.startTime = null;
        this.elapsedTime = 0;
        this.lastTime = null;
        this.currentLngLat = null;
        this.geocoder = null;
        this.mapLoaded = false;
    }

    init() {
        this.initMap();
    }

    initMap() {
        try {
            this.map = new AMap.Map('map', {
                zoom: 14,
                center: [116.397428, 39.90923],
                viewMode: '2D',
                pitch: 0
            });

            this.map.on('complete', () => {
                console.log('地图加载完成');
                this.mapLoaded = true;
                this.initRoute();
                this.bindEvents();
            });

            this.map.on('error', (e) => {
                console.error('地图加载错误:', e);
            });

            this.map.addControl(new AMap.Scale());
            this.map.addControl(new AMap.ToolBar());
            
            this.geocoder = new AMap.Geocoder({
                radius: 1000,
                extensions: 'base'
            });
        } catch (e) {
            console.error('地图初始化失败:', e);
            alert('地图加载失败，请检查网络连接或API密钥');
        }
    }

    initRoute() {
        this.path = [
            [116.38, 39.91],
            [116.385, 39.912],
            [116.39, 39.915],
            [116.395, 39.913],
            [116.4, 39.91],
            [116.405, 39.908],
            [116.41, 39.906],
            [116.415, 39.904],
            [116.41, 39.90],
            [116.405, 39.896],
            [116.4, 39.892],
            [116.395, 39.89],
            [116.39, 39.892],
            [116.385, 39.895],
            [116.38, 39.898],
            [116.378, 39.902],
            [116.379, 39.906],
            [116.38, 39.91]
        ];

        if (this.polyline) {
            this.map.remove(this.polyline);
        }

        this.polyline = new AMap.Polyline({
            path: this.path,
            strokeColor: '#667eea',
            strokeWeight: 8,
            strokeOpacity: 1,
            strokeStyle: 'solid',
            lineJoin: 'round',
            lineCap: 'round',
            zIndex: 50
        });

        this.map.add(this.polyline);
        this.polyline.show();

        this.createVehicleMarker();

        setTimeout(() => {
            this.map.setFitView([this.polyline], false, [100, 100, 100, 100]);
        }, 500);
    }

    createVehicleMarker() {
        if (this.vehicleMarker) {
            this.map.remove(this.vehicleMarker);
            this.vehicleMarker = null;
        }

        const markerContent = this.createVehicleIcon();
        const size = this.vehicleType === 'bus' ? 48 : (this.vehicleType === 'truck' ? 44 : 40);
        
        this.vehicleMarker = new AMap.Marker({
            position: this.path[0],
            content: markerContent,
            offset: new AMap.Pixel(-size / 2, -size / 2),
            angle: 0,
            zIndex: 100
        });

        this.vehicleMarker.on('click', () => {
            this.showVehicleInfo();
        });

        this.map.add(this.vehicleMarker);
        this.currentLngLat = [...this.path[0]];
        this.updateLocationDisplay();
    }

    createVehicleIcon() {
        const size = this.vehicleType === 'bus' ? 48 : (this.vehicleType === 'truck' ? 44 : 40);
        const div = document.createElement('div');
        div.className = 'vehicle-marker';
        div.style.cssText = `
            width: ${size}px !important;
            height: ${size}px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            position: relative !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)) !important;
        `;
        
        const icons = {
            car: '🚗',
            truck: '🚚',
            bus: '🚌'
        };
        
        div.innerHTML = `<span style="font-size: ${size}px !important; line-height: 1 !important;">${icons[this.vehicleType]}</span>`;
        return div;
    }

    bindEvents() {
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                colorOptions.forEach(o => o.classList.remove('active'));
                e.target.classList.add('active');
                this.vehicleColor = e.target.dataset.color;
                if (!this.isRunning) {
                    this.createVehicleMarker();
                }
            });
        });

        const vehicleType = document.getElementById('vehicleType');
        if (vehicleType) {
            vehicleType.addEventListener('change', (e) => {
                this.vehicleType = e.target.value;
                if (!this.isRunning) {
                    this.createVehicleMarker();
                }
            });
        }

        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        if (speedSlider && speedValue) {
            speedSlider.addEventListener('input', (e) => {
                this.speed = parseInt(e.target.value);
                speedValue.textContent = `${this.speed} km/h`;
            });
        }

        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('点击开始按钮');
                this.start();
            });
        }
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                console.log('点击暂停按钮');
                this.togglePause();
            });
        }
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                console.log('点击停止按钮');
                this.stop();
            });
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('点击重置按钮');
                this.reset();
            });
        }

        console.log('事件绑定完成');
    }

    start() {
        if (this.isRunning && !this.isPaused) {
            console.log('已经在运行中');
            return;
        }

        console.log('开始行驶');

        if (!this.isPaused) {
            this.currentPathIndex = 0;
            this.distance = 0;
            this.elapsedTime = 0;
            this.startTime = Date.now();
            this.lastTime = Date.now();
            this.currentLngLat = [...this.path[0]];
            this.createVehicleMarker();
        } else {
            this.startTime = Date.now() - this.elapsedTime * 1000;
            this.lastTime = Date.now();
        }

        this.isRunning = true;
        this.isPaused = false;
        this.updateButtons('running');
        this.updateStatusDisplay();
        this.animate();
    }

    togglePause() {
        if (!this.isRunning) return;

        if (this.isPaused) {
            this.isPaused = false;
            this.startTime = Date.now() - this.elapsedTime * 1000;
            this.lastTime = Date.now();
            this.updateButtons('running');
            this.animate();
        } else {
            this.isPaused = true;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            this.updateButtons('paused');
            this.updateStatusDisplay();
        }
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.updateButtons('stopped');
        this.updateStatusDisplay();
    }

    reset() {
        this.stop();
        this.currentPathIndex = 0;
        this.distance = 0;
        this.elapsedTime = 0;
        this.currentLngLat = [...this.path[0]];
        this.createVehicleMarker();
        this.updateStatusDisplay();
        this.updateLocationDisplay();
    }

    animate() {
        if (!this.isRunning || this.isPaused) return;

        const now = Date.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        this.elapsedTime = (now - this.startTime) / 1000;

        const speedMetersPerSecond = this.speed * 1000 / 3600;
        const moveDistance = speedMetersPerSecond * deltaTime;

        this.moveVehicle(moveDistance);

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    moveVehicle(distance) {
        const startPoint = this.path[this.currentPathIndex];
        const endPoint = this.path[(this.currentPathIndex + 1) % this.path.length];

        const segmentLength = this.getDistance(startPoint, endPoint);
        const currentSegmentProgress = this.getDistance(startPoint, this.currentLngLat);
        
        const remainingDistance = segmentLength - currentSegmentProgress;

        if (distance < remainingDistance) {
            const ratio = (currentSegmentProgress + distance) / segmentLength;
            const newLng = startPoint[0] + (endPoint[0] - startPoint[0]) * ratio;
            const newLat = startPoint[1] + (endPoint[1] - startPoint[1]) * ratio;
            this.currentLngLat = [newLng, newLat];
            this.distance += distance / 1000;
        } else {
            this.distance += remainingDistance / 1000;
            this.currentPathIndex = (this.currentPathIndex + 1) % this.path.length;
            this.currentLngLat = [...this.path[this.currentPathIndex]];
            
            if (distance > remainingDistance) {
                this.moveVehicle(distance - remainingDistance);
                return;
            }
        }

        this.updateVehiclePosition();
        this.updateStatusDisplay();
    }

    getDistance(p1, p2) {
        const R = 6371000;
        const dLat = (p2[1] - p1[1]) * Math.PI / 180;
        const dLng = (p2[0] - p1[0]) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(p1[1] * Math.PI / 180) * Math.cos(p2[1] * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    updateVehiclePosition() {
        if (!this.vehicleMarker) return;

        const nextIndex = (this.currentPathIndex + 1) % this.path.length;
        const nextPoint = this.path[nextIndex];
        
        const angle = Math.atan2(
            nextPoint[1] - this.currentLngLat[1],
            nextPoint[0] - this.currentLngLat[0]
        ) * 180 / Math.PI;

        this.vehicleMarker.setPosition([this.currentLngLat[0], this.currentLngLat[1]]);
        this.vehicleMarker.setAngle(90 - angle);
    }

    updateStatusDisplay() {
        const currentSpeedEl = document.getElementById('currentSpeed');
        const distanceEl = document.getElementById('distance');
        const travelTimeEl = document.getElementById('travelTime');
        const statusEl = document.getElementById('status');

        if (currentSpeedEl) {
            currentSpeedEl.textContent = this.isRunning && !this.isPaused ? `${this.speed} km/h` : '0 km/h';
        }
        if (distanceEl) {
            distanceEl.textContent = `${this.distance.toFixed(2)} km`;
        }
        if (travelTimeEl) {
            travelTimeEl.textContent = this.formatTime(this.elapsedTime);
        }
        
        if (statusEl) {
            if (this.isRunning && !this.isPaused) {
                statusEl.textContent = '行驶中';
                statusEl.className = 'status-value status-running';
            } else if (this.isPaused) {
                statusEl.textContent = '已暂停';
                statusEl.className = 'status-value status-paused';
            } else {
                statusEl.textContent = '已停止';
                statusEl.className = 'status-value status-stopped';
            }
        }
    }

    updateLocationDisplay() {
        const longitudeEl = document.getElementById('longitude');
        const latitudeEl = document.getElementById('latitude');
        
        if (this.currentLngLat) {
            if (longitudeEl) {
                longitudeEl.textContent = this.currentLngLat[0].toFixed(6);
            }
            if (latitudeEl) {
                latitudeEl.textContent = this.currentLngLat[1].toFixed(6);
            }
        }
    }

    showVehicleInfo() {
        this.updateLocationDisplay();
        
        if (!this.geocoder || !this.currentLngLat) return;

        this.geocoder.getAddress(this.currentLngLat, (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
                const address = result.regeocode.formattedAddress;
                const addressEl = document.getElementById('address');
                if (addressEl) {
                    addressEl.textContent = address;
                }
                
                const infoWindow = new AMap.InfoWindow({
                    content: `
                        <div style="padding: 10px; min-width: 200px;">
                            <h4 style="margin: 0 0 10px 0; color: #667eea;">🚗 车辆位置信息</h4>
                            <p style="margin: 5px 0; font-size: 13px;"><strong>经度：</strong>${this.currentLngLat[0].toFixed(6)}</p>
                            <p style="margin: 5px 0; font-size: 13px;"><strong>纬度：</strong>${this.currentLngLat[1].toFixed(6)}</p>
                            <p style="margin: 5px 0; font-size: 13px;"><strong>地址：</strong>${address}</p>
                            <p style="margin: 5px 0; font-size: 13px;"><strong>速度：</strong>${this.isRunning && !this.isPaused ? this.speed : 0} km/h</p>
                            <p style="margin: 5px 0; font-size: 13px;"><strong>已行驶：</strong>${this.distance.toFixed(2)} km</p>
                        </div>
                    `,
                    offset: new AMap.Pixel(0, -40)
                });
                
                infoWindow.open(this.map, this.currentLngLat);
            }
        });
    }

    updateButtons(state) {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');

        switch (state) {
            case 'running':
                if (startBtn) startBtn.disabled = true;
                if (pauseBtn) {
                    pauseBtn.disabled = false;
                    pauseBtn.textContent = '⏸ 暂停';
                }
                if (stopBtn) stopBtn.disabled = false;
                break;
            case 'paused':
                if (startBtn) startBtn.disabled = true;
                if (pauseBtn) {
                    pauseBtn.disabled = false;
                    pauseBtn.textContent = '▶ 继续';
                }
                if (stopBtn) stopBtn.disabled = false;
                break;
            case 'stopped':
                if (startBtn) startBtn.disabled = false;
                if (pauseBtn) {
                    pauseBtn.disabled = true;
                    pauseBtn.textContent = '⏸ 暂停';
                }
                if (stopBtn) stopBtn.disabled = true;
                break;
        }
    }

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成');
    if (typeof AMap !== 'undefined') {
        const simulator = new VehicleSimulator();
        simulator.init();
    } else {
        console.error('高德地图API未加载');
        const checkAMap = setInterval(() => {
            if (typeof AMap !== 'undefined') {
                clearInterval(checkAMap);
                const simulator = new VehicleSimulator();
                simulator.init();
            }
        }, 100);

        setTimeout(() => {
            clearInterval(checkAMap);
            alert('高德地图API加载超时，请检查网络连接');
        }, 10000);
    }
});
