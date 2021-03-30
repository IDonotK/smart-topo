<template>
  <div :id="'netContent' + idNamespace" class="net-content">
    <!-- link text -->
    <div
      v-show="linkTextVisible"
      :id="'linkText' + idNamespace"
      :class="{ linkText: true, 'dark-linkText': isLinkTextDark }"
      :style="linkTextStyle"
      v-html="linkTextContent"
    ></div>
    <overlay-scrollbars
      ref="svgScroll"
      style="height: 100%;"
      :options="scrollOptions"
    >
      <!-- topo svg -->
      <svg
        :id="'netSvg' + idNamespace"
        ref="svg"
        class="net-svg"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        :width="size.w"
        :height="size.h"
      >
        <!-- zoomContainer -->
        <g :id="'zoomContainer' + idNamespace">
          <!-- arrows -->
          <defs class="arrows">
            <marker
              v-for="(link, index) in links"
              :id="'arrow' + link.id + idNamespace"
              :key="index"
              markerUnits="userSpaceOnUse"
              :markerWidth="0.85 * nodeSize"
              :markerHeight="0.85 * nodeSize"
              viewBox="0 0 10 10"
              refX="7"
              refY="3"
              orient="auto"
            >
              <path
                d="M0,0 L8,3 L0,6 L3,3 L0,0"
                :style="getArrowStyle(link)"
                :class="arrowClass([link.isDark ? 'dark-arrow' : '', link.isBright ? 'bright-arrow' : ''])"
              />
            </marker>
          </defs>

          <!-- links -->
          <g :id="'l-links' + idNamespace" class="links">
            <path
              v-for="(link, index) in links"
              :id="link.id + idNamespace"
              :key="index"
              :d="linkPath(link)"
              v-bind="linkAttrs(link)"
              :class="linkClass(link.id, [link.isDark ? 'dark-link' : '', link.isBright ? 'bright-link' : ''])"
              :style="linkStyle(link)"
              :stroke-dasharray="link.label === 'TracingTo' || link.label === 'SubTracingTo' ? '7 5' : 'none'"
              :marker-end="'url(#arrow' + link.id + idNamespace + ')'"
              @click.stop.prevent="emit('linkClick', [$event, link])"
              @mouseenter.stop.prevent="emit('mouseEnterLink', [$event, link])"
              @mouseleave.stop.prevent="emit('mouseLeaveLink', [$event, link])"
            />
          </g>

          <!-- nodes -->
          <g :id="'l-nodes' + idNamespace" class="nodes">
            <template v-for="(node, key) in nodes">
              <svg
                v-if="svgIcon(node)"
                :key="key + 'svg'"
                :width="getNodeSize(node, 'width')"
                :height="getNodeSize(node, 'height')"
                :x="node.x - getNodeSize(node, 'width') / 2"
                :y="node.y"
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
                :cy="node.y + getNodeSize(node) / 2"
                :style="nodeStyle(node)"
                :stroke-width="fontSize / 8"
                :class="nodeClass(node, ['node-agent'])"
                v-bind="node._svgAttrs"
                @click.stop.prevent="emit('nodeClick', [$event, node])"
                @dblclick.stop.prevent="emit('nodeDblClick', [$event, node])"
                @mouseenter.stop.prevent="emit('mouseEnterNode', [$event, node])"
                @mouseleave.stop.prevent="emit('mouseLeaveNode', [$event, node])"
                @mousedown.stop.prevent="emit('mouseDownNode', [$event, key, node])"
              />

              <!-- event icon -->
              <svg
                v-if="node.state === 'Abnormal'"
                :key="'event' + key"
                :x="node.x + 0.5 * getNodeSize(node)"
                :y="node.y - 0.5 * getNodeSize(node)"
                :width="0.6 * getNodeSize(node)"
                :height="0.6 * getNodeSize(node)"
                :class="warnClass(node, [node.isDark ? 'dark-warn-icon' : '', node.isBright ? 'bright-warn-icon' : ''])"
                aria-hidden="true"
              >
                <use
                  v-show="node.eventCount > 0 && node.eventLevel === 'Critical'"
                  :xlink:href="'#' + node.criticalEventIcon"
                ></use>
                <use
                  v-show="node.eventCount > 0 && node.eventLevel === 'Warning'"
                  :xlink:href="'#' + node.warningEventIcon"
                ></use>
              </svg>

              <!-- quickexplore switch -->
              <g
                v-if="topoMode !== 'global'
                  && ['Application','MiddleWare'].includes(node.type)
                  && node.eventCount > 0"
                :key="'quickexplore-wrapper' + key"
              >
                <svg
                  :key="'quickexplore-event' + key"
                  :x="node.x + 0.5 * getNodeSize(node) + 0.5 * getNodeSize(node)"
                  :y="node.y + 0.8 * getNodeSize(node) + 0.05 * getNodeSize(node)"
                  :width="0.4 * getNodeSize(node)"
                  :height="0.4 * getNodeSize(node)"
                  :class="warnClass(node, [node.isDark ? 'dark-warn-icon' : '', node.isBright ? 'bright-warn-icon' : ''])"
                  aria-hidden="true"
                >
                  <use v-show="node.downstreamEventLevel === 'Critical'" xlink:href="#EVENT_CRITICAL"></use>
                  <use v-show="node.downstreamEventLevel === 'Warning'" xlink:href="#EVENT_WARNING"></use>
                </svg>
                <svg
                  :key="'quickexplore' + key"
                  :x="node.x + 0.5 * getNodeSize(node)"
                  :y="node.y + 0.8 * getNodeSize(node)"
                  :width="0.5 * getNodeSize(node)"
                  :height="0.5 * getNodeSize(node)"
                  :class="foldClass(node, [node.isDark ? 'dark-fold-icon' : '', node.isBright ? 'bright-fold-icon' : ''])"
                  aria-hidden="true"
                >
                  <use xlink:href="#PLUS"></use>
                </svg>
                <circle
                  :key="'quickexplore-agent' + key"
                  :r="(0.5 * getNodeSize(node)) / 2"
                  :cx="node.x + 0.5 * getNodeSize(node) + 0.25 * getNodeSize(node)"
                  :cy="node.y + 0.8 * getNodeSize(node) + 0.25 * getNodeSize(node)"
                  :stroke-width="fontSize / 8"
                  :class="foldClass(node, ['quickexplore-agent'])"
                  @click.stop.prevent="emit('quickexploreClick', [$event, node])"
                >
                  <title>{{ $t('svgRender_quickexplore_tip') }}</title>
                </circle>
              </g>
            </template>
          </g>

          <!-- link anchors -->
          <g :id="'link-anchors' + idNamespace" class="anchors">
            <circle
              v-for="(link, index) in links"
              v-show="link.type === 'TracingTo' || link.type === 'SubTracingTo'"
              :key="'link-anchor' + index"
              :class="
                linkAnchorClass(link, [link.isDark ? 'dark-link-anchor' : '', link.isBright ? 'bright-link-anchor' : ''])
              "
              :r="nodeSize / 6"
              fill="#217EF25f"
              :cx="linkAnchorCoord(link).x"
              :cy="linkAnchorCoord(link).y"
              @mouseenter.stop.prevent="emit('mouseEnterLinkAnchor', [$event, link])"
              @mouseleave.stop.prevent="emit('mouseLeaveLinkAnchor', [$event, link])"
            ></circle>
          </g>
          <!-- link indicators -->
          <g :id="'link-indicators' + idNamespace" class="indicators">
            <text
              v-for="(link, index) in links"
              v-show="link.label === 'TracingTo' || link.label === 'SubTracingTo'"
              :key="'link-indicator' + index"
              :x="linkIndicatorCoord(link).x"
              :y="linkIndicatorCoord(link).y"
              text-anchor="middle"
              :dy="-nodeSize / 6"
              :font-size="fontSize / 2"
              :class="
                linkIndicatorClass(link, [
                  link.isDark ? 'dark-link-indicator' : '',
                  link.isBright ? 'bright-link-indicator' : '',
                ])
              "
              :stroke-width="fontSize / 8"
            >
              {{ link.callPerMinute + ' r/min' }}
            </text>
          </g>

          <!-- node labels -->
          <g :id="'node-labels' + idNamespace" class="labels">
            <text
              v-for="(node, index) in nodes"
              :key="index"
              :x="node.x + labelOffset.x"
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

          <!-- layer lines-->
          <g :id="'layer-lines' + idNamespace" class="lines">
            <path
              v-for="(layer, index) in layerOptions.layerLines"
              :key="'layer' + index"
              class="layer-line"
              stroke-dasharray="5, 5"
              :d="layerlinePath(layer)"
            />
          </g>
        </g>
      </svg>
    </overlay-scrollbars>
  </div>
</template>
<script>
export default {
  name: 'SvgRenderer',
  props: [
    'size',
    'nodes',
    'links',
    'nodeSize',
    'fontSize',
    'linkWidth',
    'nodeLabels',
    'linkLabels',
    'labelOffset',
    'linkTextStyle',
    'isLinkTextDark',
    'linkTextVisible',
    'linkTextContent',
    'idNamespace',
    'currentNode',
    'layerOptions',
  ],

  data() {
    return {
      scrollOptions: {
        className: 'os-theme-light',
        resize: 'none',
        sizeAutoCapable : true,
        paddingAbsolute : true,
        scrollbars : {
          clickScrolling : true,
          dragScrolling: true,
        },
      },
    };
  },

  computed: {
    topoMode() {
      return this.$store.state.rocketTopo.topoMode;
    },
  },

  watch: {
    'layerOptions.deltaCenter'(newVal, oldVal) {
      this.$nextTick(() => {
        this.$refs.svgScroll.osInstance().scroll({
          x : `+=${newVal.x}`,
          y : `+=${newVal.y}`,
        });
      });
    }
  },

  mounted() {
   
  },

  methods: {
    arrowClass(classes = []) {
      let cssClass = [];
      classes.forEach(c => cssClass.push(c));
      return cssClass;
    },
    getArrowStyle(link) {
      let style = {};
      if (link._color) {
        style.fill = link._color;
      }
      return style;
    },
    getArrowRefX(link) {
      let size = this.nodes.find(node => node.id === link.tid)._size || this.nodeSize;
      return size / 2 + size;
    },
    getNodeSize(node, side) {
      let size = node._size || this.nodeSize;
      if (side) {
        size = node[`_${side}`] || size;
      }
      return size;
    },
    svgIcon(node) {
      return node.svgIcon;
    },
    emit(e, args) {
      this.$emit('action', e, args);
    },
    linkClass(linkId, classes = []) {
      let cssClass = ['link'];
      classes.forEach(c => cssClass.push(c));
      return cssClass;
    },
    layerlinePath(layer) {
      return `M${layer.start.x} ${layer.start.y} ${layer.end.x} ${layer.end.y}`
    },
    linkPath(link) {
      let sx = link.source.x ? link.source.x : 0;
      let sy = link.source.y ? link.source.y : 0;
      let tx = link.target.x ? link.target.x : 0;
      let ty = link.target.y ? link.target.y : 0;
      if (link.isVertical) {
        return `
          M ${sx} ${sy}
          Q ${(sx + tx) / 2 + link.fixX} ${(sy + ty) / 2}
          ${tx} ${ty}
        `;
      } else {
        return `
          M ${ sx } ${ sy }
          C ${ sx } ${ sy + (ty - sy) * 0.8 }
          ${ tx } ${ ty - (ty - sy) * 0.8 }
          ${ tx } ${ ty }
        `;
      }
    },
    linkAnchorCoord(link) {
      let sx = link.source.x ? link.source.x : 0;
      let sy = link.source.y ? link.source.y : 0;
      let tx = link.target.x ? link.target.x : 0;
      let ty = link.target.y ? link.target.y : 0;
      let coord = {
        x: (sx + tx + link.fixX) / 2,
        y: (sy + ty) / 2,
      };
      return coord;
    },
    linkIndicatorCoord(link) {
      let sx = link.source.x ? link.source.x : 0;
      let sy = link.source.y ? link.source.y : 0;
      let tx = link.target.x ? link.target.x : 0;
      let ty = link.target.y ? link.target.y : 0;
      let coord = {
        x: (sx + tx + link.fixX) / 2,
        y: (sy + ty) / 2,
      };
      return coord;
    },
    nodeStyle(node) {
      return node._color ? `fill: ${node._color}` : '';
    },
    linkStyle(link) {
      let style = {};
      if (link._color) {
        style.stroke = link._color;
      }
      return style;
    },
    foldClass(node, classes = []) {
      let cssClass = ['fold-icon-in-main-topo'];
      classes.forEach(c => cssClass.push(c));
      return cssClass;
    },
    warnClass(node, classes = []) {
      let cssClass = ['warn-icon-in-main-topo'];
      classes.forEach(c => cssClass.push(c));
      return cssClass;
    },
    linkIndicatorClass(link, classes = []) {
      let cssClass = link._labelClass ? link._labelClass : [];
      if (!Array.isArray(cssClass)) {
        cssClass = [cssClass];
      }
      cssClass.push('link-indicator');
      classes.forEach(c => cssClass.push(c));
      return cssClass;
    },
    linkAnchorClass(link, classes = []) {
      let cssClass = link._labelClass ? link._labelClass : [];
      if (!Array.isArray(cssClass)) {
        cssClass = [cssClass];
      }
      cssClass.push('link-anchor');
      classes.forEach(c => cssClass.push(c));
      return cssClass;
    },
    nodeLabelClass(node, classes = []) {
      let cssClass = node._labelClass ? node._labelClass : [];
      if (!Array.isArray(cssClass)) {
        cssClass = [cssClass];
      }
      cssClass.push('node-label');
      classes.forEach(c => cssClass.push(c));
      return cssClass;
    },
    nodeClass(node, classes = []) {
      let cssClass = node._cssClass ? node._cssClass : [];
      if (!Array.isArray(cssClass)) {
        cssClass = [cssClass];
      }
      cssClass.push('node');
      classes.forEach(c => cssClass.push(c));
      return cssClass;
    },
    searchBackground() {
      if (this.$parent) {
        let style = window.getComputedStyle(this.$el);
        let background = style.getPropertyValue('background-color');
        let rgb = background.replace(/[^\d,]/g, '').split(',');
        let sum = rgb.reduce((a, b) => parseInt(a) + parseInt(b), 0);
        if (sum > 0) {
          return background;
        }
        let vm = this.$parent;
        while (vm.$parent) {
          style = window.getComputedStyle(vm.$el);
          background = style.getPropertyValue('background-color');
          rgb = background.replace(/[^\d,]/g, '').split(',');
          sum = rgb.reduce((a, b) => parseInt(a) + parseInt(b), 0);
          if (sum > 0) {
            return background;
          }
          vm = vm.$parent;
        }
      }
      return 'white';
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
