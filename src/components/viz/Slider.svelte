<script lang="ts">
  /**
   * 无障碍滑块。
   *
   * 用原生 <input type="range">（键盘、触屏、读屏器全部免费），
   * 只补两件事：
   *   ① aria-valuetext —— 读屏器播报「间距 16 像素」而不是光秃秃的「16」
   *   ② 最小 24px 命中高度 —— WCAG 2.5.8（第 6.2 节）
   */
  let {
    label,
    value = $bindable(),
    min,
    max,
    step = 1,
    unit = '',
    format,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    format?: (v: number) => string;
  } = $props();

  const display = $derived(format ? format(value) : `${value}${unit}`);
  const uid = `sl-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class="control">
  <label class="control__label" for={uid}>
    <span>{label}</span>
    <span class="control__value">{display}</span>
  </label>
  <input
    id={uid}
    type="range"
    {min}
    {max}
    {step}
    bind:value
    aria-valuetext={`${label} ${display}`}
  />
</div>
