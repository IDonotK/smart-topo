const requireComponent = require.context('../assets/png', false, /\.png$/);

const icons = {};
function capitalizeFirstLetter(str) {
  return str.toUpperCase();
}
function validateFileName(str) {
  return /^\S+\.png$/.test(str) && str.replace(/^\S+\/(\w+)\.png$/, (rs, $1) => capitalizeFirstLetter($1));
}
requireComponent.keys().forEach(filePath => {
  const componentConfig = requireComponent(filePath);
  const fileName = validateFileName(filePath);
  icons[fileName] = componentConfig;
});

const Hexagon = (side, r, cx, cy) => {
  let path = '';
  for (let i = 0; i < side; i += 1) {
    let x = Math.cos(((2 / side) * i + 1 / side) * Math.PI) * r + cx;
    let y = -Math.sin(((2 / side) * i + 1 / side) * Math.PI) * r + cy;
    path += i ? `L${x},${y} ` : `M${x},${y} `;
    if (i === side - 1) {
      path += 'Z';
    }
  }
  return path;
};

export default (graph, data, shapeOption) => {
  const tool = graph.append('g').attr('class', 'topo-tool');
  const side = shapeOption.side;
  for (let i = 0; i < data.length; i += 1) {
    let x = Math.cos((2 / side) * i * Math.PI + shapeOption.fixAngle) * shapeOption.centerRadius;
    let y = -Math.sin((2 / side) * i * Math.PI + shapeOption.fixAngle) * shapeOption.centerRadius;
    const tool_g = tool
      .append('g')
      .attr('class', 'topo-tool-i')
      .on('click', data[i].click);
    tool_g
      .append('path')
      .attr('class', 'tool-hexagon')
      .attr('d', Hexagon(6, shapeOption.hexagonRadius, x, y));
    tool_g
      .append('svg:image')
      .attr('width', shapeOption.iconSize)
      .attr('height', shapeOption.iconSize)
      .attr('x', x - shapeOption.iconSize / 2)
      .attr('y', y - shapeOption.iconSize / 2)
      .attr('style', 'opacity: 0.8')
      .attr('xlink:href', icons[data[i].icon]);
  }
  return tool;
};
