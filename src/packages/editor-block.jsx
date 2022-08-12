import { computed, defineComponent, inject, onMounted, ref } from "vue";
import deepcopy from "deepcopy";
export default defineComponent({
  props: {
    modelValue: { type: Object },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue;
      },
      set(newValue) {
        ctx.emit("update:modelValue", deepcopy(newValue));
      },
    });
    const blockStyles = computed(() => ({
      top: `${data.value.top}px`,
      left: `${data.value.left}px`,
      zIndex: `${data.value.zIndex}`,
    }));
    const config = inject("config");
    const blockRef = ref(null);
    onMounted(() => {
      let { offsetWidth, offsetHeight } = blockRef.value;
      // 只有在数据第一次渲染的时候才需要重新结算距离，第二次数组重新渲染的时候，以前的老数据不需要在重新计算了
      if (data.value.alignCenter) {
        data.value.left = data.value.left - offsetWidth / 2;
        data.value.top = data.value.top - offsetHeight / 2;
        data.value.alignCenter = false;
      }
      // 给渲染完成之后的元素加上宽高
      data.value.width = offsetWidth;
      data.value.height = offsetHeight;
    });
    return () => {
      const component = config.componentMap[data.value.key];
      const RenderComponent = component.render();
      return (
        <div class="editor-block" style={blockStyles.value} ref={blockRef}>
          {RenderComponent}
        </div>
      );
    };
  },
});
