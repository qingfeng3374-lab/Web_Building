<script lang="ts">
  /** 第 3 章案例：stage2 → stage3（逻辑见 case/CaseStep.svelte） */
  import CaseStep from '@/components/case/CaseStep.svelte';
  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();
</script>

<CaseStep before="stage2" after="stage3" {locale} />
