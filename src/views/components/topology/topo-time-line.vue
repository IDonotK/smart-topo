<template>
  <div class="topo-time-line">
    <!-- 模式器 -->
    <div
      class="mode-picker"
      :title="viewMode.mode === 'All' ? $t('topoTimeLine_viewMode_all_tip') : $t('topoTimeLine_viewMode_unit_tip')"
    >
      <vxe-select v-model="viewMode.mode" size="mini">
        <vxe-option value="All" :label="$t('topoTimeLine_viewMode_all')"></vxe-option>
        <vxe-option value="Unit" :label="$t('topoTimeLine_viewMode_unit')"></vxe-option>
      </vxe-select>
    </div>
    <!-- 时间轴 -->
    <div
      id="timeLine"
      class="time-line"
      @mousemove="draggingRange"
      @mouseup="stopDragRange"
      @mouseleave="stopDragRange"
    >
      <!-- 主轴 -->
      <div class="time-axis">
        <div class="event-area" @click="handleClickTimeAxis"></div>
      </div>
      <!-- 刻度 -->
      <ul class="slider-pips__pips">
        <li
          v-for="(pip, index) in pipCount"
          :key="'pip' + index"
          :class="['slider-pips__pip', { 'slider-pips__pip--selected': isPipSelected(index) }]"
          :style="{ left: pipPos(index) }"
        >
          <span :class="{ 'slider-pips__label': true, 'slider-pips__label--hidden': !labels }">
            {{ pipLabel(index) }}
          </span>
        </li>
      </ul>
      <!-- 滑块 -->
      <div
        id="rangeBlock"
        class="range-block"
        @mousedown="startDragRange"
        @mouseover="isTimeLabelVisible = true"
        @mouseleave="isTimeLabelVisible = false"
      >
        <div class="range-side side-left">
          <span v-show="isTimeLabelVisible" class="left-time">{{ curPipsTimeLabel[0] }}</span>
        </div>
        <div class="range-side side-right">
          <span v-show="isTimeLabelVisible" class="right-time">{{ curPipsTimeLabel[1] }}</span>
        </div>
      </div>
    </div>
    <!-- 控制器 -->
    <div v-show="viewMode.mode === 'Unit'" class="control-bar">
      <span class="play-interval" :title="$t('topoTimeLine_playTime_tip', { interval: rangeMoveSpeed })">
        <span class="rk-auto-select">
          <input
            v-model="rangeMoveSpeed"
            type="number"
            min="3"
            max="60"
            :disabled="!isToPlay"
            @change="changeRangeMoveSpeed"
          />
        </span>
        {{ this.$t('second') }}
      </span>
      <span v-show="isToPlay" :class="{ 'play-start': true, disabled: curPipsIndex[1] === max }">
        <svg class="play-icon" alt="" width="18" height="18" @click="togglePlayState(false)">
          <use xlink:href="#PLAY_START"></use>
        </svg>
      </span>
      <span v-show="!isToPlay" class="play-stop">
        <svg class="play-icon" alt="" width="18" height="18" @click="togglePlayState(true)">
          <use xlink:href="#PLAY_STOP"></use>
        </svg>
      </span>
    </div>
  </div>
</template>

<script lang="js">
import { dateFormat } from '@/utils/topo';
import timeFormat from '@/utils/timeFormat';

export default {
  props: {
    timeRange: { type: Array, default: []},
    step: { type: Number, default: 1 },
    labels: {type: Boolean, default: false },
  },
  data() {
    return {
      min: 0,
      max: 24,
      $timeLineDom: null,
      timeLineXOrigin: 0,
      rangeDom: null,
      rangeDeltaX: 0,
      isRangeMouseDown: false,
      curPipsIndex: [],
      curPipsTime: [],
      curPipsTimeLabel: [],
      isToPlay: true,
      playTimer: null,
      isTimeLabelVisible: false,
      rangeMoveSpeed: 3,
      viewMode: {
        mode: 'All'
      },
    }
  },

  computed: {
    timeStep() {
      // step * 1小时
      return this.step * 60 * 60 * 1000;
    },
    pipCount() {
      return Math.round((this.fixedMax - this.fixedMin) / this.fixedStep + 1);
    },
    fixedStep() {
      return this.fixValue(this.step);
    },
    fixedMin() {
      return this.fixValue(this.min);
    },
    fixedMax() {
      return this.fixValue(this.max);
    },
    rangeFraction() {
      return 100 / (this.fixedMax - this.fixedMin);
    },
  },

  watch: {
    viewMode: {
      handler(newVal, oldVal) {
        this.$parent.isClearTopoData = true;
        this.curPipsIndex = [];
        if (!this.isToPlay) {
          this.isToPlay = true;
          clearInterval(this.playTimer);
        }
        let deltaHours = Math.ceil((this.timeRange[1].getTime() - this.timeRange[0]) / (1000 * 60 * 60));
        this.min = 0;
        this.max = deltaHours;
        if (newVal.mode === 'All') {
          this.rangeDom.style.width = '100%';
          this.curPipsIndex = [this.min, this.max];
        } else {
          this.rangeDom.style.width = `${this.rangeFraction  }%`;
          this.curPipsIndex = [this.min, this.min + 1];
        }
      },
      deep: true
    },
    timeRange(newVal) {
      if (newVal && newVal.length > 1) {
        this.handleChangeTimeRange();
      }
    },
    curPipsIndex(newVal) {
      if (newVal.length > 0) {
        this.rangeDom.style.left = `${(newVal[0] - this.min) * this.getPipWidth()  }px`;
        this.setCurPipsTime();
      }
    },
    curPipsTime(newVal) {
      if (newVal && newVal.length > 1) {
        this.$store.dispatch('SET_DURATION', timeFormat(newVal));
      }
    }
  },

  mounted() {
    this.$timeLineDom = this.$jq('#timeLine');
    this.rangeDom = this.$jq('#rangeBlock')[0];
  },

  destroyed() {
    clearInterval(this.playTimer);
    this.playTimer = null;
  },

  methods: {
    // handle event
    handleChangeTimeRange() {
      this.viewMode = {
        mode: 'All'
      };
    },
    handleClickTimeAxis(e) {
      if (this.viewMode.mode === 'All') {
        return;
      }
      if (!this.isToPlay) {
        this.isToPlay = true;
        clearInterval(this.playTimer);
      }
      let curPipsIndextTmp = this.getCurPipsIndexOnMousePos(e);
      if (curPipsIndextTmp.length === 0) {
        return;
      }
      if (curPipsIndextTmp[0] !== this.curPipsIndex[0]) {
        this.curPipsIndex = curPipsIndextTmp;
      }
    },
    startDragRange(e) {
      if (!this.rangeDom) {
        return;
      }
      if (this.viewMode.mode === 'All') {
        return;
      }
      if (!this.isToPlay) {
        this.isToPlay = true;
        clearInterval(this.playTimer);
      }
      let mouseX = e.clientX;
      let rangeX = this.rangeDom.offsetLeft;
      this.rangeDeltaX = mouseX - rangeX;
      this.isRangeMouseDown = true;
    },
    draggingRange(e) {
      if (!this.isRangeMouseDown || !this.rangeDom) {
        return;
      }
      let curPipsIndextTmp = this.getCurPipsIndexOnMousePos(e);
      if (curPipsIndextTmp.length === 0) {
        return;
      }
      if (curPipsIndextTmp[0] !== this.curPipsIndex[0]) {
        this.curPipsIndex = curPipsIndextTmp;
      }
    },
    stopDragRange(e) {
      this.rangeDeltaX = 0;
      this.rangeXOrigin = 0;
      this.isRangeMouseDown = false;
    },
    togglePlayState(state) {
      if (this.viewMode.mode === 'All') {
        return;
      }
      this.isToPlay = state;
      if (state) {
        clearInterval(this.playTimer);
      } else {
        if (this.curPipsIndex[0] + 1 >= this.max) {
          this.isToPlay = true;
          return;
        }
        this.rangeAutoMove();
        this.playTimer = setInterval(() => {
          this.rangeAutoMove();
        }, this.rangeMoveSpeed * 1000);
      }
    },
    rangeAutoMove() {
      let indexTmp = this.curPipsIndex[0] + 1;
      if (indexTmp >= this.max) {
        this.isToPlay = true;
        clearInterval(this.playTimer);
      } else {
        let pipWidth = this.$timeLineDom.width() / (this.fixedMax - this.fixedMin);
        this.rangeDom.style.left = `${(indexTmp - this.min) * pipWidth  }px`;
        this.curPipsIndex = [indexTmp, indexTmp + 1];
        if (indexTmp === this.max - 1) {
          this.isToPlay = true;
          clearInterval(this.playTimer);
        }
      }
    },
    changeRangeMoveSpeed() {
      if (this.rangeMoveSpeed < 3) {
        this.rangeMoveSpeed = 3;
      }
      if (this.rangeMoveSpeed > 60) {
        this.rangeMoveSpeed = 60;
      }
    },

    // get value
    getPipWidth() {
      return this.$timeLineDom.width() / (this.fixedMax - this.fixedMin);
    },
    getCurPipsIndexOnMousePos(e) {
      let mouseX = e.clientX;
      let mouseXOnTimeLine = mouseX - this.getTimeLineXOrigin();
      if (mouseXOnTimeLine <= 0 || mouseXOnTimeLine >= this.$timeLineDom.width()) {
        return [];
      }
      let pipWidth = this.getPipWidth();
      let indexLeft = Math.floor(mouseXOnTimeLine / pipWidth) + this.min;
      let indexRight = Math.ceil(mouseXOnTimeLine / pipWidth) + this.min;
      return [indexLeft, indexRight];
    },
    getTimeLineXOrigin() {
      return this.$jq('#timeLine').offset().left - this.$jq(window).scrollLeft();
    },
    fractionToPx(fraction) {
      return this.$timeLineDom.width() * fraction / 100;
    },
    pxToFraction(pxLen) {
      return pxLen / this.$timeLineDom.width() * 100;
    },
    fixValue(value) {
      return parseFloat(parseFloat(value).toFixed(2));
    },
    pipPos(index) {
      return `${index * this.rangeFraction * this.fixedStep  }%`;
    },
    pipLabel(index) {
      return this.fixValue(this.fixedMin + index * this.fixedStep);
    },
    isPipSelected(index) {
      let pipValue = this.fixValue(this.fixedMin + index * this.fixedStep);
      return this.curPipsIndex.includes(pipValue);
    },

    // set value
    setCurPipsTime() {
      let startTime = new Date(this.timeRange[0].getTime() + this.curPipsIndex[0] * this.timeStep);
      let endTime = null;
      if (this.curPipsIndex[1] === this.max) {
        endTime = new Date(this.timeRange[1].getTime());
      } else {
        endTime = new Date(this.timeRange[0].getTime() + this.curPipsIndex[1] * this.timeStep);
      }
      this.curPipsTime = [startTime, endTime];
      this.curPipsTimeLabel = [
        dateFormat('YYYY-mm-dd HH:MM:SS', this.curPipsTime[0]),
        dateFormat('YYYY-mm-dd HH:MM:SS', this.curPipsTime[1])
      ]
    },
  }
}
</script>

<style lang="scss">
.topo-time-line {
    width: 100%;
    padding: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 99999;

    .mode-picker {
        .vxe-select {
            width: 80px;

            .vxe-input--inner {
                background-color: #242424;
            }

            .vxe-select-option--wrapper {
                border: none;
                background-color: #242424;

                .vxe-select-option.is--selected {
                    color: #ddd;
                }
            }
        }
    }

    .time-line {
        flex-grow: 1;
        position: relative;
        margin: 0 10px;
        min-height: 40px;
        color: #8e9cad;
        font-size: 12px;

        .time-axis {
            position: absolute;
            top: 22px;
            width: 100%;
            height: 1px;
            background-color: #8e9cad;

            &::before,
            &::after {
                content: ' ';
                position: absolute;
                top: -3px;
                left: 0;
                width: 8px;
                height: 8px;
                border-radius: 4px;
                background: #8e9cad;
                margin-left: -4px;
            }

            &::after {
                left: auto;
                right: 0;
                margin-left: auto;
                margin-right: -4px;
            }

            .event-area {
                position: absolute;
                left: 0;
                bottom: -2px;
                width: 100%;
                height: 16px;
                opacity: 0;
            }
        }

        .slider-pips__pips {
            position: relative;
            top: 16px;

            .slider-pips__pip {
                position: absolute;
                top: 0;
                left: 0;
                width: 1px;
                height: 6px;
                background: currentColor;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                transition: all 0.5s ease;
                cursor: pointer;

                &:hover {
                    color: white;
                }

                &--selected {
                    color: #86f6b3;
                    height: 10px;
                    transition: all 0.05s ease;
                }

                .slider-pips__label {
                    position: absolute;
                    left: 50%;
                    top: 100%;
                    -webkit-transform: translate(-50%, 0);
                    transform: translate(-50%, 0);
                    padding: 3px;

                    &--hidden {
                        display: none;
                    }
                }
            }
        }

        .range-block {
            position: absolute;
            top: 2px;
            left: 0;
            width: 100%;
            height: 20px;
            background-image: linear-gradient(90deg, rgba(33, 139, 138, 0.1), rgba(40, 255, 148, 0.2));
            cursor: move;

            .range-side {
                position: absolute;
                top: 0;
                background: #84ced4;
                width: 3px;
                height: 20px;

                span {
                    position: absolute;
                    font-size: 10px;
                    white-space: nowrap;
                    color: #ddd;
                }

                &.side-left {
                    left: -1px;

                    span {
                        left: 0;
                        top: -20px;
                    }
                }

                &.side-right {
                    right: -2px;

                    span {
                        right: 0;
                        bottom: -20px;
                    }
                }
            }
        }
    }

    .control-bar {
        width: 84px;
        position: relative;
        top: 3px;
        color: #ddd;

        .play-interval {
            position: relative;
            bottom: 4px;

            .rk-auto-select {
                input {
                    width: 42px;
                    border-style: unset;
                    border-radius: 3px;
                    outline: 0;
                }
            }
        }

        .play-icon {
            cursor: pointer;
        }

        .play-start.disabled {
            pointer-events: none;
            opacity: 0.2;
        }
    }
}
</style>
