import icons from './icons';

icons['KAFKA-CONSUMER'] = icons.KAFKA;

export const nodeElement = (d3, graph, tool, funcs, tip) => {
  const nodeEnter = graph
    .append('g')
    .call(
      d3
        .drag()
        .on('start', funcs.dragstart)
        .on('drag', funcs.dragged)
        .on('end', funcs.dragended),
    )
    .on('mouseover', function(d) {
      tip.html((data) => `<div>${data.name}</div>`).show(d, this);
    })
    .on('mouseout', function() {
      tip.hide(this);
    })
    .on('click', (d) => {
      event.stopPropagation();
      event.preventDefault();
      tool.attr('style', 'display: none');
      funcs.handleNodeClick(d);
      tool.attr('transform', `translate(${d.x},${d.y - 20})`).attr('style', 'display: block');
    });
  nodeEnter
    .append('image')
    .attr('width', 18)
    .attr('height', 18)
    .attr('x', -9)
    .attr('y', -9)
    .attr('xlink:href', (d) =>
      !d.type || d.type === 'N/A' ? icons.UNDEFINED : icons[d.type.toUpperCase().replace('-', '')],
    );
  nodeEnter
    .append('text')
    .attr('class', 'topo-text')
    .attr('text-anchor', 'middle')
    .attr('x', 0)
    .attr('y', 18)
    .text((d) => (d.name.length > 20 ? `${d.name.substring(0, 20)}...` : d.name));
  return nodeEnter;
};

export const linkElement = (graph) => {
  const linkEnter = graph
    .append('path')
    .attr('class', 'topo-line')
    .attr('stroke', (d) => '#217EF25f');
  return linkEnter;
};

export const anchorElement = (graph, funcs, tip) => {
  const linkEnter = graph
    .append('circle')
    .attr('class', 'topo-line-anchor')
    .attr('r', 5)
    .attr('fill', (d) => '#217EF25f')
    .on('mouseover', function(d) {
      tip.html(funcs.$tip).show(d, this);
    })
    .on('mouseout', function() {
      tip.hide(this);
    })
    .on('click', (d) => {
      funcs.handleLinkClick(d);
    });
  return linkEnter;
};
