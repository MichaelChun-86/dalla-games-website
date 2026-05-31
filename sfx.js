/* =========================================================================
   AeonSFX — Web Audio API 기반 합성 사운드 (오디오 파일 불필요)
   - 타이핑 클릭음, CRT 전원 꺼짐 "치직", 글리치 지직,
     스팀 버튼 호버/클릭음을 코드로 생성한다.
   - 브라우저 자동재생 정책: 페이지 진입 직후엔 오디오가 막힐 수 있어,
     첫 사용자 제스처(클릭/키/터치)에서 오디오를 활성화한다.
   - 외부 라이브러리 없이 vanilla. 기존 코드/마크업은 건드리지 않는다.
   ========================================================================= */
window.AeonSFX = (function () {
  "use strict";

  var AC = window.AudioContext || window.webkitAudioContext;
  // Web Audio 미지원 환경 → 아무것도 안 하는 더미 반환
  if (!AC) {
    return { type: noop, crt: noop, glitch: noop, hover: noop, click: noop };
  }
  function noop() {}

  var ctx = null;
  function ac() {
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended" && ctx.resume) ctx.resume();
    return ctx;
  }

  // 첫 사용자 제스처에 오디오 잠금 해제(자동재생 정책 대응)
  function unlock() { ac(); }
  ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
    window.addEventListener(ev, unlock, { passive: true });
  });

  // ----- 짧은 톤(주파수 슬라이드 가능) -----
  function tone(opts) {
    var c = ac(); if (!c) return;
    var t0 = c.currentTime;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = opts.type || "square";
    osc.frequency.setValueAtTime(opts.f0, t0);
    if (opts.f1) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.f1), t0 + opts.dur);
    }
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(opts.gain || 0.05, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + opts.dur + 0.02);
  }

  // ----- 화이트 노이즈 버스트("치직") -----
  function noise(dur, gain, filterFreq, highpass) {
    var c = ac(); if (!c) return;
    var t0 = c.currentTime;
    var len = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    var src = c.createBufferSource();
    src.buffer = buf;
    var g = c.createGain();
    g.gain.setValueAtTime(gain || 0.08, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    if (filterFreq) {
      var f = c.createBiquadFilter();
      f.type = highpass ? "highpass" : "lowpass";
      f.frequency.value = filterFreq;
      src.connect(f); f.connect(g);
    } else {
      src.connect(g);
    }
    g.connect(c.destination);
    src.start(t0);
    src.stop(t0 + dur);
  }

  return {
    // 타이핑 클릭(아주 짧고 작게, 매번 음정 살짝 변화)
    type: function () {
      tone({ type: "square", f0: 760 + Math.random() * 500, dur: 0.018, gain: 0.025 });
    },
    // CRT 전원 꺼짐: 하강 톤 + 치직 노이즈
    crt: function () {
      tone({ type: "sawtooth", f0: 900, f1: 50, dur: 0.32, gain: 0.06 });
      noise(0.40, 0.09, 1800, false);
      noise(0.18, 0.05, 3000, true);
    },
    // 글리치 순간 지직
    glitch: function () {
      noise(0.14, 0.06, 2500, true);
    },
    // 스팀 버튼 호버: 짧은 고음 blip
    hover: function () {
      tone({ type: "sine", f0: 880, dur: 0.06, gain: 0.04 });
    },
    // 스팀 버튼 클릭: 두 톤 상승(확인음)
    click: function () {
      tone({ type: "square", f0: 520, dur: 0.07, gain: 0.06 });
      window.setTimeout(function () {
        tone({ type: "square", f0: 820, dur: 0.08, gain: 0.06 });
      }, 60);
    }
  };
})();

/* 스팀 버튼 호버/클릭 사운드 바인딩 (기존 script.js·마크업은 건드리지 않음) */
(function () {
  function bind() {
    var btn = document.querySelector(".steam-btn");
    if (!btn || !window.AeonSFX) return;
    btn.addEventListener("mouseenter", function () { window.AeonSFX.hover(); });
    btn.addEventListener("click", function () { window.AeonSFX.click(); });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
