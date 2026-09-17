<script lang="ts">
  /** 第 6 章案例：stage5 → stage6（逻辑见 case/CaseStep.svelte） */
  import CaseStep from '@/components/case/CaseStep.svelte';
  let { locale = 'zh' }: { locale?: 'zh' | 'en' } = $props();
</script>

<CaseStep before="stage5" after="stage6" {locale} />
