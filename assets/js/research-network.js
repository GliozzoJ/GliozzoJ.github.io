(function () {
  "use strict";

  var network = document.querySelector("[data-research-network]");
  if (!network) return;

  var svg = network.querySelector("svg");
  var namespace = "http://www.w3.org/2000/svg";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pointer = null;
  var width = 0;
  var height = 0;
  var points = [];
  var frame = null;
  var seed = 7319;

  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  function makeSvgElement(name, className) {
    var element = document.createElementNS(namespace, name);
    element.setAttribute("class", className);
    return element;
  }

  var linksLayer = makeSvgElement("g", "research-network__links");
  var nodesLayer = makeSvgElement("g", "research-network__nodes");
  svg.appendChild(linksLayer);
  svg.appendChild(nodesLayer);

  function createPoints() {
    var count = Math.max(76, Math.min(150, Math.round(width * height / 9000)));
    var clusterCount = width < 600 ? 7 : 11;
    var clusterCenters = [];
    points = [];
    nodesLayer.replaceChildren();

    for (var clusterIndex = 0; clusterIndex < clusterCount; clusterIndex += 1) {
      clusterCenters.push({
        x: (.08 + random() * .84) * width,
        y: (.06 + random() * .88) * height
      });
    }

    for (var index = 0; index < count; index += 1) {
      var circle = makeSvgElement("circle", "research-network__node");
      var cluster = index % clusterCount;
      var center = clusterCenters[cluster];
      var angle = random() * Math.PI * 2;
      var spread = 25 + Math.sqrt(random()) * Math.min(115, width / 8);
      var point = {
        homeX: Math.max(4, Math.min(width - 4, center.x + Math.cos(angle) * spread)),
        homeY: Math.max(4, Math.min(height - 4, center.y + Math.sin(angle) * spread)),
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        cluster: cluster,
        radius: 1.7 + random() * 2.8,
        circle: circle
      };
      point.x = point.homeX;
      point.y = point.homeY;
      circle.setAttribute("r", point.radius);
      nodesLayer.appendChild(circle);
      points.push(point);
    }
  }

  function draw() {
    var linkDistance = Math.max(105, Math.min(155, width / 8));
    var fragment = document.createDocumentFragment();
    linksLayer.replaceChildren();

    points.forEach(function (point, index) {
      point.circle.setAttribute("cx", point.x);
      point.circle.setAttribute("cy", point.y);

      for (var otherIndex = index + 1; otherIndex < points.length; otherIndex += 1) {
        var other = points[otherIndex];
        var dx = point.x - other.x;
        var dy = point.y - other.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (point.cluster === other.cluster && distance < linkDistance) {
          var line = makeSvgElement("line", "research-network__link");
          line.setAttribute("x1", point.x);
          line.setAttribute("y1", point.y);
          line.setAttribute("x2", other.x);
          line.setAttribute("y2", other.y);
          line.style.opacity = 1 - distance / linkDistance;
          fragment.appendChild(line);
        }
      }
    });
    linksLayer.appendChild(fragment);
  }

  function animate() {
    var moving = false;
    points.forEach(function (point) {
      point.vx += (point.homeX - point.x) * .006;
      point.vy += (point.homeY - point.y) * .006;

      if (pointer) {
        var dx = point.x - pointer.x;
        var dy = point.y - pointer.y;
        var distance = Math.sqrt(dx * dx + dy * dy) || 1;
        var reach = 175;
        if (distance < reach) {
          var force = (reach - distance) / reach * 7;
          point.vx += dx / distance * force;
          point.vy += dy / distance * force;
        }
      }

      point.vx *= .91;
      point.vy *= .91;
      point.x += point.vx;
      point.y += point.vy;
      moving = moving || Math.abs(point.vx) > .025 || Math.abs(point.vy) > .025;
    });

    draw();
    frame = pointer || moving ? window.requestAnimationFrame(animate) : null;
  }

  function startAnimation() {
    if (!reducedMotion && !frame) frame = window.requestAnimationFrame(animate);
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    seed = 7319;
    createPoints();
    draw();
  }

  document.addEventListener("pointermove", function (event) {
    pointer = { x: event.clientX, y: event.clientY };
    startAnimation();
  });
  document.addEventListener("pointerleave", function () {
    pointer = null;
    startAnimation();
  });

  resize();
  window.addEventListener("resize", resize);
}());
