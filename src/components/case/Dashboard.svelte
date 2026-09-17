<script lang="ts">
  /**
   * 贯穿案例：NeoCampus 新生数据看板（stage0 → stage6）
   *
   * 同一份 DOM、同一份数据，**只有 CSS 在生长**。
   *
   * CSS 的组织方式刻意是**累加**的：每一层用 `[data-s]` 属性选择器开启，
   * 并且不撤销下层的规则。读者逐层切换时看到的是「加一条规则」，
   * 而不是「改一堆规则」—— 这本身就是「布局应该可叠加」的演示。
   *
   * stage0 没有任何布局 CSS：它不是写坏了，是**还没有布局**。
   * 常规流已经让它在 320px 到 4K 上可读 —— 这是起点，不是问题。
   *
   * DOM 顺序从 stage0 起就等于业务重要度降序，
   * 所以全程不需要、也没有出现过 `order`。
   *
   * 每张卡片带 data-metric / data-importance，
   * 因此 layout-metrics.collect() 可以直接在它上面跑真实测量。
   */
  import type { CaseStage } from '@/content/types';

  let {
    stage = 'stage0',
    locale = 'zh',
    interactive = false,
  }: { stage?: CaseStage; locale?: 'zh' | 'en'; interactive?: boolean } = $props();

  /** stage0..stage6 → 0..6，供 CSS 做「≥ 某层」的累加 */
  const level = $derived(Number(stage.replace('stage', '')));

  const L = $derived({
    zh: {
      title: 'NeoCampus 新生数据看板',
      sub: '2025 级 · 数据截至 9 月 12 日',
      filters: ['学院', '生源省份', '入学年份'],
      filterOpts: ['全部学院', '全部省份', '2025'],
      summary:
        '2025 级新生共 4,286 人，来自 31 个省级行政区，分布在 18 个学院。省内生源占 42.7%，较去年下降 3.1 个百分点；中西部省份生源比例上升明显，四川、陕西、河南三省合计贡献 19.4%。工科类专业录取人数占总数的 61.2%，理学类 18.5%，管理与人文社科合计 20.3%。',
      kpis: [
        { k: 'total', label: '新生总人数', value: '4,286', delta: '+3.2%' },
        { k: 'rate', label: '报到率', value: '98.2%', delta: '+0.4pt' },
        { k: 'gender', label: '男女比', value: '1.4 : 1', delta: '—' },
        { k: 'prov', label: '生源省份', value: '31', delta: '+1' },
        { k: 'school', label: '学院数', value: '18', delta: '—' },
        { k: 'major', label: '专业数', value: '62', delta: '+2' },
        { k: 'age', label: '平均年龄', value: '18.3', delta: '−0.1' },
        { k: 'update', label: '更新时间', value: '09-12', delta: '' },
      ],
      trend: '近六年录取人数',
      breakdown: '学院分布 Top 5',
      schools: ['地球科学与技术学院', '石油工程学院', '计算机科学与技术学院', '化学工程学院', '经济管理学院'],
      table: '重点专业报到情况',
      cols: ['专业', '录取', '报到', '报到率'],
      rows: [
        ['石油工程', '186', '186', '100%'],
        ['计算机科学与技术', '204', '204', '100%'],
        ['资源勘查工程', '152', '149', '98.0%'],
        ['化学工程与工艺', '178', '174', '97.8%'],
      ],
      actions: ['导出 CSV', '生成简报', '分享'],
      badge: '合成数据 · 教学用途',
    },
    en: {
      title: 'NeoCampus Freshman Dashboard',
      sub: 'Class of 2025 · data as of 12 Sept',
      filters: ['School', 'Home province', 'Intake year'],
      filterOpts: ['All schools', 'All provinces', '2025'],
      summary:
        'The 2025 intake totals 4,286 students from 31 provincial regions across 18 schools. 42.7% come from within the province, down 3.1 points year on year, while central and western provinces are clearly up — Sichuan, Shaanxi and Henan together supply 19.4%. Engineering accounts for 61.2% of admissions, natural sciences 18.5%, and management plus humanities 20.3% combined.',
      kpis: [
        { k: 'total', label: 'Total enrolment', value: '4,286', delta: '+3.2%' },
        { k: 'rate', label: 'Check-in rate', value: '98.2%', delta: '+0.4pt' },
        { k: 'gender', label: 'Gender ratio', value: '1.4 : 1', delta: '—' },
        { k: 'prov', label: 'Provinces', value: '31', delta: '+1' },
        { k: 'school', label: 'Schools', value: '18', delta: '—' },
        { k: 'major', label: 'Programmes', value: '62', delta: '+2' },
        { k: 'age', label: 'Mean age', value: '18.3', delta: '−0.1' },
        { k: 'update', label: 'Updated', value: '09-12', delta: '' },
      ],
      trend: 'Admissions, last six years',
      breakdown: 'Top 5 schools',
      schools: [
        'Geosciences & Technology',
        'Petroleum Engineering',
        'Computer Science & Technology',
        'Chemical Engineering',
        'Economics & Management',
      ],
      table: 'Check-in by key programme',
      cols: ['Programme', 'Admitted', 'Checked in', 'Rate'],
      rows: [
        ['Petroleum Engineering', '186', '186', '100%'],
        ['Computer Science', '204', '204', '100%'],
        ['Resource Exploration', '152', '149', '98.0%'],
        ['Chemical Engineering', '178', '174', '97.8%'],
      ],
      actions: ['Export CSV', 'Build brief', 'Share'],
      badge: 'Synthetic data · for teaching',
    },
  }[locale]);

  /** 业务重要度：DOM 顺序就是这个顺序（降序），从 stage0 起就是对的 */
  const IMPORTANCE: Record<string, number> = {
    total: 5, rate: 4, gender: 3, prov: 2, school: 2, major: 2, age: 1, update: 1,
  };

  const TREND = [3820, 3905, 4010, 4088, 4152, 4286];
  const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];
  const SCHOOL_VALUES = [612, 548, 503, 421, 388];
  const maxTrend = Math.max(...TREND);
  const maxSchool = Math.max(...SCHOOL_VALUES);
</script>

<div class="dash" data-s={level} data-stage={stage} data-interactive={interactive}>
  <header class="dash__head">
    <div>
      <h3 class="dash__title" data-metric="title" data-importance="2">{L.title}</h3>
      <p class="dash__sub">{L.sub}</p>
    </div>
    <span class="dash__badge">{L.badge}</span>
  </header>

  <div class="dash__filters" data-metric="filters" data-importance="3">
    {#each L.filters as f, i (f)}
      <label class="dash__filter">
        <span>{f}</span>
        <select disabled={!interactive} tabindex={interactive ? 0 : -1}>
          <option>{L.filterOpts[i]}</option>
        </select>
      </label>
    {/each}
  </div>

  <p class="dash__summary" data-metric="summary" data-importance="2">{L.summary}</p>

  <!-- DOM 顺序 = 业务重要度降序。从 stage0 起就是对的，全程不需要 order -->
  <ul class="dash__kpis">
    {#each L.kpis as kpi (kpi.k)}
      <li
        class="kpi"
        data-k={kpi.k}
        data-metric={`kpi-${kpi.k}`}
        data-importance={IMPORTANCE[kpi.k] ?? 1}
        data-rank={kpi.k === 'total' ? 'primary' : (IMPORTANCE[kpi.k] ?? 1) >= 3 ? 'secondary' : 'tertiary'}
      >
        <span class="kpi__label">{kpi.label}</span>
        <span class="kpi__value">{kpi.value}</span>
        {#if kpi.delta}<span class="kpi__delta">{kpi.delta}</span>{/if}
      </li>
    {/each}
  </ul>

  <section class="dash__trend" data-metric="trend" data-importance="3">
    <h4>{L.trend}</h4>
    <svg viewBox="0 0 320 96" role="img" aria-label={L.trend} class="dash__spark">
      {#each TREND as v, i (i)}
        <rect
          x={10 + i * 50}
          y={92 - (v / maxTrend) * 78}
          width="34"
          height={(v / maxTrend) * 78}
          rx="2"
          fill={i === TREND.length - 1 ? 'var(--accent)' : 'var(--line-2)'}
        />
        <text x={27 + i * 50} y="96" text-anchor="middle" font-size="7" fill="var(--ink-4)">{YEARS[i]}</text>
      {/each}
    </svg>
  </section>

  <section class="dash__breakdown" data-metric="breakdown" data-importance="2">
    <h4>{L.breakdown}</h4>
    <ul class="bars">
      {#each L.schools as s, i (s)}
        <li>
          <span class="bars__label">{s}</span>
          <span class="bars__track"><i style={`inline-size:${(SCHOOL_VALUES[i]! / maxSchool) * 100}%`}></i></span>
          <span class="bars__value">{SCHOOL_VALUES[i]}</span>
        </li>
      {/each}
    </ul>
  </section>

  <section class="dash__table" data-metric="table" data-importance="2">
    <h4>{L.table}</h4>
    <table>
      <thead>
        <tr>{#each L.cols as c (c)}<th scope="col">{c}</th>{/each}</tr>
      </thead>
      <tbody>
        {#each L.rows as row, i (i)}
          <tr>{#each row as cell, j (j)}{#if j === 0}<th scope="row">{cell}</th>{:else}<td>{cell}</td>{/if}{/each}</tr>
        {/each}
      </tbody>
    </table>
  </section>

  <div class="dash__actions" data-metric="actions" data-importance="3">
    {#each L.actions as a, i (a)}
      <button type="button" class:primary={i === 0} tabindex={interactive ? 0 : -1}>{a}</button>
    {/each}
  </div>
</div>

<style>
  /* ═══════════════════════════════════════════════════════════════════
     stage0 —— 素材
     只有内容与最基本的可读性设置。**没有任何布局 CSS。**
     常规流把块级元素撑满、高度由内容决定、超出换行 ——
     它已经在 320px 到 4K 上可读了。这是起点，不是问题。
     ═══════════════════════════════════════════════════════════════════ */
  .dash {
    background: var(--surface-0);
    color: var(--ink-2);
    font-size: 13px;
    line-height: 1.2; /* 浏览器默认量级；stage1 会把它提上去 */
    padding: var(--space-3);
    border-radius: var(--radius);
    container-type: inline-size;
  }
  .dash h3,
  .dash h4 {
    color: var(--ink-1);
  }
  .dash__title {
    font-size: 16px;
  }
  .dash__sub {
    color: var(--ink-4);
    font-size: 11px;
  }
  .dash__badge {
    font-size: 10px;
    padding: 2px var(--space-2);
    border-radius: 3px;
    background: var(--warn-wash);
    color: var(--warn);
    white-space: nowrap;
  }
  .dash__kpis {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .kpi__label {
    color: var(--ink-3);
    font-size: 11px;
    display: block;
  }
  .kpi__value {
    display: block;
    font-variant-numeric: tabular-nums;
    color: var(--ink-1);
    font-size: 16px;
  }
  .kpi__delta {
    font-size: 10px;
    color: var(--good);
  }
  .dash__spark {
    inline-size: 100%;
    block-size: auto;
    max-inline-size: 320px;
  }
  .bars {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .bars__track {
    display: none; /* stage0 没有可视化，只有数字 */
  }
  .bars__track i {
    display: block;
    block-size: 100%;
    background: var(--accent);
  }
  .bars__value {
    font-variant-numeric: tabular-nums;
    color: var(--ink-3);
  }
  .dash table {
    border-collapse: collapse;
    font-size: 11px;
  }
  .dash th,
  .dash td {
    text-align: start;
    padding: 2px var(--space-1);
    border-block-end: 1px solid var(--line-1);
  }
  .dash thead th {
    color: var(--ink-3);
    font-weight: 600;
  }
  .dash__filter span {
    font-size: 10px;
    color: var(--ink-3);
    display: block;
  }
  .dash select {
    font-size: 11px;
  }
  .dash__actions button {
    font-size: 11px;
    padding: 1px var(--space-1); /* stage6 会把它提到 ≥ 32px */
  }

  /* ═══ stage1 内容层 ═════════════════════════════════════════════════
     行长、行距、内在尺寸。还没有任何「设计」，但它已经是一份合格文档。 */
  .dash[data-s='1'],
  .dash[data-s='2'],
  .dash[data-s='3'],
  .dash[data-s='4'],
  .dash[data-s='5'],
  .dash[data-s='6'] {
    line-height: 1.7;
  }
  [data-s='1'] .dash__summary,
  [data-s='2'] .dash__summary,
  [data-s='3'] .dash__summary,
  [data-s='4'] .dash__summary,
  [data-s='5'] .dash__summary,
  [data-s='6'] .dash__summary {
    /* 行长回到舒适区；min() 保证窄屏永不溢出 */
    max-inline-size: min(100%, 68ch);
  }
  [data-s='1'] .kpi,
  [data-s='2'] .kpi,
  [data-s='3'] .kpi,
  [data-s='4'] .kpi,
  [data-s='5'] .kpi,
  [data-s='6'] .kpi,
  [data-s='1'] .bars__label,
  [data-s='2'] .bars__label,
  [data-s='3'] .bars__label,
  [data-s='4'] .bars__label,
  [data-s='5'] .bars__label,
  [data-s='6'] .bars__label {
    /* 内在尺寸：高度由内容决定，长学院名永远不必被截断 */
    block-size: auto;
    min-inline-size: 0;
    text-wrap: pretty;
  }

  /* ═══ stage2 间距层 ═════════════════════════════════════════════════
     三级间距（48 / 24 / 8），相邻比值 ≥ 2；用面色而不是边框表达共同区域。 */
  .dash[data-s='2'],
  .dash[data-s='3'],
  .dash[data-s='4'],
  .dash[data-s='5'],
  .dash[data-s='6'] {
    display: grid;
    gap: var(--space-7); /* 48px —— 区块之间 */
    padding: var(--space-5);
  }
  [data-s='2'] .dash__head,
  [data-s='3'] .dash__head,
  [data-s='4'] .dash__head,
  [data-s='5'] .dash__head,
  [data-s='6'] .dash__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-3);
  }
  [data-s='2'] .dash__filters,
  [data-s='3'] .dash__filters,
  [data-s='4'] .dash__filters,
  [data-s='5'] .dash__filters,
  [data-s='6'] .dash__filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
  }
  [data-s='2'] .dash__kpis,
  [data-s='3'] .dash__kpis,
  [data-s='4'] .dash__kpis,
  [data-s='5'] .dash__kpis,
  [data-s='6'] .dash__kpis {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-5); /* 24px —— 同级之间 */
  }
  [data-s='2'] .kpi,
  [data-s='3'] .kpi,
  [data-s='4'] .kpi,
  [data-s='5'] .kpi,
  [data-s='6'] .kpi {
    display: grid;
    gap: var(--space-2); /* 8px —— 卡片内部 */
    flex: 1 1 8rem;
    padding: var(--space-3);
    background: var(--surface-1); /* 共同区域：用面，不用线 */
    border-radius: var(--radius-sm);
  }
  [data-s='2'] .dash__trend,
  [data-s='2'] .dash__breakdown,
  [data-s='2'] .dash__table,
  [data-s='3'] .dash__trend,
  [data-s='3'] .dash__breakdown,
  [data-s='3'] .dash__table,
  [data-s='4'] .dash__trend,
  [data-s='4'] .dash__breakdown,
  [data-s='4'] .dash__table,
  [data-s='5'] .dash__trend,
  [data-s='5'] .dash__breakdown,
  [data-s='5'] .dash__table,
  [data-s='6'] .dash__trend,
  [data-s='6'] .dash__breakdown,
  [data-s='6'] .dash__table {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--surface-1);
    border-radius: var(--radius-sm);
  }
  [data-s='2'] .bars,
  [data-s='3'] .bars,
  [data-s='4'] .bars,
  [data-s='5'] .bars,
  [data-s='6'] .bars {
    display: grid;
    gap: var(--space-2);
  }
  [data-s='2'] .bars li,
  [data-s='3'] .bars li,
  [data-s='4'] .bars li,
  [data-s='5'] .bars li,
  [data-s='6'] .bars li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 5rem auto;
    gap: var(--space-2);
    align-items: center;
    font-size: 11px;
  }
  [data-s='2'] .bars__track,
  [data-s='3'] .bars__track,
  [data-s='4'] .bars__track,
  [data-s='5'] .bars__track,
  [data-s='6'] .bars__track {
    display: block;
    block-size: 6px;
    background: var(--surface-3);
    border-radius: 3px;
    overflow: hidden;
  }
  [data-s='2'] .dash__actions,
  [data-s='3'] .dash__actions,
  [data-s='4'] .dash__actions,
  [data-s='5'] .dash__actions,
  [data-s='6'] .dash__actions {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
  [data-s='2'] h4,
  [data-s='3'] h4,
  [data-s='4'] h4,
  [data-s='5'] h4,
  [data-s='6'] h4 {
    font-size: 12px;
  }

  /* ═══ stage3 尺度层 ═════════════════════════════════════════════════
     12 列网格 + 8pt 标尺 + 音阶。卡片宽度由「占几列」推导。 */
  .dash[data-s='3'],
  .dash[data-s='4'],
  .dash[data-s='5'],
  .dash[data-s='6'] {
    max-inline-size: var(--grid-max);
    margin-inline: auto;
  }
  [data-s='3'] .dash__kpis,
  [data-s='4'] .dash__kpis {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
  [data-s='3'] .kpi,
  [data-s='4'] .kpi {
    grid-column: span 3; /* 12 / 4 —— 有理由的宽度 */
  }
  [data-s='3'] .kpi__value,
  [data-s='4'] .kpi__value {
    font-size: var(--step-1); /* 音阶档位，不是任意值 */
  }
  [data-s='3'] .dash__title,
  [data-s='4'] .dash__title,
  [data-s='5'] .dash__title,
  [data-s='6'] .dash__title {
    font-size: var(--step-2);
  }
  [data-s='3'] .dash__filter,
  [data-s='4'] .dash__filter,
  [data-s='5'] .dash__filter,
  [data-s='6'] .dash__filter {
    flex: 1 1 8rem;
    min-inline-size: 0;
  }

  /* ═══ stage4 结构层 ═════════════════════════════════════════════════
     areas 骨架。六行字符画就是页面地图。 */
  .dash[data-s='4'],
  .dash[data-s='5'],
  .dash[data-s='6'] {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: var(--space-5);
    grid-template-areas:
      'head head head head head head head head head head head head'
      'filt filt filt filt filt filt filt filt filt filt filt filt'
      'summ summ summ summ summ summ summ summ summ summ summ summ'
      'kpis kpis kpis kpis kpis kpis kpis kpis kpis kpis kpis kpis'
      'trnd trnd trnd trnd trnd trnd trnd brkd brkd brkd brkd brkd'
      'tabl tabl tabl tabl tabl tabl tabl tabl acts acts acts acts';
  }
  [data-s='4'] .dash__head,
  [data-s='5'] .dash__head,
  [data-s='6'] .dash__head {
    grid-area: head;
  }
  [data-s='4'] .dash__filters,
  [data-s='5'] .dash__filters,
  [data-s='6'] .dash__filters {
    grid-area: filt;
    /* 与图表区之间那一级分隔：间距不够时，用最便宜的一条线补强 */
    padding-block-end: var(--space-6);
    border-block-end: 1px solid var(--line-1);
  }
  [data-s='4'] .dash__summary,
  [data-s='5'] .dash__summary,
  [data-s='6'] .dash__summary {
    grid-area: summ;
  }
  [data-s='4'] .dash__kpis,
  [data-s='5'] .dash__kpis,
  [data-s='6'] .dash__kpis {
    grid-area: kpis;
  }
  [data-s='4'] .dash__trend,
  [data-s='5'] .dash__trend,
  [data-s='6'] .dash__trend {
    grid-area: trnd;
  }
  [data-s='4'] .dash__breakdown,
  [data-s='5'] .dash__breakdown,
  [data-s='6'] .dash__breakdown {
    grid-area: brkd;
  }
  [data-s='4'] .dash__table,
  [data-s='5'] .dash__table,
  [data-s='6'] .dash__table {
    grid-area: tabl;
  }
  [data-s='4'] .dash__actions,
  [data-s='5'] .dash__actions,
  [data-s='6'] .dash__actions {
    grid-area: acts;
    align-items: flex-end;
    justify-content: flex-end;
  }

  /* ═══ stage5 视觉层 ═════════════════════════════════════════════════
     三级层级：尺寸 × 留白 × 对比度同时发力。装饰做减法。 */
  .dash[data-s='5'],
  .dash[data-s='6'] {
    background: var(--surface-2);
  }
  [data-s='5'] .dash__kpis,
  [data-s='6'] .dash__kpis {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 9.5rem), 1fr));
  }
  [data-s='5'] .kpi,
  [data-s='6'] .kpi {
    grid-column: auto;
  }
  [data-s='5'] .kpi[data-rank='primary'],
  [data-s='6'] .kpi[data-rank='primary'] {
    grid-column: span 2; /* ① 尺寸：双倍 */
    padding: var(--space-5); /* ② 留白：双倍呼吸 */
  }
  [data-s='5'] .kpi[data-rank='primary'] .kpi__value,
  [data-s='6'] .kpi[data-rank='primary'] .kpi__value {
    font-size: var(--step-4); /* ③ 字号：跳四档 */
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--ink-1);
  }
  [data-s='5'] .kpi[data-rank='secondary'] .kpi__value,
  [data-s='6'] .kpi[data-rank='secondary'] .kpi__value {
    font-size: var(--step-2);
    font-weight: 650;
    color: var(--ink-1);
  }
  [data-s='5'] .kpi[data-rank='tertiary'] .kpi__value,
  [data-s='6'] .kpi[data-rank='tertiary'] .kpi__value {
    font-size: var(--step-0);
    font-weight: 600;
    color: var(--ink-3); /* ④ 对比度：降一级，让它退到背景里 */
  }

  /* ═══ stage6 适应层 ═════════════════════════════════════════════════
     容器查询 + 流体音阶 + 稳定性与目标尺寸。 */
  [data-s='6'] .kpi[data-rank='primary'] .kpi__value {
    /* 跟着容器宽度走，而不是视口 —— 放进侧栏也正确 */
    font-size: clamp(1.75rem, 1rem + 3cqi, 2.75rem);
  }
  [data-s='6'] .dash__spark {
    aspect-ratio: 320 / 96; /* 数据到达前占好位，CLS = 0 */
    max-inline-size: none;
  }
  [data-s='6'] .dash__actions button,
  [data-s='6'] select {
    min-block-size: 32px; /* WCAG 2.5.8 的 24px 之上再留余量 */
    min-inline-size: 64px;
    padding: var(--space-2) var(--space-3);
    border: var(--hairline) solid var(--line-2);
    border-radius: var(--radius-sm);
    background: var(--surface-1);
    color: var(--ink-2);
    cursor: pointer;
  }
  [data-s='6'] .dash__actions button.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }
  [data-s='6'] .dash__table table {
    content-visibility: auto;
    contain-intrinsic-size: auto 120px;
  }
  /* 唯一一条查询，值来自实测的内容断点 624px，而不是某台设备 */
  @container (max-width: 39rem) {
    .dash[data-s='6'] {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas: 'head' 'filt' 'summ' 'kpis' 'trnd' 'brkd' 'tabl' 'acts';
    }
  }
</style>
