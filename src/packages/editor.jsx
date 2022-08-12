import {
  computed,
  defineComponent,
  inject,
  onUnmounted,
  reactive,
  ref,
} from "vue";
import deepcopy from "deepcopy";
import "./editor.scss";
import EditorBlock from "./editor-block";
import { ElButton } from "element-plus";
import { events } from "./event";
import { $dialog } from "../components/Dialog";
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
      events.emit("start");
    };

    const dragend = () => {
      containerRef.value.removeEventListener("dragenter", dragenter);
      containerRef.value.removeEventListener("dragover", dragover);
      containerRef.value.removeEventListener("dragleave", dragleave);
      containerRef.value.removeEventListener("drop", drop);
      events.emit("end");
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
      dragging: false, //默认没有在拖拽
    };
    const mousemove = (e) => {
      let { clientX: moveX, clientY: moveY } = e;
      if (!dragState.dragging) {
        dragState.dragging = true;
        events.emit("start");
      }
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
      markline.x = null;
      markline.y = null;
      if (dragState.dragging) {
        events.emit("end");
      }
    };
    // 组件按下的时候记录初始状态
    const mousedown = (e) => {
      const { width: BWidth, height: BHeight } = lastSelectBlock.value;
      dragState = {
        startX: e.clientX,
        startY: e.clientY,
        startLeft: lastSelectBlock.value.left,
        startTop: lastSelectBlock.value.top,
        dragging: false,
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

    const useCommand = () => {
      // 前进后退的指针
      const state = {
        current: -1,
        queue: [], // 存放用户执行的画布上的所有拖拽的操作
        commands: {}, // 操作命令和执行功能的一个映射表
        commandArray: [], // 存放所有命令 后退、重做
        destroyArray: [],
      };
      const registry = (command) => {
        state.commandArray.push(command);
        state.commands[command.name] = function (...args) {
          const { redo, undo } = command.execute(...args);
          redo();
          if (!command.pushQueue) return;
          let { queue, current } = state;
          if (queue.length > 0) {
            // 可能在放的过程中有撤销操作
            queue = queue.slice(0, current + 1);
            state.queue = queue;
          }
          queue.push({ redo, undo });
          state.current = current + 1;
        };
      };
      registry({
        name: "redo",
        keyboard: "ctrl+y",
        execute() {
          return {
            redo: function () {
              let item = state.queue[state.current + 1];
              if (item) {
                item.redo && item.redo();
                state.current++;
              }
            },
          };
        },
      });
      registry({
        name: "undo",
        keyboard: "ctrl+z",
        execute() {
          return {
            redo: function () {
              if (state.current == -1) return;
              let item = state.queue[state.current];
              if (item) {
                item.undo && item.undo();
                state.current--;
              }
            },
          };
        },
      });
      registry({
        name: "drag",
        pushQueue: true,
        init() {
          this.before = null;
          // 监控拖拽开始事件，保存状态
          const start = () => {
            this.before = deepcopy(data.value.blocks);
          };
          // 拖拽之后需要出发对应的指令
          const end = () => {
            state.commands.drag();
          };
          events.on("start", start);
          events.on("end", end);
          return () => {
            events.off("start");
            events.off("end");
          };
        },
        execute() {
          let before = this.before;
          let after = data.value.blocks;
          return {
            redo() {
              data.value = { ...data.value, blocks: after };
            },
            undo() {
              data.value = { ...data.value, blocks: before };
            },
          };
        },
      });
      registry({
        name: "updateContainer",
        pushQueue: true,
        execute(newValue) {
          let state = {
            befor: data.value,
            after: newValue,
          };
          return {
            redo: () => {
              data.value = state.after;
            },
            undo: () => {
              data.value = state.befor;
            },
          };
        },
      });
      const keyboardEvent = (() => {
        const KeyCodes = {
          90: "z",
          89: "y",
        };
        const onKeydown = (e) => {
          const { ctrlKey, keyCode } = e;
          let keyString = [];
          if (ctrlKey) keyString.push("ctrl");
          keyString.push(KeyCodes[keyCode]);
          keyString = keyString.join("+");
          state.commandArray.forEach(({ keyboard, name }) => {
            if (!keyboard) return;
            if (keyboard === keyString) {
              state.commands[name]();
              e.preventDefault();
            }
          });
        };
        const init = () => {
          window.addEventListener("keydown", onKeydown);
          return () => {
            window.removeEventListener("keydown", onKeydown);
          };
        };
        return init;
      })();
      (() => {
        // 监听键盘事件
        state.destroyArray.push(keyboardEvent());
        state.commandArray.forEach(
          (command) => command.init && state.destroyArray.push(command.init())
        );
      })();
      onUnmounted(() => {
        // 组件销毁清理绑定事件
        state.destroyArray.forEach((fn) => fn && fn());
      });
      return state;
    };
    let { commands } = useCommand();
    const buttons = [
      {
        label: "撤销",
        handler: () => {
          commands.undo();
        },
      },
      {
        label: "前进",
        handler: () => {
          commands.redo();
        },
      },
      {
        label: "导出json",
        handler: () => {
          $dialog({
            title: "",
            content: JSON.stringify(data.value),
          });
        },
      },
      {
        label: "导入",
        handler: () => {
          $dialog({
            title: "导入json",
            content: "",
            footer: true,
            onConfirm(text) {
              commands.updateContainer(JSON.parse(text));
            },
          });
        },
      },
      {},
    ];

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
        <div class="editor-top">
          {buttons.map((btn) => (
            <ElButton onClick={btn.handler}>{btn.label}</ElButton>
          ))}
        </div>
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
