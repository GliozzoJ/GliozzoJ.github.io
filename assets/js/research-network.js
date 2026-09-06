(function () {
  "use strict";

  var network = document.querySelector("[data-research-network]");
  if (!network) return;

  var svg = network.querySelector("svg");
  var namespace = "http://www.w3.org/2000/svg";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var width = 0;
  var height = 0;
  var pointer = null;
  var frame = null;

  var points = [
    [.04, .18], [.17, .08], [.31, .16], [.46, .07], [.63, .15], [.79, .06], [.95, .19],
    [.09, .42], [.24, .34], [.39, .43], [.55, .31], [.71, .39], [.88, .34],
    [.02, .68], [.18, .62], [.33, .73], [.49, .59], [.65, .70], [.82, .62], [.98, .73],
    [.10, .91], [.27, .87], [.43, .96], [.59, .87], [.76, .94], [.91, .86]
  ].map(function (position, index) {
    return {
      x: 0, y: 0, homeX: position[0], homeY: position[1], vx: 0, vy: 0,
      radius: index % 7 === 0 ? 5 : (index % 3 === 0 ? 3.5 : 2.5)
    };
  });

  var connections = [
    [0, 1], [0, 7], [1, 2], [1, 8], [2, 3], [2, 8], [2, 9], [3, 4], [3, 10],
    [4, 5], [4, 10], [4, 11], [5, 6], [5, 12], [6, 12], [7, 8], [7, 13],
    [8, 9], [8, 14], [9, 10], [9, 15], [9, 16], [10, 11], [10, 16], [11, 12],
    [11, 17], [11, 18], [12, 19], [13, 14], [13, 20], [14, 15], [14, 20], [14, 21],
    [15, 16], [15, 21], [15, 22], [16, 17], [16, 23], [17, 18], [17, 23], [17, 24],
    [18, 19], [18, 24], [18, 25], [20, 21], [21, 22], [22, 23], [23, 24], [24, 25]
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
    });
    points.forEach(function (point) {
      point.circle.setAttribute("cx", point.x);
      point.circle.setAttribute("cy", point.y);
    });
  }

  function animate() {
    var moving = false;
    points.forEach(function (point) {
      var homeX = point.homeX * width;
      var homeY = point.homeY * height;
      point.vx += (homeX - point.x) * .035;
      point.vy += (homeY - point.y) * .035;

      if (pointer) {
        var dx = point.x - pointer.x;
        var dy = point.y - pointer.y;
        var distance = Math.sqrt(dx * dx + dy * dy) || 1;
        var reach = Math.min(150, width * .22);
        if (distance < reach) {
          var force = (reach - distance) / reach * 2.8;
          point.vx += dx / distance * force;
          point.vy += dy / distance * force;
        }
      }

      point.vx *= .84;
      point.vy *= .84;
      point.x += point.vx;
      point.y += point.vy;
      moving = moving || Math.abs(point.vx) > .02 || Math.abs(point.vy) > .02;
    });
    draw();
    frame = (pointer || moving) ? window.requestAnimationFrame(animate) : null;
  }

  function startAnimation() {
    if (!reducedMotion && !frame) frame = window.requestAnimationFrame(animate);
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
    startAnimation();
  });
  network.parentElement.addEventListener("pointerleave", function () {
    pointer = null;
    startAnimation();
  });

  resize();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(network);
  else window.addEventListener("resize", resize);
}());
