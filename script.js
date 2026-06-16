(function () {
  'use strict';

  // ---- Password gate ----
  // Change this to whatever password you want her to enter.
  var SITE_PASSWORD = 'Buddy';

  var lockScreen = document.getElementById('lock-screen');
  var lockForm = document.getElementById('lock-form');
  var lockInput = document.getElementById('lock-input');
  var lockError = document.getElementById('lock-error');
  var siteMain = document.getElementById('site-main');

  function unlockSiteAccess(skipAnimation) {
    document.body.classList.remove('is-locked');
    if (siteMain) siteMain.removeAttribute('aria-hidden');

    if (lockScreen) {
      if (skipAnimation) {
        lockScreen.hidden = true;
      } else {
        lockScreen.classList.add('is-unlocking');
        setTimeout(function () {
          lockScreen.hidden = true;
        }, 400);
      }
    }

    try {
      sessionStorage.setItem('poorani-site-unlocked', 'true');
    } catch (e) {
      // sessionStorage unavailable — she'll just re-enter the password next visit.
    }
  }

  try {
    if (sessionStorage.getItem('poorani-site-unlocked') === 'true') {
      unlockSiteAccess(true);
    }
  } catch (e) {
    // ignore
  }

  if (lockForm) {
    lockForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var entered = (lockInput ? lockInput.value : '').trim().toLowerCase();

      if (entered === SITE_PASSWORD.trim().toLowerCase()) {
        unlockSiteAccess(false);
      } else {
        if (lockError) lockError.hidden = false;
        if (lockInput) {
          lockInput.value = '';
          lockInput.focus();
        }
        var card = document.querySelector('.lock-card');
        if (card) {
          card.classList.add('shake');
          setTimeout(function () {
            card.classList.remove('shake');
          }, 400);
        }
      }
    });
  }

  // ---- Target unlock moment: June 17, 2026, 12:00 AM IST ----
  var TARGET_TIME = new Date('2026-06-17T00:00:00+05:30').getTime();
  var unlocked = false;

  var els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs'),
    status: document.getElementById('build-status'),
    celebrateBtn: document.getElementById('celebrate-btn'),
    lockedModal: document.getElementById('locked-modal'),
    lockedClose: document.getElementById('locked-close'),
    lockedCountdown: document.getElementById('locked-countdown'),
    overlay: document.getElementById('celebration-overlay'),
    overlayClose: document.getElementById('overlay-close'),
    audio: document.getElementById('bday-song'),
    confettiContainer: document.getElementById('confetti-container')
  };

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function setCountdownText(d, h, m, s) {
    if (els.days) els.days.textContent = pad(d);
    if (els.hours) els.hours.textContent = pad(h);
    if (els.mins) els.mins.textContent = pad(m);
    if (els.secs) els.secs.textContent = pad(s);
    if (els.lockedCountdown) {
      els.lockedCountdown.textContent = d + 'd ' + pad(h) + 'h ' + pad(m) + 'm ' + pad(s) + 's';
    }
  }

  function tick() {
    var now = Date.now();
    var diff = TARGET_TIME - now;

    if (diff <= 0) {
      if (!unlocked) {
        unlocked = true;
        document.body.classList.add('is-unlocked');
        if (els.status) els.status.textContent = '✓ Build succeeded — celebration deployed';
      }
      setCountdownText(0, 0, 0, 0);
      return;
    }

    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);
    setCountdownText(days, hours, mins, secs);
  }

  tick();
  setInterval(tick, 1000);

  // ---- Locked modal ----
  function openLockedModal() {
    if (!els.lockedModal) return;
    els.lockedModal.hidden = false;
    requestAnimationFrame(function () {
      els.lockedModal.classList.add('is-visible');
    });
  }

  function closeLockedModal() {
    if (!els.lockedModal) return;
    els.lockedModal.classList.remove('is-visible');
    setTimeout(function () {
      els.lockedModal.hidden = true;
    }, 200);
  }

  // ---- Confetti ----
  function launchConfetti() {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !els.confettiContainer) return;

    var colors = ['#E8A23D', '#E3B7C0', '#C75D3B', '#F6EEE2', '#3E7A73'];

    for (var i = 0; i < 70; i++) {
      var piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 0.6 + 's';
      piece.style.animationDuration = 2.5 + Math.random() * 1.5 + 's';
      els.confettiContainer.appendChild(piece);
    }

    setTimeout(function () {
      els.confettiContainer.innerHTML = '';
    }, 4500);
  }

  // ---- Celebration overlay ----
  function openCelebration() {
    if (!els.overlay) return;
    els.overlay.hidden = false;
    requestAnimationFrame(function () {
      els.overlay.classList.add('is-visible');
    });
    launchConfetti();

    if (els.audio) {
      els.audio.currentTime = 0;
      els.audio.play().catch(function () {
        // Autoplay blocked, or song.mp3 hasn't been added yet — fail silently.
      });
    }
  }

  function closeCelebration() {
    if (!els.overlay) return;
    els.overlay.classList.remove('is-visible');
    if (els.audio) els.audio.pause();
    setTimeout(function () {
      els.overlay.hidden = true;
    }, 300);
  }

  if (els.celebrateBtn) {
    els.celebrateBtn.addEventListener('click', function () {
      if (unlocked) {
        openCelebration();
      } else {
        openLockedModal();
      }
    });
  }

  if (els.lockedClose) els.lockedClose.addEventListener('click', closeLockedModal);
  if (els.overlayClose) els.overlayClose.addEventListener('click', closeCelebration);

  // ---- Emoji-reveal quote & joke cards ----
  var revealCards = document.querySelectorAll('.quote-card, .joke-card');
  for (var i = 0; i < revealCards.length; i++) {
    revealCards[i].addEventListener('click', function () {
      var isRevealed = this.classList.toggle('is-revealed');
      this.setAttribute('aria-expanded', isRevealed ? 'true' : 'false');
    });
  }
})();
