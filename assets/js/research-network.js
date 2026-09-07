(function () {
  "use strict";

  var namespace = "http://www.w3.org/2000/svg";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-research-network]").forEach(function (network) {
    var svg = network.querySelector("svg");
    var width = 0;
    var height = 0;
    var pointer = null;

    // Five independent communities with deliberately different sizes and densities.
    var points = [
      [.06, .15], [.17, .10], [.10, .29], [.23, .24],
      [.30, .47], [.38, .38], [.47, .47], [.36, .59], [.48, .60], [.54, .40],
      [.59, .15], [.68, .07], [.77, .16], [.66, .28], [.77, .29], [.84, .09], [.84, .38], [.57, .36],
      [.75, .65], [.86, .57], [.95, .67], [.82, .78], [.98, .81],
      [.08, .79], [.19, .70], [.30, .80], [.18, .92], [.32, .95], [.43, .86], [.42, .73]
    ].map(function (position, index) {
      return {
        x: 0, y: 0, homeX: position[0], homeY: position[1], vx: 0, vy: 0,
        cluster: index < 4 ? 0 : (index < 10 ? 1 : (index < 18 ? 2 : (index < 23 ? 3 : 4))),
        phase: index * 1.73,
        radius: index % 7 === 0 ? 6 : (index % 3 === 0 ? 4.5 : 3.25)
      };
    });

    var connections = [
      [0, 1], [0, 2], [1, 3], [2, 3],
      [4, 5], [4, 7], [5, 6], [5, 9], [6, 8], [7, 8], [8, 9],
      [10, 11], [10, 13], [11, 12], [11, 15], [12, 14], [13, 14], [13, 17], [14, 16], [15, 16], [16, 17], [12, 16],
      [18, 19], [18, 21], [19, 20], [20, 22], [21, 22],
      [23, 24], [23, 26], [24, 25], [24, 29], [25, 28], [26, 27], [27, 28], [28, 29]
    ];

    var lines = connections.map(function () {
      var line = document.createElementNS(namespace, "line");
      line.setAttribute("class", "research-network__link");
      svg.appendChild(line);
      return line;
    });

    points.forEach(function (point) {
      var circle = document.createElementNS(namespace, "circle");
      circle.setAttribute("class", "research-network__node");
      circle.setAttribute("r", point.radius);
      svg.appendChild(circle);
      point.circle = circle;
    });

    function draw() {
      connections.forEach(function (connection, index) {
        var start = points[connection[0]];
        var end = points[connection[1]];
        lines[index].setAttribute("x1", start.x);
        lines[index].setAttribute("y1", start.y);
        lines[index].setAttribute("x2", end.x);
        lines[index].setAttribute("y2", end.y);
        lines[index].setAttribute("opacity", pointer && distanceToSegment(pointer, start, end) < 48 ? "0" : "1");
      });
      points.forEach(function (point) {
        point.circle.setAttribute("cx", point.x);
        point.circle.setAttribute("cy", point.y);
      });
    }

    function distanceToSegment(point, start, end) {
      var x = end.x - start.x;
      var y = end.y - start.y;
      var lengthSquared = x * x + y * y || 1;
      var position = ((point.x - start.x) * x + (point.y - start.y) * y) / lengthSquared;
      position = Math.max(0, Math.min(1, position));
      var closestX = start.x + position * x;
      var closestY = start.y + position * y;
      var dx = point.x - closestX;
      var dy = point.y - closestY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function animate(timestamp) {
      points.forEach(function (point) {
        var clusterX = Math.sin(timestamp * .00042 + point.cluster * 2.1) * 24;
        var clusterY = Math.cos(timestamp * .00035 + point.cluster * 1.7) * 18;
        var targetX = point.homeX * width + clusterX + Math.sin(timestamp * .0011 + point.phase) * 9;
        var targetY = point.homeY * height + clusterY + Math.cos(timestamp * .0009 + point.phase) * 8;
        point.vx += (targetX - point.x) * .035;
        point.vy += (targetY - point.y) * .035;

        if (pointer) {
          var dx = point.x - pointer.x;
          var dy = point.y - pointer.y;
          var distance = Math.sqrt(dx * dx + dy * dy) || 1;
          var reach = Math.min(190, width * .28);
          if (distance < reach) {
            var force = (reach - distance) / reach * 5;
            point.vx += dx / distance * force;
            point.vy += dy / distance * force;
          }
        }

        point.vx *= .9;
        point.vy *= .9;
        point.x += point.vx;
        point.y += point.vy;
      });
      draw();
      if (!reducedMotion) window.requestAnimationFrame(animate);
    }

    function resize() {
      var bounds = network.getBoundingClientRect();
      width = Math.round(bounds.width);
      height = Math.round(bounds.height);
      svg.setAttribute("viewBox", "0 0 " + width + " " + height);
      points.forEach(function (point) {
        point.x = point.homeX * width;
        point.y = point.homeY * height;
        point.vx = 0;
        point.vy = 0;
      });
      draw();
    }

    network.parentElement.addEventListener("pointermove", function (event) {
      var bounds = network.getBoundingClientRect();
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    });
    network.parentElement.addEventListener("pointerleave", function () {
      pointer = null;
    });

    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(network);
    else window.addEventListener("resize", resize);
    if (!reducedMotion) window.requestAnimationFrame(animate);
  });
}());
