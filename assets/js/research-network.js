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
    var count = Math.max(38, Math.min(85, Math.round(width * height / 17000)));
    points = [];
    nodesLayer.replaceChildren();

    for (var index = 0; index < count; index += 1) {
      var circle = makeSvgElement("circle", "research-network__node");
      var point = {
        homeX: random() * width,
        homeY: random() * height,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
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
        if (distance < linkDistance) {
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
      point.vx += (point.homeX - point.x) * .018;
      point.vy += (point.homeY - point.y) * .018;

      if (pointer) {
        var dx = point.x - pointer.x;
        var dy = point.y - pointer.y;
        var distance = Math.sqrt(dx * dx + dy * dy) || 1;
        var reach = 135;
        if (distance < reach) {
          var force = (reach - distance) / reach * 3.6;
          point.vx += dx / distance * force;
          point.vy += dy / distance * force;
        }
      }

      point.vx *= .88;
      point.vy *= .88;
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
