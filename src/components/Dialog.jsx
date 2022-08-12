import { ElButton, ElDialog, ElInput } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";

const DialogComponent = defineComponent({
  props: {
    options: { type: Object },
  },
  setup(props, ctx) {
    const state = reactive({
      isShow: false,
      options: props.options, //第一次创建的时候用户传递过来的属性
    });
    ctx.expose({
      //让外界可以调用这个方法
      showDialog(options) {
        state.isShow = true;
        state.options = options;
      },
    });
    const cancel = () => {
      state.isShow = false;
    };
    const confirm = () => {
      state.isShow = false;
      state.options.onConfirm && state.options.onConfirm(state.options.content);
    };
    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.options.title}>
          {{
            default: () => (
              <ElInput
                type="textarea"
                v-model={state.options.content}
                rows={10}
              ></ElInput>
            ),
            footer: () =>
              state.options.footer && (
                <div>
                  <ElButton onClick={cancel}>取消</ElButton>
                  <ElButton type="primary" onClick={confirm}>
                    确定
                  </ElButton>
                </div>
              ),
          }}
        </ElDialog>
      );
    };
  },
});
// 组件进行动态渲染 通过自己定义的方法来渲染ELDialog
let vm;
export function $dialog(options) {
  if (!vm) {
    let el = document.createElement("div");
    // 创建虚拟节点 只有第一次创建的时候会通过props传入，之后就从showDialog传入options
    vm = createVNode(DialogComponent, { options });
    // 将组件渲染到el元素上扔到页面上
    render(vm, el);
    document.body.appendChild(el);
  }

  let { showDialog } = vm.component.exposed;
  showDialog(options);
}
