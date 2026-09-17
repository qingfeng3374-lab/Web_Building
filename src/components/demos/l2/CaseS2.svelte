<script lang="ts">
  /** 第 2 章案例：stage1 → stage2（逻辑见 case/CaseStep.svelte） */
  import CaseStep from '@/components/case/CaseStep.svelte';
  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();
</script>

<CaseStep before="stage1" after="stage2" {locale} />
