import { computed, defineComponent, inject, reactive, ref } from "vue";
import deepcopy from "deepcopy";
import "./editor.scss";
import EditorBlock from "./editor-block";
export default defineComponent({
  props: {
    modelValue: { type: Object },
  },
  // 这是因为父组件绑定得是v-model 会触发一个modelValue，@update:modelValue
  emits: ["update:modelValue"],
  components: { EditorBlock },
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue;
      },
      set(newValue) {
        ctx.emit("update:modelValue", deepcopy(newValue));
      },
    });
    const containerStyles = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));
    const selectIndex = ref(-1);
    const lastSelectBlock = computed(
      () => data.value.blocks[selectIndex.value]
    );
    let markline = reactive({
      x: null,
      y: null,
    });
    const config = inject("config");
    const containerRef = ref(null);
    let currentComponent = null;
    const dragenter = (e) => {
      e.dataTransfer.dropEffect = "move"; //h5拖动得图标
    };
    const dragover = (e) => {
      e.preventDefault();
    };
    const dragleave = (e) => {
      e.dataTransfer.dropEffect = "none";
    };
    const drop = (e) => {
      let blocks = data.value.blocks;
      data.value = {
        ...data.value,
        blocks: [
          ...blocks,
          {
            top: e.offsetY,
            left: e.offsetX,
            zIndex: 1,
            key: currentComponent.key,
            alignCenter: true, //希望松手得时候可以居中
          },
        ],
      };
      currentComponent = null;
    };
    const dragstart = (e, component) => {
      // dragenter 进入元素添加一个移动得标识
      // dragover 在目标元素经过 必须要阻止默认行为，否则不能触发drop
      // dragleave 离开元素得时候 需要增加一个禁用标识
      // drop 松手得时候 根据拖拽得组件添加一个组件
      containerRef.value.addEventListener("dragenter", dragenter);
      containerRef.value.addEventListener("dragover", dragover);
      containerRef.value.addEventListener("dragleave", dragleave);
      containerRef.value.addEventListener("drop", drop);
      currentComponent = component;
    };

    const dragend = () => {
      containerRef.value.removeEventListener("dragenter", dragenter);
      containerRef.value.removeEventListener("dragover", dragover);
      containerRef.value.removeEventListener("dragleave", dragleave);
      containerRef.value.removeEventListener("drop", drop);
    };

    const clearOtherBlockFocus = () => {
      data.value.blocks.forEach((block) => (block.focus = false));
    };

    // 获取焦点
    const focusData = computed(() => {
      let focus = [];
      let unFocus = [];
      data.value.blocks.forEach((block) => {
        if (block.focus) {
          focus.push(block);
        } else {
          unFocus.push(block);
        }
      });
      return {
        focus,
        unFocus,
      };
    });
    const blockMousedown = (e, block, index) => {
      // block 定义焦点属性focus
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        if (focusData.value.focus.length <= 1) {
          block.focus = true;
        } else {
          block.focus = !block.focus;
        }
      } else {
        // 清空其他得选中
        if (!block.focus) {
          clearOtherBlockFocus();
          block.focus = true;
        }
      }
      selectIndex.value = index;
      mousedown(e);
    };
    let dragState = {
      startX: 0,
      startY: 0,
    };
    const mousemove = (e) => {
      let { clientX: moveX, clientY: moveY } = e;
      // 计算当前元素最新的left和top,曲线里面展示找到线
      let left = moveX - dragState.startX + dragState.startLeft;
      let top = moveY - dragState.startY + dragState.startTop;
      // 先计算横线,距离参照物还有5px显示
      let y = null;
      let x = null;
      for (let i = 0; i < dragState.lines.y.length; i++) {
        const { top: t, showTop: s } = dragState.lines.y[i]; //获取每一根线
        if (Math.abs(t - top) < 5) {
          y = s;
          moveY = dragState.startY - dragState.startTop + t;
          // 快速贴边
          break;
        }
      }
      for (let i = 0; i < dragState.lines.x.length; i++) {
        const { left: l, showLeft: s } = dragState.lines.x[i]; //获取每一根线
        if (Math.abs(l - left) < 5) {
          x = s;
          moveX = dragState.startX - dragState.startLeft + l;
          // 快速贴边
          break;
        }
      }
      markline.x = x;
      markline.y = y;
      let durX = moveX - dragState.startX;
      let durY = moveY - dragState.startY;
      focusData.value.focus.forEach((block, idx) => {
        block.top = dragState.startPosition[idx].top + durY;
        block.left = dragState.startPosition[idx].left + durX;
      });
    };
    const mouseup = () => {
      document.removeEventListener("mousemove", mousemove);
      document.removeEventListener("mouseup", mouseup);
    };
    const mousedown = (e) => {
      const { width: BWidth, height: BHeight } = lastSelectBlock.value;
      dragState = {
        startX: e.clientX,
        startY: e.clientY,
        startLeft: lastSelectBlock.value.left,
        startTop: lastSelectBlock.value.top,
        startPosition: focusData.value.focus.map(({ top, left }) => ({
          top,
          left,
        })),
        lines: (() => {
          const { unFocus } = focusData.value;
          let lines = { x: [], y: [] };
          unFocus.forEach((block) => {
            const {
              top: ATop,
              left: ALeft,
              width: AWidth,
              height: AHeight,
            } = block;
            // 顶对顶 A和B的top值一样的时候
            lines.y.push({ showTop: ATop, top: ATop });
            // 顶对底 A和B的bottom值一样的时候
            lines.y.push({ showTop: ATop, top: ATop - BHeight });
            // 中间对中间 A和B中间对齐的时候
            lines.y.push({
              showTop: ATop + AHeight / 2,
              top: ATop - BHeight / 2 + AHeight / 2,
            });
            // 底对顶
            lines.y.push({
              showTop: ATop + AHeight,
              top: ATop + AHeight,
            });
            // 底对底
            lines.y.push({
              showTop: ATop + AHeight,
              top: ATop + AHeight - BHeight,
            });

            // 左对左
            lines.x.push({ showLeft: ALeft, left: ALeft });
            // 右对左
            lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth });
            // 中间对中间
            lines.x.push({
              showLeft: ALeft + AWidth / 2,
              left: ALeft + AWidth / 2 - BWidth / 2,
            });
            lines.x.push({
              showLeft: ALeft + AWidth,
              left: ALeft + AWidth - BWidth,
            });
            // 左对右
            lines.x.push({
              showLeft: ALeft,
              left: ALeft - BWidth,
            });
          });
          return lines;
        })(),
      };
      document.addEventListener("mousemove", mousemove);
      document.addEventListener("mouseup", mouseup);
    };
    const containerMousedown = () => {
      clearOtherBlockFocus();
      selectIndex.value = -1;
    };

    return () => (
      <div class="editor">
        <div class="editor-left">
          {/* 根据注册列表渲染内容,实现h5拖拽 */}
          {config.componentList.map((component) => (
            <div
              class="editor-left-item"
              draggable
              onDragstart={(e) => dragstart(e, component)}
              onDragend={(e) => dragend(e)}
            >
              <span>{component.label}</span>
              <div>{component.preview()}</div>
            </div>
          ))}
        </div>
        <div class="editor-top">顶部</div>
        <div class="editor-right">右</div>
        <div class="editor-container">
          {/* 负责产生滚动条 */}
          <div class="editor-container-canvas">
            {/* 画布中得内容 */}
            <div
              class="editor-container-canvas__content"
              style={containerStyles.value}
              ref={containerRef}
              onMousedown={containerMousedown}
            >
              {/* props.modelValue.blocks.map 当 ref 在模板中作为顶层属性被访问时，它们会被自动“解包”，所以不需要使用 .value */}
              {data.value.blocks.map((block, index) => (
                <EditorBlock
                  class={block.focus ? "editor-block-focus" : ""}
                  v-model={block}
                  onMousedown={(e) => blockMousedown(e, block, index)}
                ></EditorBlock>
              ))}
              {markline.x !== null && (
                <div class="line-x" style={{ left: markline.x + "px" }}>
                  fafads
                </div>
              )}
              {markline.y !== null && (
                <div class="line-y" style={{ top: markline.y + "px" }}></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
