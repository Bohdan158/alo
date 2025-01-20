const width = 800;
const height = 600;
const antCount = 20;
const iterations = 100;
const alpha = 1;
const beta = 2;
const rho = 0.5;
const Q = 100;

let svg, cities, pheromones;

function generateCities(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
  }));
}

function drawCities(cities) {
  svg.selectAll("circle").remove();
  svg.selectAll("line").remove();

  svg.selectAll("circle")
    .data(cities)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 5)
    .style("fill", "blue");
}

function distance(city1, city2) {
  return Math.sqrt((city1.x - city2.x) ** 2 + (city1.y - city2.y) ** 2);
}

function initializePheromones(cities) {
  const n = cities.length;
  const pheromones = Array.from({ length: n }, () => Array(n).fill(1));
  return pheromones;
}

function antColonyOptimization(cities, pheromones) {
  const n = cities.length;
  let bestRoute = [];
  let bestLength = Infinity;

  for (let iter = 0; iter < iterations; iter++) {
    let allRoutes = [];
    let allLengths = [];

    for (let ant = 0; ant < antCount; ant++) {
      let visited = [];
      let currentCity = Math.floor(Math.random() * n);
      visited.push(currentCity);

      while (visited.length < n) {
        const probabilities = [];
        const current = visited[visited.length - 1];

        for (let nextCity = 0; nextCity < n; nextCity++) {
          if (!visited.includes(nextCity)) {
            const tau = pheromones[current][nextCity] ** alpha;
            const eta = (1 / distance(cities[current], cities[nextCity])) ** beta;
            probabilities.push({ city: nextCity, prob: tau * eta });
          }
        }

        const total = probabilities.reduce((sum, p) => sum + p.prob, 0);
        probabilities.forEach(p => (p.prob /= total));

        let selected = probabilities[Math.floor(Math.random() * probabilities.length)];
        visited.push(selected.city);
      }

      const routeLength = visited.reduce((sum, city, i) => {
        if (i < visited.length - 1) {
          return sum + distance(cities[city], cities[visited[i + 1]]);
        }
        return sum + distance(cities[city], cities[visited[0]]);
      }, 0);

      allRoutes.push(visited);
      allLengths.push(routeLength);
    }

    const minLength = Math.min(...allLengths);
    if (minLength < bestLength) {
      bestLength = minLength;
      bestRoute = allRoutes[allLengths.indexOf(minLength)];
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        pheromones[i][j] *= (1 - rho);
      }
    }

    allRoutes.forEach((route, idx) => {
      const length = allLengths[idx];
      for (let i = 0; i < route.length - 1; i++) {
        const from = route[i];
        const to = route[i + 1];
        pheromones[from][to] += Q / length;
        pheromones[to][from] += Q / length;
      }
    });
  }

  return { bestRoute, bestLength };
}

function drawRoute(route, cities) {
  svg.selectAll("line").remove();

  for (let i = 0; i < route.length; i++) {
    const from = route[i];
    const to = route[(i + 1) % route.length];

    svg.append("line")
      .attr("x1", cities[from].x)
      .attr("y1", cities[from].y)
      .attr("x2", cities[to].x)
      .attr("y2", cities[to].y)
      .style("stroke", "red")
      .style("stroke-width", 2);
  }
}

document.getElementById("start").addEventListener("click", () => {
  const cityCount = parseInt(document.getElementById("cities").value, 10);
  cities = generateCities(cityCount);
  pheromones = initializePheromones(cities);

  drawCities(cities);

  const result = antColonyOptimization(cities, pheromones);
  drawRoute(result.bestRoute, cities);

  console.log("Best route:", result.bestRoute);
  console.log("Best length:", result.bestLength);
});

svg = d3.select("#visualization")
  .append("svg")
  .attr("width", width)
  .attr("height", height);
