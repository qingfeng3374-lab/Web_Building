<script lang="ts">
  /** 第 1 章案例：stage0 → stage1（逻辑见 case/CaseStep.svelte） */
  import CaseStep from '@/components/case/CaseStep.svelte';
  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();
</script>

<CaseStep before="stage0" after="stage1" {locale} />
