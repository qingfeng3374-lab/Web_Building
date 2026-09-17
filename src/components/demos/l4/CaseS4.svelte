<script lang="ts">
  /** 第 4 章案例：stage3 → stage4（逻辑见 case/CaseStep.svelte） */
  import CaseStep from '@/components/case/CaseStep.svelte';
  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();
</script>

<CaseStep before="stage3" after="stage4" {locale} />
