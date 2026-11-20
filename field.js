(function () {
  var canvas = document.getElementById("field");
  if (!canvas) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  var cells = [];
  var edges = [];
  var width = 0;
  var height = 0;
  var raf = 0;

  function mulberry32(seed) {
    var a = seed;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function levelAt(depth, seconds) {
    if (reduce) return 0.55;
    var cycle = 17;
    var local = seconds % cycle;
    var front = (local / cycle) * 1.35 - 0.12;
    var behind = front - depth;
    if (behind < -0.04) return 0.08;
    var peak = Math.exp(-(behind * behind) / 0.01);
    var held = behind < 0.55 ? 0.42 : Math.max(0, 0.42 - (behind - 0.55) * 0.7);
    return Math.min(1, 0.08 + peak * 0.95 + held);
  }

  function place() {
    var rect = canvas.parentElement.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var gap = Math.max(56, Math.min(width, height) / 3.2);
    var cols = Math.ceil(width / gap) + 3;
    var rows = Math.ceil(height / gap) + 3;
    var rand = mulberry32(5);
    var next = [];
    var row;
    var col;
    for (row = 0; row < rows; row += 1) {
      for (col = 0; col < cols; col += 1) {
        next.push({
          x: (col - 1) * gap + (rand() - 0.5) * gap * 0.72,
          y: (row - 1) * gap + (rand() - 0.5) * gap * 0.72,
          depth: 0
        });
      }
    }
    next.forEach(function (cell) {
      cell.depth = Math.min(1, Math.max(0, cell.x / width));
    });
    cells = next;

    var reach = gap * 1.45;
    var reachSq = reach * reach;
    var links = [];
    var i;
    var j;
    for (i = 0; i < cells.length; i += 1) {
      var kept = 0;
      for (j = i + 1; j < cells.length && kept < 3; j += 1) {
        var dx = cells[i].x - cells[j].x;
        if (dx > reach || dx < -reach) continue;
        var dy = cells[i].y - cells[j].y;
        if (dx * dx + dy * dy <= reachSq) {
          links.push([i, j]);
          kept += 1;
        }
      }
    }
    edges = links;
  }

  function draw(time) {
    var seconds = time / 1000;
    var levels = cells.map(function (cell) {
      return levelAt(cell.depth, seconds);
    });
    ctx.clearRect(0, 0, width, height);
    edges.forEach(function (pair) {
      var lit = (levels[pair[0]] + levels[pair[1]]) / 2;
      ctx.beginPath();
      ctx.moveTo(cells[pair[0]].x, cells[pair[0]].y);
      ctx.lineTo(cells[pair[1]].x, cells[pair[1]].y);
      ctx.strokeStyle = "rgba(122, 52, 32, " + (0.08 + lit * 0.55) + ")";
      ctx.lineWidth = 1 + lit * 1.3;
      ctx.stroke();
    });
    cells.forEach(function (cell, index) {
      var lit = levels[index];
      var radius = 2.1 + lit * 4.2;
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, radius * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(122, 52, 32, " + (lit * 0.18) + ")";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(28, 25, 21, " + (0.28 + lit * 0.72) + ")";
      ctx.fill();
    });
  }

  function loop(time) {
    draw(time);
    raf = requestAnimationFrame(loop);
  }

  place();
  if (reduce) draw(0);
  else raf = requestAnimationFrame(loop);

  window.addEventListener("resize", function () {
    place();
    if (reduce) draw(0);
  });
})();
