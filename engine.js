/* Clinical case game engine — data-driven, no dependencies, no storage. */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  function computeMax(c) {
    let max = 0;
    c.nodes.forEach((n) => {
      if (n.countInMax === false) return;
      if (n.type === 'hub') {
        n.choices.forEach((ch) => { if (!ch.to && ch.points > 0) max += ch.points; });
      } else if (n.type === 'single') {
        const best = Math.max(0, ...n.choices.map((ch) => ch.points || 0));
        max += best;
      } else if (n.type === 'multi') {
        n.groups.forEach((g) => g.options.forEach((o) => { if (o.points > 0) max += o.points; }));
      }
    });
    return max;
  }

  function fmtTime(m) {
    const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
    if (d) return 'Day ' + d + (h || mm ? ' + ' + (h ? h + ' h ' : '') + (mm ? mm + ' min' : '') : '');
    return (h ? h + ' h ' : '') + mm + ' min';
  }

  const Game = {
    c: null, nodes: {}, s: null,

    load(caseData) {
      this.c = caseData;
      this.nodes = {};
      caseData.nodes.forEach((n) => { this.nodes[n.id] = n; });
      this.max = computeMax(caseData);
      this.wireRestart();
      this.renderIntro();
    },

    reset(player) {
      this.s = {
        player: player || '',
        node: this.c.start,
        score: 0,
        minutes: 0,
        done: new Set(),
        log: [],          // {phase, label, points, feedback, critical}
        chart: [],        // {title, text, image}
        texts: [],        // {title, prompt, text}
        domains: {},
        startedAt: new Date()
      };
    },

    award(item, phase, domain) {
      const first = !this.s.done.has(item.id);
      let pts = first ? (item.points || 0) : 0;
      // Mutually exclusive answers (e.g., revising a diagnosis): positive points count only above the best already earned in the group.
      if (item.group && pts > 0) {
        this.s.groupBest = this.s.groupBest || {};
        const best = this.s.groupBest[item.group] || 0;
        this.s.groupBest[item.group] = Math.max(best, pts);
        pts = Math.max(0, pts - best);
      }
      this.s.done.add(item.id);
      this.s.score += pts;
      this.s.minutes += item.time || 0;
      const d = domain || item.domain || phase;
      if (pts !== 0) this.s.domains[d] = (this.s.domains[d] || 0) + pts;
      this.s.log.push({ phase: phase, label: item.label, points: pts, feedback: item.feedback || '', critical: !!item.critical && first, repeat: !first });
      this.updateHud();
      return pts;
    },

    updateHud() {
      $('#hud-score').textContent = this.s.score;
      $('#hud-max').textContent = this.max;
      $('#hud-time').textContent = fmtTime(this.s.minutes).trim();
      const n = this.nodes[this.s.node];
      $('#hud-phase').textContent = n ? n.phase : '';
    },

    toast(pts, feedback) {
      const box = $('#feedback');
      box.innerHTML = '';
      if (!feedback && !pts) { box.hidden = true; return; }
      box.hidden = false;
      box.className = 'feedback ' + (pts > 0 ? 'good' : pts < 0 ? 'bad' : 'neutral');
      if (pts) box.appendChild(el('strong', 'pts', (pts > 0 ? '+' : '') + pts + ' pts'));
      if (feedback) box.appendChild(el('span', null, ' ' + feedback));
    },

    addChart(result) {
      if (!result) return;
      if (this.s.chart.some((r) => r.title === result.title)) return;
      this.s.chart.push(result);
      this.renderChart();
    },

    renderChart() {
      const list = $('#chart-list');
      list.innerHTML = '';
      if (!this.s.chart.length) { list.appendChild(el('p', 'muted', 'No findings yet.')); return; }
      // Most recent finding first.
      this.s.chart.slice().reverse().forEach((r, i) => {
        const item = el('div', 'chart-item' + (i === 0 ? ' newest' : ''));
        item.appendChild(el('h4', null, r.title));
        const imgs = r.images || (r.image ? [{ src: r.image, caption: r.imageCaption, link: r.link }] : []);
        imgs.forEach((m) => {
          const fig = el('figure', 'chart-fig');
          const img = el('img', 'chart-img');
          img.src = m.src; img.alt = m.caption || r.title;
          img.onerror = () => fig.remove();
          if (m.link) {
            const a = el('a'); a.href = m.link; a.target = '_blank'; a.rel = 'noopener';
            a.appendChild(img); fig.appendChild(a);
            if (m.caption) {
              const cap = el('figcaption');
              const ca = el('a', null, m.caption); ca.href = m.link; ca.target = '_blank'; ca.rel = 'noopener';
              cap.appendChild(ca); fig.appendChild(cap);
            }
          } else {
            fig.appendChild(img);
            if (m.caption) fig.appendChild(el('figcaption', null, m.caption));
          }
          item.appendChild(fig);
        });
        const p = el('p', 'pre', r.text);
        if (/PROPOSED/.test(r.text)) p.classList.add('proposed');
        item.appendChild(p);
        list.appendChild(item);
      });
    },

    go(id) {
      this.s.node = id;
      this.updateHud();
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    wireRestart() {
      const btn = $('#restart-btn');
      let armed = false, timer = null;
      const disarm = () => { armed = false; btn.classList.remove('armed'); btn.textContent = '↺ Start over'; };
      btn.onclick = () => {
        if (!armed) {
          armed = true;
          btn.classList.add('armed');
          btn.textContent = 'Click again to confirm';
          clearTimeout(timer);
          timer = setTimeout(disarm, 4000);
          return;
        }
        clearTimeout(timer);
        disarm();
        const name = this.s ? this.s.player : '';
        $('#player').value = name;
        this.s = null;
        $('#hud-score').textContent = '0';
        $('#hud-time').textContent = '0 min';
        $('#hud-phase').textContent = '—';
        this.renderIntro();
        window.scrollTo({ top: 0 });
      };
    },

    /* ---------- screens ---------- */
    renderIntro() {
      $('#app').hidden = true;
      $('#restart-btn').hidden = true;
      const intro = $('#intro');
      intro.hidden = false;
      $('#intro-title').textContent = this.c.title;
      $('#intro-sub').textContent = this.c.subtitle;
      $('#intro-summary').textContent = this.c.patient.summary;
      $('#intro-author').textContent = this.c.author;
      const im = this.c.introImage;
      if (im) {
        $('#intro-img').src = im.src;
        $('#intro-img').alt = im.alt || '';
        $('#intro-img-link').href = im.link || im.src;
        $('#intro-cap-link').href = im.link || im.src;
        $('#intro-cap-link').textContent = im.caption || '';
        $('#intro-figure').hidden = false;
      }
      $('#start-btn').onclick = () => {
        this.reset($('#player').value.trim());
        intro.hidden = true;
        $('#app').hidden = false;
        $('#restart-btn').hidden = false;
        $('#case-title').textContent = this.c.title;
        $('#patient-line').textContent = this.c.patient.name + ', ' + this.c.patient.age + ' y — ' + this.c.patient.summary;
        this.renderChart();
        this.toast(0, '');
        this.go(this.c.start);
      };
    },

    render() {
      const n = this.nodes[this.s.node];
      const main = $('#stage');
      main.innerHTML = '';
      main.appendChild(el('div', 'phase-tag', n.phase));
      main.appendChild(el('h2', null, n.title));
      if (n.prompt) main.appendChild(el('p', 'prompt pre', n.prompt));
      if (n.links) {
        const box = el('div', 'links');
        n.links.forEach((l) => {
          const a = el('a', 'video-link', l.label);
          a.href = l.url; a.target = '_blank'; a.rel = 'noopener';
          box.appendChild(a);
        });
        main.appendChild(box);
      }
      if (n.type === 'hub') this.renderHub(n, main);
      else if (n.type === 'single') this.renderSingle(n, main);
      else if (n.type === 'multi') this.renderMulti(n, main);
      else if (n.type === 'text') this.renderText(n, main);
      else if (n.type === 'debrief') this.renderDebrief(main);
    },

    renderHub(n, main) {
      const list = el('div', 'choices');
      n.choices.forEach((ch) => {
        if (ch.requires && !ch.requires.every((r) => this.s.done.has(r))) return;
        if (ch.hideIf && ch.hideIf.some((r) => this.s.done.has(r))) return;
        if (ch.requiresAny && !ch.requiresAny.some((r) => this.s.done.has(r))) return;
        const b = el('button', 'choice' + (ch.to ? ' nav' : ''), ch.label);
        if (!ch.to && this.s.done.has(ch.id)) b.classList.add('done');
        b.onclick = () => {
          if (ch.to) {
            if (ch.points) {
              const p = this.award(ch, n.phase);
              this.toast(p, ch.feedback);
            } else {
              this.s.minutes += ch.time || 0;
              this.s.done.add(ch.id);
              this.s.log.push({ phase: n.phase, label: ch.label, points: 0, feedback: '' });
              this.toast(0, '');
            }
            this.go(ch.to);
            return;
          }
          const pts = this.award(ch, n.phase);
          this.addChart(ch.result);
          this.toast(pts, ch.feedback);
          this.render();
        };
        list.appendChild(b);
      });
      main.appendChild(list);
    },

    renderSingle(n, main) {
      const list = el('div', 'choices');
      n.choices.forEach((ch) => {
        const b = el('button', 'choice', ch.label);
        b.onclick = () => {
          const pts = this.award(ch, n.phase);
          this.toast(pts, ch.feedback);
          this.go(ch.to);
        };
        list.appendChild(b);
      });
      main.appendChild(list);
    },

    renderMulti(n, main) {
      const form = el('form', 'multi');
      n.groups.forEach((g) => {
        const fs = el('fieldset');
        fs.appendChild(el('legend', null, g.name));
        g.options.forEach((o) => {
          const lab = el('label', 'check');
          const cb = el('input');
          cb.type = 'checkbox'; cb.value = o.id;
          lab.appendChild(cb);
          lab.appendChild(el('span', null, o.label));
          fs.appendChild(lab);
        });
        form.appendChild(fs);
      });
      const submit = el('button', 'primary', 'Submit orders');
      submit.type = 'submit';
      form.appendChild(submit);
      form.onsubmit = (ev) => {
        ev.preventDefault();
        const chosen = new Set([...form.querySelectorAll('input:checked')].map((i) => i.value));
        if (!chosen.size) { this.toast(0, 'Select at least one order.'); return; }
        let total = 0;
        const res = el('div', 'results');
        n.groups.forEach((g) => g.options.forEach((o) => {
          const picked = chosen.has(o.id);
          const should = o.points > 0;
          if (picked) total += this.award(o, n.phase, n.domain);
          if (picked || should) {
            const row = el('div', 'res-row ' + (picked ? (o.points > 0 ? 'good' : o.points < 0 ? 'bad' : 'neutral') : 'missed'));
            row.appendChild(el('strong', null, (picked ? '☑ ' : '☐ ') + o.label));
            row.appendChild(el('span', null, (picked ? ' (' + (o.points > 0 ? '+' : '') + o.points + ') ' : ' (missed) ') + o.feedback));
            res.appendChild(row);
          }
        }));
        if (n.teaching) res.appendChild(el('p', 'teaching', 'Teaching point: ' + n.teaching));
        this.s.minutes += 10;
        form.replaceWith(res);
        this.toast(total, 'Orders reviewed — see details below.');
        const next = el('button', 'primary', 'Continue →');
        next.onclick = () => { this.toast(0, ''); this.go(n.next); };
        main.appendChild(next);
      };
      main.appendChild(form);
    },

    renderText(n, main) {
      if (n.afterNote) main.appendChild(el('p', 'teaching', n.afterNote));
      const ta = el('textarea');
      ta.rows = 8; ta.placeholder = n.placeholder || '';
      main.appendChild(ta);
      const b = el('button', 'primary', 'Continue →');
      b.onclick = () => {
        const txt = ta.value.trim();
        if (!txt) { ta.classList.add('err'); ta.focus(); return; }
        this.s.texts.push({ title: n.title, prompt: n.prompt, text: txt });
        this.toast(0, '');
        this.go(n.next);
      };
      main.appendChild(b);
    },

    renderDebrief(main) {
      const s = this.s, c = this.c;
      const pct = Math.max(0, Math.round((s.score / this.max) * 100));
      const head = el('div', 'score-card');
      head.appendChild(el('div', 'big', s.score + ' / ' + this.max));
      head.appendChild(el('div', null, pct + '% — simulated elapsed time: ' + fmtTime(s.minutes).trim()));
      if (s.player) head.appendChild(el('div', 'muted', 'Resident: ' + s.player + ' — ' + s.startedAt.toLocaleString('en-US')));
      main.appendChild(head);

      const crit = s.log.filter((l) => l.critical);
      if (crit.length) {
        main.appendChild(el('h3', null, 'Critical errors'));
        const ul = el('ul', 'crit');
        crit.forEach((l) => ul.appendChild(el('li', null, l.label + ' — ' + l.feedback)));
        main.appendChild(ul);
      }

      main.appendChild(el('h3', null, 'Score by domain'));
      const tb = el('table', 'tbl');
      Object.keys(s.domains).forEach((d) => {
        const tr = el('tr');
        tr.appendChild(el('td', null, d));
        tr.appendChild(el('td', 'num', String(s.domains[d])));
        tb.appendChild(tr);
      });
      main.appendChild(tb);

      main.appendChild(el('h3', null, 'Your path'));
      const ol = el('ol', 'path');
      s.log.forEach((l) => {
        const li = el('li', l.points > 0 ? 'good' : l.points < 0 ? 'bad' : '');
        li.appendChild(el('span', 'ph', '[' + l.phase + '] '));
        li.appendChild(document.createTextNode(l.label + (l.points ? ' (' + (l.points > 0 ? '+' : '') + l.points + ')' : '') + (l.repeat ? ' (repeated)' : '')));
        ol.appendChild(li);
      });
      main.appendChild(ol);

      if (s.texts.length) {
        main.appendChild(el('h3', null, 'Your written answers'));
        s.texts.forEach((t) => {
          const d = el('div', 'written');
          d.appendChild(el('h4', null, t.title));
          d.appendChild(el('p', 'pre', t.text));
          main.appendChild(d);
        });
      }

      main.appendChild(el('h3', null, 'Key teaching points'));
      const kp = el('ul');
      c.keyPoints.forEach((k) => kp.appendChild(el('li', null, k)));
      main.appendChild(kp);

      main.appendChild(el('h3', null, 'References'));
      const rf = el('ol', 'refs');
      c.references.forEach((r) => rf.appendChild(el('li', null, r)));
      main.appendChild(rf);

      const bar = el('div', 'actions');
      const pr = el('button', 'primary', 'Print / save as PDF');
      pr.onclick = () => window.print();
      const again = el('button', null, 'Play again');
      again.onclick = () => this.renderIntro();
      bar.appendChild(pr); bar.appendChild(again);
      main.appendChild(bar);
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    const id = new URLSearchParams(location.search).get('case') || 'case1e';
    const data = (window.CASES || {})[id];
    if (!data) { document.body.textContent = 'Case not found: ' + id; return; }
    window.Game = Game;
    Game.load(data);
  });
})();
