(function () {
  "use strict";

  var container = document.querySelector("[data-research-network]");
  if (!container) return;

  var svg = container.querySelector("svg");
  var namespace = "http://www.w3.org/2000/svg";
  var nodes = [
    { id: "research", label: "My research", x: 0.50, y: 0.49, radius: 52, primary: true },
    { id: "bioinformatics", label: "Bioinformatics", x: 0.23, y: 0.25, radius: 48, href: "/about/" },
    { id: "machine-learning", label: "Machine learning", x: 0.76, y: 0.22, radius: 53, href: "/publications/" },
    { id: "data-science", label: "Data science", x: 0.83, y: 0.64, radius: 44, href: "/publications/" },
    { id: "software", label: "Software", x: 0.56, y: 0.82, radius: 40, href: "/software/" },
    { id: "teaching", label: "Teaching", x: 0.18, y: 0.72, radius: 39, href: "/teaching/" },
    { id: "precision-medicine", label: "Precision medicine", x: 0.47, y: 0.16, radius: 49, href: "/publications/" }
  ];
  var edges = [
    ["research", "bioinformatics"], ["research", "machine-learning"],
    ["research", "data-science"], ["research", "software"],
    ["research", "teaching"], ["research", "precision-medicine"],
    ["bioinformatics", "precision-medicine"], ["bioinformatics", "teaching"],
    ["machine-learning", "precision-medicine"], ["machine-learning", "data-science"],
    ["data-science", "software"]
  ];
  var nodeById = {};
  var width = 0;
  var height = 0;
  var draggedNode = null;
  var hasMoved = false;

  function element(name, attributes) {
    var item = document.createElementNS(namespace, name);
    Object.keys(attributes || {}).forEach(function (key) {
      item.setAttribute(key, attributes[key]);
    });
    return item;
  }

  var title = element("title", { id: "network-svg-title" });
  title.textContent = "Interactive map of Jessica Gliozzo's research";
  var description = element("desc", { id: "network-svg-description" });
  description.textContent = "A draggable network connecting bioinformatics, machine learning, data science, software, teaching, and precision medicine. Linked nodes open related pages.";
  svg.appendChild(title);
  svg.appendChild(description);

  var linksLayer = element("g", { "aria-hidden": "true" });
  var nodesLayer = element("g", {});
  svg.appendChild(linksLayer);
  svg.appendChild(nodesLayer);

  nodes.forEach(function (node) {
    nodeById[node.id] = node;
    node.lines = [];
  });

  edges.forEach(function (edge) {
    var line = element("line", { "class": "research-network__link" });
    linksLayer.appendChild(line);
    nodeById[edge[0]].lines.push({ line: line, end: "start", other: nodeById[edge[1]] });
    nodeById[edge[1]].lines.push({ line: line, end: "end", other: nodeById[edge[0]] });
  });

  nodes.forEach(function (node) {
    var group = element(node.href ? "a" : "g", {
      "class": "research-network__node" + (node.primary ? " research-network__node--primary" : ""),
      "aria-label": node.href ? node.label + ": open related page" : node.label,
      "role": node.href ? "link" : "img",
      "tabindex": "0"
    });
    if (node.href) group.setAttribute("href", node.href);
    group.appendChild(element("circle", { r: node.radius }));
    var words = node.label.split(" ");
    var text = element("text", {});
    if (words.length > 1) {
      var midpoint = Math.ceil(words.length / 2);
      [words.slice(0, midpoint), words.slice(midpoint)].forEach(function (line, index) {
        var tspan = element("tspan", { x: "0", dy: index ? "1.15em" : "-.1em" });
        tspan.textContent = line.join(" ");
        text.appendChild(tspan);
      });
    } else {
      text.setAttribute("dy", ".35em");
      text.textContent = node.label;
    }
    group.appendChild(text);
    nodesLayer.appendChild(group);
    node.group = group;

    group.addEventListener("pointerdown", function (event) {
      draggedNode = node;
      hasMoved = false;
      group.classList.add("is-dragging");
      group.setPointerCapture(event.pointerId);
    });
    group.addEventListener("pointermove", function (event) {
      if (draggedNode !== node) return;
      var point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      var local = point.matrixTransform(svg.getScreenCTM().inverse());
      var nextX = Math.max(node.radius + 4, Math.min(width - node.radius - 4, local.x));
      var nextY = Math.max(node.radius + 4, Math.min(height - node.radius - 4, local.y));
      hasMoved = hasMoved || Math.abs(nextX - node.px) > 3 || Math.abs(nextY - node.py) > 3;
      node.px = nextX;
      node.py = nextY;
      drawNode(node);
    });
    group.addEventListener("pointerup", finishDrag);
    group.addEventListener("pointercancel", finishDrag);
    group.addEventListener("click", function (event) {
      if (hasMoved) event.preventDefault();
    });
  });

  function finishDrag() {
    if (!draggedNode) return;
    draggedNode.x = draggedNode.px / width;
    draggedNode.y = draggedNode.py / height;
    draggedNode.group.classList.remove("is-dragging");
    draggedNode = null;
  }

  function drawNode(node) {
    node.group.setAttribute("transform", "translate(" + node.px + " " + node.py + ")");
    node.lines.forEach(function (connection) {
      connection.line.setAttribute(connection.end === "start" ? "x1" : "x2", node.px);
      connection.line.setAttribute(connection.end === "start" ? "y1" : "y2", node.py);
      connection.line.setAttribute(connection.end === "start" ? "x2" : "x1", connection.other.px);
      connection.line.setAttribute(connection.end === "start" ? "y2" : "y1", connection.other.py);
    });
  }

  function resize() {
    var bounds = container.getBoundingClientRect();
    width = Math.round(bounds.width);
    height = Math.round(parseFloat(window.getComputedStyle(svg).height));
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    nodes.forEach(function (node) {
      node.px = node.x * width;
      node.py = node.y * height;
    });
    nodes.forEach(drawNode);
  }

  resize();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(container);
  else window.addEventListener("resize", resize);
}());
