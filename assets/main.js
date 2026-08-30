(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Header scroll state ---- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function(){
      if (window.scrollY > 20) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    document.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
  }

  /* ---- Mobile menu ---- */
  var toggle = document.getElementById('menuToggle');
  var navLinks = document.getElementById('navLinks');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function(){
      var isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Portfolio filter (only present on work.html) ---- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.work-card');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      cards.forEach(function(card){
        var match = filter === 'all' || card.getAttribute('data-cat') === filter;
        card.classList.toggle('hide', !match);
      });
    });
  });

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.15 });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---- Counters (only present on index.html / impact.html) ---- */
  var counters = document.querySelectorAll('.impact-num');
  var animateCounter = function(el){
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = prefix + target + suffix; return; }
    var start = 0;
    var duration = 1400;
    var startTime = null;
    var step = function(ts){
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(start + (target - start) * eased);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    var counterIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold:0.5 });
    counters.forEach(function(el){ counterIO.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---- Contact form (only present on contact.html) ---- */
  var form = document.getElementById('projectForm');
  var success = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (success) success.classList.add('show');
      form.reset();
    });
  }

  /* ---- Footer year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Hero cactus-spine canvas (only present on index.html) ---- */
  var canvas = document.getElementById('spines');
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h, spines = [];
    var mouse = { x:0.5, y:0.3 };

    function resize(){
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      buildSpines();
    }

    function buildSpines(){
      spines = [];
      var count = w < 700 ? 22 : 42;
      for (var i=0; i<count; i++){
        spines.push({
          x: Math.random()*w,
          y: Math.random()*h,
          len: 40 + Math.random()*110,
          angle: (Math.random()*0.6 - 0.3) + Math.PI/2,
          speed: 0.15 + Math.random()*0.25,
          drift: Math.random()*Math.PI*2,
          opacity: 0.06 + Math.random()*0.18,
          color: Math.random() > 0.75 ? '163,230,53' : '16,185,129'
        });
      }
    }

    function draw(){
      ctx.clearRect(0,0,w,h);
      spines.forEach(function(s){
        s.drift += 0.003;
        var sway = Math.sin(s.drift) * 8;
        var mx = (mouse.x - 0.5) * 24;
        var my = (mouse.y - 0.5) * 24;
        var x1 = s.x + mx, y1 = s.y + my;
        var x2 = x1 + Math.cos(s.angle) * s.len + sway;
        var y2 = y1 + Math.sin(s.angle) * s.len;
        var grad = ctx.createLinearGradient(x1,y1,x2,y2);
        grad.addColorStop(0, 'rgba(' + s.color + ',' + s.opacity + ')');
        grad.addColorStop(1, 'rgba(' + s.color + ',0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
      });
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize, { passive:true });
    window.addEventListener('mousemove', function(e){
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    }, { passive:true });

    resize();
    requestAnimationFrame(draw);
  }

  /* ---- Interactive background cactus (parallax + cursor-proximity glow) ---- */
  var cactusEls = document.querySelectorAll('.cactus-decor');
  if (cactusEls.length) {
    if (reduceMotion) {
      cactusEls.forEach(function(el){ el.style.opacity = ''; });
    } else {
      var px = window.innerWidth / 2, py = window.innerHeight / 2;
      var targetX = 0, targetY = 0, curX = 0, curY = 0;

      window.addEventListener('mousemove', function(e){
        px = e.clientX; py = e.clientY;
        targetX = (e.clientX / window.innerWidth) - 0.5;
        targetY = (e.clientY / window.innerHeight) - 0.5;
      }, { passive:true });

      window.addEventListener('touchmove', function(e){
        if (!e.touches || !e.touches[0]) return;
        px = e.touches[0].clientX; py = e.touches[0].clientY;
        targetX = (px / window.innerWidth) - 0.5;
        targetY = (py / window.innerHeight) - 0.5;
      }, { passive:true });

      var cactusLoop = function(){
        curX += (targetX - curX) * 0.06;
        curY += (targetY - curY) * 0.06;

        cactusEls.forEach(function(el){
          var amp = parseFloat(el.getAttribute('data-amp')) || 18;
          var rot = parseFloat(el.getAttribute('data-rot')) || 2;
          el.style.transform =
            'translate(' + (curX * amp).toFixed(2) + 'px,' + (curY * amp * 0.6).toFixed(2) + 'px) ' +
            'rotate(' + (curX * rot).toFixed(2) + 'deg)';

          var rect = el.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var dist = Math.hypot(px - cx, py - cy);
          var proximity = Math.max(0, 1 - dist / 640); // 0 far -> 1 close
          var baseOpacity = el.classList.contains('cactus-decor--page') ? 0.13 : 0.16;
          el.style.opacity = (baseOpacity + proximity * 0.4).toFixed(3);
          el.style.filter = 'drop-shadow(0 0 ' + (22 + proximity * 46).toFixed(0) + 'px rgba(16,185,129,' + (0.22 + proximity * 0.4).toFixed(2) + '))';
        });

        requestAnimationFrame(cactusLoop);
      };
      requestAnimationFrame(cactusLoop);
    }
  }
})();
