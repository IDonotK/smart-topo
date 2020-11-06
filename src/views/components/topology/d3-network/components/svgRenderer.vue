<template>
  <svg
    class="net-svg"
    id="netSvg"
    ref="svg"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    :width="size.w"
    :height="size.h"
    @mouseup="emit('dragEnd', [$event])"
    @touchend.passive="emit('dragEnd', [$event])"
  >
    <!-- zoomContainer -->
    <g id="zoomContainer">
      <defs class="arrows">
        <marker
          v-for="(link, index) in links"
          :key="index"
          :id="'arrow' + link.id"
          markerUnits="userSpaceOnUse"
          markerWidth="10"
          markerHeight="10"
          viewBox="0 0 10 10"
          :refX="getArrowRefX(link)"
          refY="6"
          orient="auto"
        >
          <path
            d="M2,2 L10,6 L2,10 L6,6 L2,2"
            :style="getArrowStyle()"
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
          @click="emit('linkClick', [$event, link])"
          @touchstart.passive="emit('linkClick', [$event, link])"
          @mouseenter.prevent="mouseEnter($event, link)"
          @mouseleave.prevent="mouseLeave($event, link)"
          v-bind="linkAttrs(link)"
          :class="linkClass(link.id, [link.isDark ? 'dark-link' : '', link.isBright ? 'bright-link' : ''])"
          :style="linkStyle(link)"
          :marker-end="'url(#arrow' + link.id + ')'"
        />
      </g>

      <!-- nodes -->
      <g class="nodes" id="l-nodes" v-if="!noNodes">
        <template v-for="(node, key) in nodes">
          <svg
            v-if="svgIcon(node)"
            :key="key"
            :viewBox="svgIcon(node).attrs.viewBox"
            :width="getNodeSize(node, 'width')"
            :height="getNodeSize(node, 'height')"
            @click="emit('nodeClick', [$event, node])"
            @touchend.passive="emit('nodeClick', [$event, node])"
            @mousedown.prevent="emit('dragStart', [$event, key])"
            @touchstart.prevent="emit('dragStart', [$event, key])"
            @mouseenter.prevent="mouseEnter($event, node)"
            @mouseleave.prevent="mouseLeave($event, node)"
            :x="node.x - getNodeSize(node, 'width') / 2"
            :y="node.y - getNodeSize(node, 'height') / 2"
            :style="nodeStyle(node)"
            :title="node.name"
            :class="nodeClass(node, ['node-svg', node.isDark ? 'dark-node' : '', node.isBright ? 'bright-node' : ''])"
            v-html="svgIcon(node).data"
            v-bind="node._svgAttrs"
          ></svg>

          <!-- default circle nodes -->
          <circle
            v-else
            :key="key"
            :r="getNodeSize(node) / 2"
            @click="emit('nodeClick', [$event, node])"
            @touchend.passive="emit('nodeClick', [$event, node])"
            @mousedown.prevent="emit('dragStart', [$event, key])"
            @touchstart.prevent="emit('dragStart', [$event, key])"
            @mouseenter.prevent="mouseEnter($event, node)"
            @mouseleave.prevent="mouseLeave($event, node)"
            :cx="node.x"
            :cy="node.y"
            :style="nodeStyle(node)"
            :title="node.name"
            :class="nodeClass(node, [node.isDark ? 'dark-node' : '', node.isBright ? 'bright-node' : ''])"
            v-bind="node._svgAttrs"
          />
        </template>
      </g>

      <!-- Links Labels -->
      <g class="labels" id="link-labels" v-if="linkLabels">
        <text
          class="link-label"
          v-for="(link, index) in links"
          :key="index"
          :font-size="fontSize"
          v-show="link.showLabel"
        >
          <textPath v-bind:xlink:href="'#' + link.id" startOffset="50%">
            {{ link.name }}
          </textPath>
        </text>
      </g>

      <!-- Node Labels -->
      <g class="labels" id="node-labels" v-if="nodeLabels">
        <text
          class="node-label"
          v-for="(node, index) in nodes"
          v-show="node.showLabel"
          :key="index"
          :x="node.x + getNodeSize(node) / 2 + fontSize / 2"
          :y="node.y + labelOffset.y"
          :font-size="fontSize"
          :class="node._labelClass ? node._labelClass : ''"
          :stroke-width="fontSize / 8"
        >
          {{ node.name }}
        </text>
      </g>
    </g>
  </svg>
</template>
<script>
  import svgExport from '../lib/js/svgExport.js';

  import * as d3 from 'd3';

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
    ],

    data() {
      return {
        zoom: d3.zoom(),
        mouseEnterElemTimer: null,
        mouseLeaveElemTimer: null,
      };
    },

    mounted() {
      this.setZoom();
    },

    computed: {
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
      getArrowStyle() {
        return 'fill: rgba(18,120,98);';
      },
      getArrowRefX(link) {
        let size = this.nodes.find((node) => node.id === link.tid)._size || this.nodeSize;
        return size / 2 + 10;
      },
      restoreELemTheme() {
        this.nodes.forEach((node) => {
          node.isDark = false;
          node.isBright = false;
          node.showLabel = false;
        });

        this.links.forEach((link) => {
          link.isDark = false;
          link.isBright = false;
          link.showLabel = false;
        });
      },
      lightAroundELem(type, elem, filter) {
        if (type === 'node') {
          if (filter === 'Single Hop') {
            const lightdNodeIds = new Set();
            lightdNodeIds.add(elem.id);
            this.links.forEach((link) => {
              if (link.sid === elem.id || link.tid === elem.id) {
                link.isDark = false;
                link.isBright = true;
                link.showLabel = true;

                link.source.isDark = false;
                link.source.isBright = true;
                link.source.showLabel = true;

                link.target.isDark = false;
                link.target.isBright = true;
                link.target.showLabel = true;

                lightdNodeIds.add(link.source.id);
                lightdNodeIds.add(link.target.id);
              } else {
                link.isDark = true;
                link.isBright = false;
                link.showLabel = false;

                if (!lightdNodeIds.has(link.source.id)) {
                  link.source.isDark = true;
                  link.source.isBright = false;
                  link.source.showLabel = false;
                }
                if (!lightdNodeIds.has(link.target.id)) {
                  link.target.isDark = true;
                  link.target.isBright = false;
                  link.target.showLabel = false;
                }
              }
            });
          }
        }

        if (type === 'link') {
          this.links.forEach((link) => {
            if (link.id === elem.id) {
              link.isDark = false;
              link.isBright = true;
              link.showLabel = true;
            } else {
              link.isDark = true;
              link.isBright = false;
              link.showLabel = false;
            }
          });

          elem.source.isDark = false;
          elem.source.isBright = true;
          elem.source.showLabel = true;

          elem.target.isDark = false;
          elem.target.isBright = true;
          elem.target.showLabel = true;
        }
      },
      mouseEnter(event, elem) {
        event.stopPropagation();
        if (this.mouseLeaveElemTimer != null) {
          clearTimeout(this.mouseLeaveElemTimer);
          this.mouseLeaveElemTimer = null;
        } else {
          this.mouseEnterElemTimer = setTimeout(() => {
            // 防抖
            this.mouseEnterElemTimer = null;
            if (event.target.tagName === 'circle') {
              elem.showLabel = true;
              this.lightAroundELem('node', elem, 'Single Hop');
            }
            if (event.target.tagName === 'path') {
              elem.showLabel = true;
              this.lightAroundELem('link', elem);
            }
          }, 300);
        }
      },
      mouseLeave(event, elem) {
        event.stopPropagation();
        if (this.mouseEnterElemTimer != null) {
          // 防抖
          clearTimeout(this.mouseEnterElemTimer);
          this.mouseEnterElemTimer = null;
        } else {
          this.mouseLeaveElemTimer = setTimeout(() => {
            this.mouseLeaveElemTimer = null;
            if (event.target.tagName === 'circle') {
              elem.showLabel = false;
            }
            if (event.target.tagName === 'path') {
              elem.showLabel = false;
            }
            this.restoreELemTheme();
          }, 300);
        }
      },
      setZoom() {
        const zoomed = () => {
          d3.select('#zoomContainer').attr(
            'transform',
            'translate(' + d3.event.transform.x + ',' + d3.event.transform.y + ') scale(' + d3.event.transform.k + ')',
          );
        };
        this.zoom.scaleExtent([0.1, 10]).on('zoom', zoomed);
        d3.select('.net-svg')
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
        return node.svgObj || this.nodeSvg;
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
          M: [link.source.x | 0, link.source.y | 0],
          X: [link.target.x | 0, link.target.y | 0],
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
      nodeClass(node, classes = []) {
        let cssClass = node._cssClass ? node._cssClass : [];
        if (!Array.isArray(cssClass)) cssClass = [cssClass];
        cssClass.push('node');
        classes.forEach((c) => cssClass.push(c));
        if (this.selected[node.id]) cssClass.push('selected');
        if (node.fx || node.fy) cssClass.push('pinned');
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
        attrs['stroke-width'] = attrs['stroke-width'] || this.linkWidth;
        return attrs;
      },
    },
  };
</script>
