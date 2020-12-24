<template>
  <div class="net-content" id="netContent">
    <!-- link text -->
    <div
      v-show="linkTextVisible"
      id="linkText"
      class="linkText"
      :class="{ 'dark-linkText': isLinkTextDark }"
      :style="linkTextStyle"
      v-html="linkTextContent"
    ></div>

    <!-- topo svg -->
    <svg
      class="net-svg"
      id="netSvg"
      ref="svg"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      :width="size.w"
      :height="size.h"
    >
      <!-- zoomContainer -->
      <g id="zoomContainer">
        <!-- arrows -->
        <defs class="arrows">
          <marker
            v-for="(link, index) in links"
            :key="index"
            :id="'arrow' + link.id"
            markerUnits="userSpaceOnUse"
            :markerWidth="(1.5 * nodeSize) / 2"
            :markerHeight="(1.5 * nodeSize) / 2"
            viewBox="0 0 10 10"
            refX="16"
            refY="6"
            orient="auto"
          >
            <path
              d="M2,3 L10,6 L2,9 L5,6 L2,3"
              :style="getArrowStyle(link)"
              :class="arrowClass([link.isDark ? 'dark-arrow' : '', link.isBright ? 'bright-arrow' : ''])"
            />
          </marker>
        </defs>

        <!-- links -->
        <g class="links" id="l-links">
          <path
            v-for="(link, index) in links"
            :key="index"
            :d="linkPath(link)"
            :id="link.id"
            v-bind="linkAttrs(link)"
            :class="linkClass(link.id, [link.isDark ? 'dark-link' : '', link.isBright ? 'bright-link' : ''])"
            :style="linkStyle(link)"
            :stroke-dasharray="link.label === 'TracingTo' || link.label === 'SubTracingTo' ? '7 5' : 'none'"
            :marker-end="'url(#arrow' + link.id + ')'"
            @click.stop.prevent="emit('linkClick', [$event, link])"
            @mouseenter.stop.prevent="emit('mouseEnterLink', [$event, link])"
            @mouseleave.stop.prevent="emit('mouseLeaveLink', [$event, link])"
          />
        </g>

        <!-- nodes -->
        <g class="nodes" id="l-nodes" v-if="!noNodes">
          <template v-for="(node, key) in nodes">
            <svg
              v-if="svgIcon(node)"
              :key="key + 'svg'"
              :width="getNodeSize(node, 'width')"
              :height="getNodeSize(node, 'height')"
              :x="node.x - getNodeSize(node, 'width') / 2"
              :y="node.y - getNodeSize(node, 'height') / 2"
              :style="nodeStyle(node)"
              :class="
                nodeClass(node, [
                  'node-svg',
                  node.isDark ? 'dark-node' : '',
                  node.isBright ? 'bright-node' : '',
                  node.id === currentNode.id ? 'pinned' : '',
                ])
              "
              v-bind="node._svgAttrs"
            >
              <use v-show="!node.isBright" :xlink:href="'#' + node.svgIcon"></use>
              <use v-show="node.isBright || node.id === currentNode.id" :xlink:href="'#' + node.svgIconBright"></use>
            </svg>

            <circle
              :key="key + 'agent'"
              :r="getNodeSize(node) / 2"
              :cx="node.x"
              :cy="node.y"
              :style="nodeStyle(node)"
              :stroke-width="fontSize / 8"
              :title="node.shortName"
              :class="nodeClass(node, ['node-agent'])"
              v-bind="node._svgAttrs"
              @dblclick.stop.prevent="emit('nodeDblClick', [$event, node])"
              @mousedown.stop.prevent="emit('dragNodeStart', [$event, key, node])"
              @mouseup.stop.prevent="emit('dragNodeEnd', [$event, key, node])"
              @mouseenter.stop.prevent="emit('mouseEnterNode', [$event, node])"
              @mouseleave.stop.prevent="emit('mouseLeaveNode', [$event, node])"
            />

            <!-- warn icon -->
            <svg
              v-if="node.state === 'Abnormal'"
              :x="node.x + (0.8 * getNodeSize(node)) / 2"
              :y="node.y - 0.8 * getNodeSize(node)"
              :width="0.8 * getNodeSize(node)"
              :height="0.8 * getNodeSize(node)"
              :class="warnClass(node, [node.isDark ? 'dark-warn-icon' : '', node.isBright ? 'bright-warn-icon' : ''])"
              :key="'event' + key"
              aria-hidden="true"
            >
              <use xlink:href="#icon-tanhao"></use>
            </svg>
          </template>
        </g>

        <!-- Link Anchors -->
        <g class="anchors" id="link-anchors">
          <circle
            v-for="(link, index) in links"
            :key="index"
            :class="
              linkAnchorClass(link, [link.isDark ? 'dark-link-anchor' : '', link.isBright ? 'bright-link-anchor' : ''])
            "
            v-show="link.type === 'TracingTo' || link.type === 'SubTracingTo'"
            :r="nodeSize / 6"
            fill="#217EF25f"
            :cx="(link.source.x + link.target.x) / 2"
            :cy="(link.source.y + link.target.y) / 2"
            @mouseenter.stop.prevent="emit('mouseEnterLinkAnchor', [$event, link])"
            @mouseleave.stop.prevent="emit('mouseLeaveLinkAnchor', [$event, link])"
          ></circle>
        </g>
        <!-- Link Indicators -->
        <g class="indicators" id="link-indicators">
          <defs>
            <path v-for="(link, index) in links" :key="index" :d="linkPath(link)" :id="'link' + link.id" />
          </defs>
          <text
            v-for="(link, index) in links"
            v-show="link.label === 'TracingTo' || link.label === 'SubTracingTo'"
            :x="Math.sqrt(Math.pow(link.target.y - link.source.y, 2) + Math.pow(link.target.x - link.source.x, 2)) / 2"
            text-anchor="middle"
            :dy="-nodeSize / 6"
            :key="index"
            :font-size="fontSize / 4"
            :class="
              linkIndicatorClass(link, [
                link.isDark ? 'dark-link-indicator' : '',
                link.isBright ? 'bright-link-indicator' : '',
              ])
            "
            :stroke-width="fontSize / 8"
          >
            <textPath :xlink:href="'#link' + link.id">
              {{ link.callPerMinute + ' r/min' }}
            </textPath>
          </text>
        </g>

        <!-- Node Labels -->
        <g class="labels" id="node-labels" v-if="nodeLabels">
          <text
            v-for="(node, index) in nodes"
            v-show="node.showLabel"
            :key="index"
            :x="node.x + getNodeSize(node) / 2 + fontSize / 2"
            :y="node.y + labelOffset.y"
            :font-size="fontSize"
            :class="
              nodeLabelClass(node, [node.isDark ? 'dark-node-label' : '', node.isBright ? 'bright-node-label' : ''])
            "
            :stroke-width="fontSize / 8"
          >
            {{ node.shortName }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>
<script>
  require('../../assets/iconfont-topo/iconfont.js');
  import svgExport from '../lib/js/svgExport.js';

  export default {
    name: 'svg-renderer',
    props: [
      'size',
      'nodes',
      'noNodes',
      'selected',
      'linksSelected',
      'links',
      'nodeSize',
      'padding',
      'fontSize',
      'strLinks',
      'linkWidth',
      'nodeLabels',
      'linkLabels',
      'labelOffset',
      'nodeSym',
      'linkTextStyle',
      'isLinkTextDark',
      'linkTextVisible',
      'linkTextContent',
      'defaultNodeSize',
    ],

    data() {
      return {
        zoom: this.$d3.zoom(),
      };
    },

    mounted() {
      this.setZoom();
    },

    computed: {
      topoScaleFix() {
        return this.$store.state.rocketTopo.topoScaleFix;
      },
      currentNode() {
        return this.$store.state.rocketTopo.currentNode;
      },
      nodeSvg() {
        if (this.nodeSym) {
          return svgExport.toObject(this.nodeSym);
        }
        return null;
      },
    },

    methods: {
      arrowClass(classes = []) {
        let cssClass = [];
        classes.forEach((c) => cssClass.push(c));
        return cssClass;
      },
      getArrowStyle(link) {
        let style = {};
        if (link._color) style.fill = link._color;
        return style;
      },
      getArrowRefX(link) {
        let size = this.nodes.find((node) => node.id === link.tid)._size || this.nodeSize;
        return size / 2 + size;
      },
      setZoom() {
        const zoomed = () => {
          this.$d3
            .select('#zoomContainer')
            .attr(
              'transform',
              'translate(' +
                this.$d3.event.transform.x +
                ',' +
                this.$d3.event.transform.y +
                ') scale(' +
                this.$d3.event.transform.k +
                ')',
            );
          // this.$d3.selectAll('.node-label').attr(
          //   'transform',
          //   'scale(' + 1 / this.$d3.event.transform.k + ')' + ' translate(' + -this.$d3.event.transform.x + ',' + -this.$d3.event.transform.y + ')',
          // );
        };
        this.zoom.scaleExtent([0.1, 100]).on('zoom', zoomed);
        this.$d3
          .select('.net-svg')
          .call(this.zoom)
          .on('dblclick.zoom', null);
        this.$store.commit('rocketTopo/SET_ZOOM_CONTROLLER', this.zoom);
      },
      getNodeSize(node, side) {
        let size = node._size || this.nodeSize;
        if (side) size = node['_' + side] || size;
        return size;
      },
      svgIcon(node) {
        return node.svgIcon || this.nodeSvg;
      },
      emit(e, args) {
        this.$emit('action', e, args);
      },
      svgScreenShot(cb, toSvg, background, allCss) {
        let svg = svgExport.export(this.$refs.svg, allCss);
        if (!toSvg) {
          if (!background) background = this.searchBackground();
          let canvas = svgExport.makeCanvas(this.size.w, this.size.h, background);
          svgExport.svgToImg(svg, canvas, (err, img) => {
            if (err) cb(err);
            else cb(null, img);
          });
        } else {
          cb(null, svgExport.save(svg));
        }
      },
      linkClass(linkId, classes = []) {
        let cssClass = ['link'];
        classes.forEach((c) => cssClass.push(c));
        if (this.linksSelected.hasOwnProperty(linkId)) {
          cssClass.push('selected');
        }
        if (!this.strLinks) {
          cssClass.push('curve');
        }
        return cssClass;
      },
      linkPath(link) {
        let d = {
          M: [link.source.x, link.source.y],
          X: [link.target.x, link.target.y],
        };
        if (this.strLinks) {
          return 'M ' + d.M.join(' ') + ' L' + d.X.join(' ');
        } else {
          d.Q = [link.source.x, link.target.y];
          return 'M ' + d.M + ' Q ' + d.Q.join(' ') + ' ' + d.X;
        }
      },
      nodeStyle(node) {
        return node._color ? 'fill: ' + node._color : '';
      },
      linkStyle(link) {
        let style = {};
        if (link._color) style.stroke = link._color;
        return style;
      },
      warnClass(node, classes = []) {
        let cssClass = ['warn-icon-in-main-topo'];
        classes.forEach((c) => cssClass.push(c));
        return cssClass;
      },
      linkIndicatorClass(link, classes = []) {
        let cssClass = link._labelClass ? link._labelClass : [];
        if (!Array.isArray(cssClass)) cssClass = [cssClass];
        cssClass.push('link-indicator');
        classes.forEach((c) => cssClass.push(c));
        return cssClass;
      },
      linkAnchorClass(link, classes = []) {
        let cssClass = link._labelClass ? link._labelClass : [];
        if (!Array.isArray(cssClass)) cssClass = [cssClass];
        cssClass.push('link-anchor');
        classes.forEach((c) => cssClass.push(c));
        return cssClass;
      },
      nodeLabelClass(node, classes = []) {
        let cssClass = node._labelClass ? node._labelClass : [];
        if (!Array.isArray(cssClass)) cssClass = [cssClass];
        cssClass.push('node-label');
        classes.forEach((c) => cssClass.push(c));
        return cssClass;
      },
      nodeClass(node, classes = []) {
        let cssClass = node._cssClass ? node._cssClass : [];
        if (!Array.isArray(cssClass)) cssClass = [cssClass];
        cssClass.push('node');
        classes.forEach((c) => cssClass.push(c));
        // if (this.selected[node.id]) cssClass.push('selected');
        // if (node.fx || node.fy) cssClass.push('pinned');
        return cssClass;
      },
      searchBackground() {
        let vm = this;
        while (vm.$parent) {
          let style = window.getComputedStyle(vm.$el);
          let background = style.getPropertyValue('background-color');
          let rgb = background.replace(/[^\d,]/g, '').split(',');
          let sum = rgb.reduce((a, b) => parseInt(a) + parseInt(b), 0);
          if (sum > 0) return background;
          vm = vm.$parent;
        }
        return 'white';
      },
      spriteSymbol() {
        let svg = this.nodeSym;
        if (svg) {
          return svgExport.toSymbol(svg);
        }
      },
      linkAttrs(link) {
        let attrs = link._svgAttrs || {};
        let linkWidthOnQps = Number(link.qpsLevel) * this.linkWidth;
        attrs['stroke-width'] = attrs['stroke-width'] || linkWidthOnQps;
        return attrs;
      },
    },
  };
</script>
