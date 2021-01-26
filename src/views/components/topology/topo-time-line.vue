<template>
  <div class="time-line-inner-wrapper">
    <!-- 时间器 -->
    <div class="time-picker">
      <el-date-picker
        size="mini"
        v-model="dateTimes"
        type="datetimerange"
        :picker-options="pickerOptions"
        start-placeholder="开始时间"
        range-separator="~"
        end-placeholder="结束时间"
      >
      </el-date-picker>
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
      <div class="time-axis"></div>
      <!-- 刻度 -->
      <ul class="slider-pips__pips">
        <li
          class="slider-pips__pip"
          v-for="(pip, index) in pipCount"
          :key="'pip' + index"
          :class="[{ 'slider-pips__pip--selected': isPipSelected(index) }]"
          :style="{ left: pipPos(index) }"
        >
          <span class="slider-pips__label" :class="{ 'slider-pips__label--hidden': !labels }">
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
          <span class="left-time" v-show="isTimeLabelVisible">{{ curPipsTime[0] }}</span>
        </div>
        <div class="range-side side-right">
          <span class="right-time" v-show="isTimeLabelVisible">{{ curPipsTime[1] }}</span>
        </div>
      </div>
    </div>
    <!-- 控制器 -->
    <div class="control-bar">
      <span v-show="isToPlay" class="play-start">
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
  export default {
    props: {
      step: { type: Number, default: 1 },
      labels: Boolean,
    },
    data() {
      return {
        min: 0,
        max: 24,
        dateTimes: [],
        pickerOptions: {
          disabledDate: (time) => {

          }
        },
        $timeLineDom: null,
        timeLineXOrigin: 0,
        rangeDom: null,
        rangeDeltaX: 0,
        isRangeMouseDown: false,
        curPipsIndex: [],
        curPipsTime: [],
        isToPlay: true,
        playTimer: null,
        isTimeLabelVisible: false,
      }
    },

    mounted() {
      this.initDateTimes();
      this.initTimeLine();
    },

    destroyed() {
      clearInterval(this.playTimer);
      this.playTimer = null;
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
      rangeFraction(newVal) {
        this.rangeDom.style.width = newVal + '%';
      },
      dateTimes(newVal) {
        if (newVal.length > 1) {
          this.handleChangeDateTimes();
        }
      },
      curPipsIndex(newVal) {
        this.setCurPipsTime();
      }
    },

    methods: {
      handleChangeDateTimes() {
        let deltaHours = Math.floor((this.dateTimes[1].getTime() - this.dateTimes[0]) / (1000 * 60 * 60));
        this.curPipsIndex = [this.min, this.min + 1];
        this.max = deltaHours;
        let pipWidth = this.$timeLineDom.width() / (this.fixedMax - this.fixedMin);
        this.rangeDom.style.left = this.min * pipWidth + 'px';
      },
      setCurPipsTime() {
        this.curPipsTime = [
          dateFormat("YYYY-mm-dd HH:MM:SS", new Date(this.dateTimes[0].getTime() + this.curPipsIndex[0] * this.timeStep)),
          dateFormat("YYYY-mm-dd HH:MM:SS", new Date(this.dateTimes[0].getTime() + this.curPipsIndex[1] * this.timeStep)),
        ];
      },
      initTimeLine() {
        this.$timeLineDom = this.$jq('#timeLine');
        this.rangeDom = this.$jq('#rangeBlock')[0];
        this.rangeDom.style.width = this.rangeFraction + '%';
        this.curPipsIndex = [this.min, this.min + 1];
      },
      initDateTimes() {
        let dateTimesEnd = new Date();
        let dateTimesStart = new Date(dateTimesEnd.getTime() - 5 * 60 * 60 * 1000);
        this.dateTimes = [dateTimesStart, dateTimesEnd];
      },
      togglePlayState(state) {
        this.isToPlay = state;
        if (state) {
          clearInterval(this.playTimer);
        } else {
          if (this.curPipsIndex[0] + 1 >= this.max) {
            this.isToPlay = true;
            return;
          }
          this.playTimer = setInterval(() => {
            let indexTmp = this.curPipsIndex[0] + 1;
            if (indexTmp >= this.max) {
              this.isToPlay = true;
              clearInterval(this.playTimer);
            } else {
              let pipWidth = this.$timeLineDom.width() / (this.fixedMax - this.fixedMin);
              this.rangeDom.style.left = (indexTmp - this.min) * pipWidth + 'px';
              this.curPipsIndex = [indexTmp, indexTmp + 1];
              if (indexTmp === this.max - 1) {
                this.isToPlay = true;
                clearInterval(this.playTimer);
              }
            }
          }, 1000);
        }
      },
      startDragRange(e) {
        if (!this.rangeDom) {
          return;
        }
        if (!this.isToPlay) {
          this.isToPlay = true;
          clearInterval(this.playTimer);
        }
        let mouseX = e.clientX;
        let rangeX = this.rangeDom.offsetLeft;
        this.rangeDeltaX = mouseX - rangeX;
        this.timeLineXOrigin = this.$jq('#timeLine').offset().left - this.$jq(window).scrollLeft();
        this.isRangeMouseDown = true;
      },
      draggingRange(e) {
        if (!this.isRangeMouseDown || !this.rangeDom) {
          return;
        }
        let mouseX = e.clientX;
        // this.rangeDom.style.left = mouseX - this.rangeDeltaX + 'px';
        let mouseXOnTimeLine = mouseX - this.timeLineXOrigin;
        if (mouseXOnTimeLine <= 0 || mouseXOnTimeLine >= this.$timeLineDom.width()) {
          return;
        }
        // let pipWidth = this.fractionToPx(this.rangeFraction);
        let pipWidth = this.$timeLineDom.width() / (this.fixedMax - this.fixedMin);
        let indexTmp = Math.floor(mouseXOnTimeLine / pipWidth) + this.min;
        if (indexTmp !== this.curPipsIndex[0]) {
          this.rangeDom.style.left = (indexTmp - this.min) * pipWidth + 'px';
          this.curPipsIndex = [indexTmp, indexTmp + 1];
        }
      },
      stopDragRange(e) {
        this.rangeDeltaX = 0;
        this.rangeXOrigin = 0;
        this.isRangeMouseDown = false;
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
        return index * this.rangeFraction * this.fixedStep + "%";
      },
      pipLabel(index) {
        return this.fixValue(this.fixedMin + index * this.fixedStep);
      },
      isPipSelected(index) {
        var pipValue = this.fixValue(this.fixedMin + index * this.fixedStep);
        return this.curPipsIndex.includes(pipValue);
      },
    }
  }
</script>

<style lang="scss">
  .time-line-inner-wrapper {
    width: 100%;
    padding: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 99999;

    .time-picker {
      width: auto;

      .el-input__inner {
        width: 320px !important;
        padding: 3px !important;
        & > input {
          background: #252a2f;
        }
        &:hover {
          border-color: rgba(204, 204, 204, 0.2) !important;
        }
      }
      .el-range-editor.is-active {
        border-color: rgba(204, 204, 204, 0.2) !important;
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

        &:before,
        &:after {
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

        &:after {
          left: auto;
          right: 0;
          margin-left: auto;
          margin-right: -4px;
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
            -webkit-transform: translate(-50%, 0px);
            transform: translate(-50%, 0px);
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

      .control-bar {
        position: relative;
      }
    }

    .control-bar {
      width: 20px;
      position: relative;
      top: 3px;

      .play-icon {
        cursor: pointer;
      }
    }
  }
</style>
