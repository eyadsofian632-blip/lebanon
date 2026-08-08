/* =========================================================
   ELBAKRI OVERSEAS — Lebanon Group Trip
   Vanilla JS · no dependencies
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Config ---------- */
  var WHATSAPP    = '201225279820'; // 012 2527 9820
  var WA_DEFAULT  = 'مرحبًا، أريد الاستفسار عن رحلة لبنان من 2 إلى 7 سبتمبر.';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     Image fallbacks — a missing file becomes a labelled plate
     instead of a broken image icon.
     ========================================================= */
  function markMissing(img) {
    var host = img.parentElement;
    if (!host) return;
    host.classList.add('is-missing');
    if (!host.hasAttribute('data-label')) {
      host.setAttribute('data-label', img.getAttribute('alt') || 'صورة قادمة');
    }
    var zoomable = img.hasAttribute('data-zoom');
    if (zoomable) { host.style.cursor = 'default'; }
  }

  function watchShots() {
    $$('[data-shot]').forEach(function (img) {
      if (img.complete) {
        if (img.naturalWidth === 0) markMissing(img);
        return;
      }
      img.addEventListener('error', function () { markMissing(img); }, { once: true });
    });

    // The logo must never be substituted with text — hide its plate if absent.
    $$('[data-logo]').forEach(function (img) {
      var fail = function () {
        var plate = img.closest('.brand__plate');
        if (plate) plate.classList.add('is-empty');
        img.style.display = 'none';
      };
      if (img.complete) { if (img.naturalWidth === 0) fail(); return; }
      img.addEventListener('error', fail, { once: true });
    });
  }

  /* =========================================================
     Navbar
     ========================================================= */
  function navbar() {
    var nav    = $('#nav');
    var toggle = $('#navToggle');
    var menu   = $('#mobileMenu');
    if (!nav) return;

    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!toggle || !menu) return;

    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
      menu.hidden = !open;
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* =========================================================
     Reveal on scroll
     ========================================================= */
  function reveals() {
    var items = $$('.reveal');
    if (!items.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* =========================================================
     Sticky mobile booking bar — appears past the hero,
     hides once the booking form is on screen.
     ========================================================= */
  function stickybar() {
    var bar  = $('#stickybar');
    var hero = $('#hero');
    var book = $('#book');
    if (!bar || !hero) return;

    bar.hidden = false;
    var pastHero = false;
    var atForm   = false;

    var sync = function () { bar.classList.toggle('is-on', pastHero && !atForm); };

    if (!('IntersectionObserver' in window)) return;

    new IntersectionObserver(function (e) {
      pastHero = !e[0].isIntersecting;
      sync();
    }, { threshold: 0 }).observe(hero);

    if (book) {
      new IntersectionObserver(function (e) {
        atForm = e[0].isIntersecting;
        sync();
      }, { threshold: 0.15 }).observe(book);
    }
  }

  /* =========================================================
     Pricing CTA → preselect room type in the form
     ========================================================= */
  function roomPrefill() {
    $$('[data-room]').forEach(function (link) {
      link.addEventListener('click', function () {
        var select = $('#room');
        if (select) select.value = link.getAttribute('data-room');
      });
    });
  }

  /* =========================================================
     Carousel
     ========================================================= */
  function carousel() {
    $$('[data-carousel]').forEach(function (root) {
      var track = $('.carousel__track', root);
      var prev  = $('[data-dir="prev"]', root);
      var next  = $('[data-dir="next"]', root);
      if (!track) return;

      var step = function () {
        var first = track.firstElementChild;
        return first ? first.getBoundingClientRect().width + 14 : track.clientWidth * 0.85;
      };

      // RTL: scrollLeft runs negative in most engines, so use signed deltas.
      var go = function (dir) {
        var sign = dir === 'next' ? -1 : 1;
        track.scrollBy({ left: sign * step(), behavior: reduced ? 'auto' : 'smooth' });
      };

      if (prev) prev.addEventListener('click', function () { go('prev'); });
      if (next) next.addEventListener('click', function () { go('next'); });

      var sync = function () {
        var max  = track.scrollWidth - track.clientWidth;
        var pos  = Math.abs(track.scrollLeft);
        if (prev) prev.disabled = pos <= 2;
        if (next) next.disabled = pos >= max - 2;
      };
      sync();
      track.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync, { passive: true });

      track.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); go('next'); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go('prev'); }
      });
    });
  }

  /* =========================================================
     Lightbox
     ========================================================= */
  function lightbox() {
    var box   = $('#lightbox');
    var img   = $('#lbImg');
    var cap   = $('#lbCap');
    var close = $('#lbClose');
    if (!box || !img) return;

    var pool  = [];
    var index = 0;
    var lastFocus = null;

    var refresh = function () {
      pool = $$('[data-zoom]').filter(function (el) {
        return !el.parentElement.classList.contains('is-missing');
      });
    };

    var render = function () {
      var src = pool[index];
      if (!src) return;
      img.src = src.currentSrc || src.src;
      img.alt = src.alt || '';
      if (cap) cap.textContent = src.alt || '';
    };

    var open = function (el) {
      refresh();
      index = pool.indexOf(el);
      if (index < 0) return;
      lastFocus = document.activeElement;
      box.hidden = false;
      document.body.classList.add('is-locked');
      render();
      requestAnimationFrame(function () { box.classList.add('is-on'); });
      if (close) close.focus();
    };

    var shut = function () {
      box.classList.remove('is-on');
      document.body.classList.remove('is-locked');
      window.setTimeout(function () {
        box.hidden = true;
        img.src = '';
      }, reduced ? 0 : 240);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    var move = function (delta) {
      if (!pool.length) return;
      index = (index + delta + pool.length) % pool.length;
      render();
    };

    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-zoom]');
      if (!el || el.parentElement.classList.contains('is-missing')) return;
      open(el);
    });

    if (close) close.addEventListener('click', shut);
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.classList.contains('lightbox__fig')) shut();
    });
    $$('[data-lb]', box).forEach(function (btn) {
      btn.addEventListener('click', function () {
        move(btn.getAttribute('data-lb') === 'next' ? 1 : -1);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape')     shut();
      if (e.key === 'ArrowLeft')  move(1);
      if (e.key === 'ArrowRight') move(-1);
    });
  }

  /* =========================================================
     Booking form → WhatsApp
     ========================================================= */
  function bookingForm() {
    var form  = $('#bookForm');
    var done  = $('#formDone');
    var again = $('#formReset');
    var wa    = $('#waFallback');
    if (!form) return;

    var showError = function (name, on) {
      var msg = $('[data-err="' + name + '"]', form);
      var field = $('#' + name, form);
      if (msg) msg.hidden = !on;
      if (field && field.parentElement) field.parentElement.classList.toggle('has-err', on);
      if (field) field.setAttribute('aria-invalid', on ? 'true' : 'false');
    };

    var digits = function (v) { return (v || '').replace(/[^\d]/g, ''); };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name       = $('#fullName').value.trim();
      var phone      = $('#phone').value.trim();
      var travellers = $('#travellers').value.trim();
      var room       = $('#room').value;

      var okName  = name.length >= 3;
      var okPhone = digits(phone).length >= 8;
      var okCount = Number(travellers) >= 1;

      showError('fullName', !okName);
      showError('phone', !okPhone);
      showError('travellers', !okCount);

      if (!okName || !okPhone || !okCount) {
        var bad = $('.has-err input', form);
        if (bad) bad.focus();
        return;
      }

      var lines = [
        WA_DEFAULT,
        '',
        'الاسم: ' + name,
        'رقم الهاتف: ' + phone,
        'عدد المسافرين: ' + travellers
      ];
      if (room) lines.push('نوع الغرفة: ' + room);

      var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
      if (wa) wa.href = url;

      form.hidden = true;
      if (done) {
        done.hidden = false;
        done.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      }

      window.open(url, '_blank', 'noopener');
    });

    if (again) {
      again.addEventListener('click', function () {
        form.reset();
        ['fullName', 'phone', 'travellers'].forEach(function (n) { showError(n, false); });
        if (done) done.hidden = true;
        form.hidden = false;
        $('#fullName').focus();
      });
    }
  }

  /* =========================================================
     Misc
     ========================================================= */
  function year() {
    var el = $('#year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------- Boot ---------- */
  function init() {
    watchShots();
    navbar();
    reveals();
    stickybar();
    roomPrefill();
    carousel();
    lightbox();
    bookingForm();
    year();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
