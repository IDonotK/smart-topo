<template>
  <div class="rk-help-center">
    <div class="nav-header">帮助中心</div>
    <div class="help-center-nav" @click="highlight($event)">
      <overlay-scrollbars style="height: 100%;" :options="scrollOptions" v-html="toc" />
    </div>
    <div class="help-center-content">
      <div class="markdown-body" v-html="content"></div>
    </div>
  </div>
</template>

<script lang="js">
import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor'
import markdownItTableOfContents from 'markdown-it-table-of-contents'
import 'github-markdown-css/github-markdown.css';

import helpDoc from '@/assets/docs/help_document.md';
import imgs from '@/assets/docs/imgs.js'

export default {
  data() {
    return {
      scrollOptions: {
        className: 'os-theme-dark',
        resize: 'none',
        sizeAutoCapable: true,
        paddingAbsolute: true,
        scrollbars: {
          clickScrolling: true,
          dragScrolling: true,
        }
      },
      content: '',
      toc: ''
    }
  },

  created() {
    this.initMdHtml();
  },

  methods: {
    initMdHtml() {
      let md = markdownIt({}).use( markdownItAnchor, {
          permalink: true,
          permalinkBefore: true,
          permalinkSymbol: '',
          slugify: this.slugify
        } );
      this.content = md.render(helpDoc);
      this.content = this.content.replace(
        /<img src=".+?" alt="(.+)?">/g,
        ($1, $2) => `<img src="${imgs[$2]}" alt="${$2}">`
      )

      md.use( markdownItTableOfContents, {
        includeLevel: [1, 2, 3, 4],
        format: function format(x) {
          return `<span title="${x.trim()}">${x.trim()}</span>`;},
        slugify: this.slugify
      })
      this.toc = md.render(`[[toc]]\n${  helpDoc}`).match(/^<p>(.+)?<\/p>/)[1]
    },

    slugify(s) {
      return `help-center#${  s.trim()}`
    },

    highlight(e) {
      this.$jq('.help-center-nav a, .help-center-nav a span').removeClass('active')
      this.$jq(e.target).addClass('active')
    }
  }
}
</script>

<style lang="scss">
.rk-help-center {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;

    .nav-header {
        position: fixed;
        top: 0;
        width: 220px;
        font-size: 24px;
        font-weight: 700;
        line-height: 70px;
        padding-left: 20px;
        border-bottom: 1px solid #dcdfe6;
        border-right: 1px solid #dcdfe6;
    }

    .help-center-content {
        flex: 1;
        user-select: text;
        overflow-y: scroll;
        padding: 20px;

        ul {
            list-style: inherit;
        }

        ol {
            li {
                list-style: decimal;
            }
        }
    }

    .help-center-nav {
        width: 220px;
        margin-top: 80px;
        padding-right: 20px;
        border-right: 1px solid #dcdfe6;
        font-size: 16px;
        line-height: 40px;
        color: #333;

        .table-of-contents {
            ul {
                padding-left: 20px;

                li a {
                    display: block;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    word-break: break-all;

                    &:hover,
                    &:active {
                        color: #409eff;
                    }
                }

                .active {
                    font-weight: 700;
                    color: #409eff;
                }
            }
        }
    }
}
</style>
