<script lang="ts">
  /** 第 5 章案例：stage4 → stage5（逻辑见 case/CaseStep.svelte） */
  import CaseStep from '@/components/case/CaseStep.svelte';
  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();
</script>

<CaseStep before="stage4" after="stage5" {locale} />
