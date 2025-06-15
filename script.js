document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('heartCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas to full window size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const heartSize = Math.min(canvas.width, canvas.height) * 0.4;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.t = Math.random() * Math.PI * 2;
            this.speed = 0.003 + Math.random() * 0.007;

            this.life = 0;
            this.maxLife = 100 + Math.random() * 150;
            this.lineWidth = 0.5 + Math.random() * 2;
            this.opacity = 0.2 + Math.random() * 0.5;
            this.hue = 350 + Math.random() * 20;
            this.trail = [];
            this.trailLength = 20 + Math.random() * 30;
            this.x = 0;
            this.y = 0;
            this.offsetX = (Math.random() - 0.5) * 20;
            this.offsetY = (Math.random() - 0.5) * 20;
            this.wiggle = Math.random() * 2;
            this.wiggleSpeed = 0.01 + Math.random() * 0.03;
            this.wiggleOffset = Math.random() * Math.PI * 2;
        }

        heartPosition(t) {
            const scale = heartSize;
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            const wiggleX = Math.sin(this.wiggleOffset + this.life * this.wiggleSpeed) * this.wiggle;
            const wiggleY = Math.cos(this.wiggleOffset + this.life * this.wiggleSpeed) * this.wiggle;
            return {
                x: x * scale / 16 + this.offsetX + wiggleX,
                y: -y * scale / 16 + this.offsetY + wiggleY
            };
        }

        update() {
            this.life++;
            if (this.life > this.maxLife) {
                this.reset();
                return;
            }
            this.t += this.speed;
            const pos = this.heartPosition(this.t);
            this.x = centerX + pos.x;
            this.y = centerY + pos.y;
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }
        }

        draw() {
            if (this.trail.length < 2) return;

            const lifeRatio = this.life / this.maxLife;
            const fadeInOut = lifeRatio < 0.1 ? lifeRatio * 10 :
                lifeRatio > 0.9 ? (1 - lifeRatio) * 10 : 1;

            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length - 1; i++) {
                const xc = (this.trail[i].x + this.trail[i + 1].x) / 2;
                const yc = (this.trail[i].y + this.trail[i + 1].y) / 2;
                ctx.quadraticCurveTo(this.trail[i].x, this.trail[i].y, xc, yc);
            }

            const last = this.trail.length - 1;
            ctx.quadraticCurveTo(
                this.trail[last].x,
                this.trail[last].y,
                this.trail[last].x,
                this.trail[last].y
            );

            const gradient = ctx.createLinearGradient(
                this.trail[0].x, this.trail[0].y,
                this.trail[last].x, this.trail[last].y
            );
            gradient.addColorStop(0, `hsla(${this.hue}, 100%, 50%, 0)`);
            gradient.addColorStop(0.5, `hsla(${this.hue}, 100%, 60%, ${this.opacity * fadeInOut})`);
            gradient.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.lineWidth * 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${0.3 * fadeInOut})`;
            ctx.fill();
        }
    }

    const particles = [];
    const particleCount = 10;

    for (let i = 0; i < particleCount; i++) {
        const p = new Particle();
        p.life = Math.floor(Math.random() * p.maxLife);
        particles.push(p);
    }

    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        ctx.globalCompositeOperation = 'source-over';

        const glow = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, heartSize * 0.6
        );
        glow.addColorStop(0, 'rgba(255, 0, 50, 0.3)');
        glow.addColorStop(0.6, 'rgba(255, 0, 50, 0.1)');
        glow.addColorStop(1, 'rgba(255, 0, 50, 0)');
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const time = Date.now() * 0.001;
        const pulse = Math.sin(time) * 0.1 + 0.9;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(pulse, pulse);
        ctx.translate(-centerX, -centerY);

        ctx.beginPath();
        for (let t = 0; t < Math.PI * 2; t += 0.01) {
            const scale = heartSize * 1.05;
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            const px = centerX + x * scale / 16;
            const py = centerY - y * scale / 16;
            t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255, 0, 030, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        requestAnimationFrame(animate);
    }

    animate();

    // 🎈 Balloon Spawner
    function createBalloon() {
        const balloon = document.createElement("div");
        balloon.className = "balloon";
        const left = Math.random() * 100;
        balloon.style.left = `${left}%`;
        balloon.style.bottom = "-50px";
        balloon.style.animationDuration = `${5 + Math.random() * 4}s`;
        document.getElementById("balloonContainer").appendChild(balloon);
        setTimeout(() => balloon.remove(), 10000);
    }

    setInterval(createBalloon, 300);
});
