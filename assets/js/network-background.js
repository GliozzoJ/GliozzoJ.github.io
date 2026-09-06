(function () {
    'use strict';

    var canvas = document.querySelector('[data-network-background]');
    if (!canvas || !canvas.getContext) return;

    var context = canvas.getContext('2d');
    if (!context) return;
    var nodes = [];
    var pointer = { x: -1000, y: -1000, active: false };
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var animationFrame;
    var width;
    var height;
    var pixelRatio;

    function createNode() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.28,
            vy: (Math.random() - 0.5) * 0.28,
            radius: 1.3 + Math.random() * 1.8
        };
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        var targetCount = Math.max(38, Math.min(100, Math.round((width * height) / 12000)));
        while (nodes.length < targetCount) nodes.push(createNode());
        if (nodes.length > targetCount) nodes.length = targetCount;
    }

    function updateNode(node) {
        if (pointer.active) {
            var dx = node.x - pointer.x;
            var dy = node.y - pointer.y;
            var distanceSquared = dx * dx + dy * dy;
            var influence = 160;

            if (distanceSquared < influence * influence && distanceSquared > 0) {
                var distance = Math.sqrt(distanceSquared);
                var force = (1 - distance / influence) * 0.85;
                node.vx += (dx / distance) * force;
                node.vy += (dy / distance) * force;
            }
        }

        node.vx *= 0.985;
        node.vy *= 0.985;
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < -10) node.x = width + 10;
        if (node.x > width + 10) node.x = -10;
        if (node.y < -10) node.y = height + 10;
        if (node.y > height + 10) node.y = -10;
    }

    function draw() {
        context.clearRect(0, 0, width, height);

        for (var i = 0; i < nodes.length; i += 1) {
            var node = nodes[i];
            if (!reduceMotion.matches) updateNode(node);

            for (var j = i + 1; j < nodes.length; j += 1) {
                var other = nodes[j];
                var dx = node.x - other.x;
                var dy = node.y - other.y;
                var distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 145) {
                    context.beginPath();
                    context.moveTo(node.x, node.y);
                    context.lineTo(other.x, other.y);
                    context.strokeStyle = 'rgba(75, 0, 130, ' + ((1 - distance / 145) * 0.24) + ')';
                    context.lineWidth = 1;
                    context.stroke();
                }
            }

            context.beginPath();
            context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            context.fillStyle = 'rgba(75, 0, 130, 0.52)';
            context.fill();
        }

        if (!reduceMotion.matches) animationFrame = window.requestAnimationFrame(draw);
    }

    function restart() {
        window.cancelAnimationFrame(animationFrame);
        draw();
    }

    window.addEventListener('resize', function () {
        resize();
        if (reduceMotion.matches) draw();
    });
    window.addEventListener('pointermove', function (event) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
    });
    document.addEventListener('mouseleave', function () {
        pointer.active = false;
    });
    resize();
    draw();

    if (reduceMotion.addEventListener) {
        reduceMotion.addEventListener('change', restart);
    } else if (reduceMotion.addListener) {
        reduceMotion.addListener(restart);
    }
}());
