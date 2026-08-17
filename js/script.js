(function(){
  "use strict";

  /* =========================================================
     Wedding configuration — edit these values to reuse the site
     ========================================================= */
  var WEDDING = {
    groom: "Anoop",
    bride: "Vishnupriya",
    title: "Anoop & Vishnupriya's Wedding",
    description: "Join us as Anoop and Vishnupriya begin their new journey together.",
    timezoneOffset: "+05:30",
    ceremony: {
      label: "Wedding Ceremony",
      date: "2026-08-23",
      start: "10:00",
      end: "10:30",
      venue: "Keyath Garden",
      address: "Keyath Garden, Veemboor - Mariyad School Rd, Manjeri, Pappinippara"
    },
    reception: {
      label: "Wedding Reception",
      date: "2026-08-24",
      start: "17:00",
      end: "22:00",
      venue: "P. Krishnapillai Memorial Auditorium",
      address: "P. Krishnapillai Memorial Auditorium, Kovoor, Kozhikode"
    },
    // Paste your deployed Google Apps Script web app URL here (see google-sheets/README.md)
    rsvpEndpoint: ""
  };

  document.addEventListener("DOMContentLoaded", function(){
    initEntrance();
    initNav();
    initReveal();
    initCountdown();
    initPetals();
    initRSVP();
    initShare();
    initMusic();
    initFabs();
    initGarland();
    initTapForFlower();
  });

  /* ---------------- entrance gate ---------------- */
  function initEntrance(){
    var gate = document.getElementById("entrance");
    var btn = document.getElementById("openInvite");
    if(!gate || !btn) return;
    document.body.classList.add("locked");
    btn.addEventListener("click", function(){
      gate.classList.add("hidden");
      document.body.classList.remove("locked");
      if(startMusicFromGesture) startMusicFromGesture();
      if(enableShakeFromGesture) enableShakeFromGesture();
    });
  }

  /* ---------------- shake for flower shower + hint ---------------- */
  var enableShakeFromGesture = null;
  var lastShake = 0;
  var shakeListening = false;
  var shakeHintTimer = null;
  var HINT_KEY = "anovi-shake-hint";

  function dismissShakeHint(remember){
    var hint = document.getElementById("shake-hint");
    if(!hint) return;
    clearTimeout(shakeHintTimer);
    if(remember){
      try{ sessionStorage.setItem(HINT_KEY, "seen"); }catch(e){}
    }
    if(hint.hidden || !hint.classList.contains("is-on")){
      hint.hidden = true;
      return;
    }
    hint.classList.remove("is-on");
    setTimeout(function(){ hint.hidden = true; }, 450);
  }

  function showShakeHint(){
    var hint = document.getElementById("shake-hint");
    if(!hint || hint.dataset.shown === "1") return;
    hint.dataset.shown = "1";

    try{
      if(sessionStorage.getItem(HINT_KEY) === "seen") return;
    }catch(e){}

    var isTouch =
      (navigator.maxTouchPoints || 0) > 0 ||
      "ontouchstart" in window ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

    var label = hint.querySelector("[data-hint-label]");
    if(label){
      label.textContent = isTouch
        ? "Shake for a flower shower"
        : "Tap here for a flower shower";
    }

    hint.hidden = false;
    requestAnimationFrame(function(){
      hint.classList.add("is-on");
    });

    hint.addEventListener("click", function(){
      spawnPetalShower(24);
      dismissShakeHint(true);
    });

    shakeHintTimer = setTimeout(function(){
      dismissShakeHint(true);
    }, 8000);
  }

  function handleShake(e){
    var acc = e.accelerationIncludingGravity || e.acceleration;
    if(!acc || acc.x == null) return;
    var magnitude = Math.abs(acc.x||0) + Math.abs(acc.y||0) + Math.abs(acc.z||0);
    var now = Date.now();
    if(magnitude > 35 && now - lastShake > 1500){
      lastShake = now;
      spawnPetalShower(24);
      dismissShakeHint(true);
    }
  }

  function attachShakeListener(){
    if(shakeListening) return;
    shakeListening = true;
    window.addEventListener("devicemotion", handleShake, { passive: true });
  }

  enableShakeFromGesture = function(){
    if(typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function"){
      DeviceMotionEvent.requestPermission().then(function(state){
        if(state === "granted") attachShakeListener();
      }).catch(function(){});
    } else {
      attachShakeListener();
    }
    setTimeout(showShakeHint, 900);
  };

  /* ---------------- nav ---------------- */
  function initNav(){
    var nav = document.getElementById("nav");
    var toggle = document.getElementById("navToggle");
    var mobile = document.getElementById("navMobile");
    var closeBtn = document.getElementById("navMobileClose");

    window.addEventListener("scroll", function(){
      if(window.scrollY > 40) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    });

    if(toggle && mobile){
      toggle.addEventListener("click", function(){ mobile.classList.add("open"); });
    }
    if(closeBtn && mobile){
      closeBtn.addEventListener("click", function(){ mobile.classList.remove("open"); });
    }
    mobile && mobile.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ mobile.classList.remove("open"); });
    });

    var links = document.querySelectorAll(".nav-links a, .nav-mobile a");
    var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
    if("IntersectionObserver" in window && sections.length){
      var spy = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            links.forEach(function(l){
              l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach(function(s){ spy.observe(s); });
    }
  }

  /* ---------------- scroll reveal ---------------- */
  function initReveal(){
    var items = document.querySelectorAll("[data-reveal]");
    if(!("IntersectionObserver" in window)){
      items.forEach(function(el){ el.classList.add("in"); });
      return;
    }
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var delay = entry.target.getAttribute("data-reveal-delay") || 0;
          setTimeout(function(){ entry.target.classList.add("in"); }, Number(delay));
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function(el){ obs.observe(el); });
  }

  /* ---------------- countdown ---------------- */
  function initCountdown(){
    var el = document.querySelector("[data-countdown]");
    if(!el) return;
    var target = new Date(el.getAttribute("data-countdown"));
    var days = document.getElementById("cdDays");
    var hours = document.getElementById("cdHours");
    var mins = document.getElementById("cdMins");
    var secs = document.getElementById("cdSecs");

    function tick(){
      var diff = target.getTime() - Date.now();
      if(diff < 0) diff = 0;
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      if(days) days.textContent = String(d).padStart(2,"0");
      if(hours) hours.textContent = String(h).padStart(2,"0");
      if(mins) mins.textContent = String(m).padStart(2,"0");
      if(secs) secs.textContent = String(s).padStart(2,"0");
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------- ambient petals ---------------- */
  function initPetals(){
    setInterval(function(){ spawnPetalShower(1); }, 2200);
  }
  function spawnPetalShower(count){
    for(var i=0;i<count;i++){
      (function(){
        var p = document.createElement("div");
        p.className = "petal";
        p.style.left = Math.random()*100 + "vw";
        var duration = 6 + Math.random()*6;
        p.style.animationDuration = duration + "s";
        p.style.opacity = 0.4 + Math.random()*0.5;
        p.style.transform = "scale(" + (0.6+Math.random()*0.8) + ")";
        document.body.appendChild(p);
        setTimeout(function(){ p.remove(); }, duration*1000 + 200);
      })();
    }
  }

  /* ---------------- garland: pendulum sway + mouse wind ---------------- */
  function initGarland(){
    var strands = Array.prototype.slice.call(document.querySelectorAll(".garland-strand"));
    var hero = document.querySelector(".hero");
    if(!strands.length || !hero) return;

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var data = strands.map(function(el){
      return {
        el: el,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.45,
        idleAmp: 3 + Math.random() * 2.2,
        cx: 0,
        wind: 0
      };
    });

    function recomputeCenters(){
      var heroRect = hero.getBoundingClientRect();
      data.forEach(function(d){
        var r = d.el.getBoundingClientRect();
        d.cx = (r.left + r.width / 2) - heroRect.left;
      });
    }
    recomputeCenters();
    window.addEventListener("resize", recomputeCenters);

    var rawMouseX = null;
    var smoothMouseX = null;
    var targetActive = 0;   // 1 while the pointer is near the garland, 0 otherwise
    var activeAmount = 0;   // eased toward targetActive each frame

    // Listen on the document (not just the hero) so hovering over the
    // fixed nav bar — which visually sits on top of the garland's
    // upper strands — still registers as wind.
    document.addEventListener("mousemove", function(e){
      var heroRect = hero.getBoundingClientRect();
      if(e.clientY < heroRect.top || e.clientY > heroRect.top + 200){
        targetActive = 0;
        return;
      }
      rawMouseX = e.clientX - heroRect.left;
      if(smoothMouseX === null) smoothMouseX = rawMouseX;
      targetActive = 1;
    });
    document.addEventListener("mouseleave", function(){
      targetActive = 0;
    });

    if(reduceMotion){
      return; // leave strands static for users who've asked for reduced motion
    }

    var windRadius = 220;    // how far (px) the wind field reaches, in either direction
    var windStrength = 14;   // peak tilt in degrees
    // Peak of x*exp(-x^2/2) occurs at x=1, value exp(-0.5) — used to normalize
    // the curve below so its true peak equals windStrength.
    var gaussPeak = Math.exp(-0.5);

    var lastT = null;

    function frame(t){
      if(lastT === null) lastT = t;
      var dt = Math.min((t - lastT) / 1000, 0.05); // clamp to avoid big jumps on tab-switch
      lastT = t;
      var seconds = t / 1000;

      // Ease the pointer position and the hover on/off state so nothing
      // ever snaps — both chase their targets at a frame-rate-independent rate.
      var posLerp = 1 - Math.exp(-dt * 10);
      var activeLerp = 1 - Math.exp(-dt * 4);
      if(rawMouseX !== null && smoothMouseX !== null){
        smoothMouseX += (rawMouseX - smoothMouseX) * posLerp;
      }
      activeAmount += (targetActive - activeAmount) * activeLerp;

      var windLerp = 1 - Math.exp(-dt * 6);

      data.forEach(function(d){
        var idle = Math.sin(seconds * d.speed + d.phase) * d.idleAmp;

        var targetWind = 0;
        if(activeAmount > 0.001 && smoothMouseX !== null){
          // Smooth "wake" field: zero directly under the cursor, peaks a
          // little to either side, decays to zero far away — a
          // continuous curve with no sign-flip discontinuity, so a
          // strand's tilt never snaps as the cursor sweeps past it.
          var x = (d.cx - smoothMouseX) / windRadius;
          var shape = x * Math.exp(-(x * x) / 2) / gaussPeak;
          targetWind = shape * windStrength * activeAmount;
        }
        d.wind += (targetWind - d.wind) * windLerp;

        d.el.style.transform = "rotate(" + (idle + d.wind).toFixed(2) + "deg)";
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------- tap / click for a flower burst ---------------- */
  function initTapForFlower(){
    document.addEventListener("click", function(e){
      spawnPetalBurstAt(e.clientX, e.clientY);
    });
    document.addEventListener("touchstart", function(e){
      if(e.touches && e.touches[0]){
        spawnPetalBurstAt(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
  }

  function spawnPetalBurstAt(x, y){
    var count = 8 + Math.floor(Math.random() * 5);
    for(var i = 0; i < count; i++){
      (function(){
        var p = document.createElement("div");
        p.className = "petal-burst";
        p.style.left = x + "px";
        p.style.top = y + "px";
        document.body.appendChild(p);

        var angle = Math.random() * Math.PI * 2;
        var dist = 50 + Math.random() * 90;
        var dx = Math.cos(angle) * dist;
        var dy = Math.sin(angle) * dist * 0.6 + 70;
        var rot = (Math.random() * 360 - 180).toFixed(0);
        var scale = (0.6 + Math.random() * 0.7).toFixed(2);

        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            p.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px) rotate(" + rot + "deg) scale(" + scale + ")";
            p.style.opacity = "0";
          });
        });

        setTimeout(function(){ p.remove(); }, 1300);
      })();
    }
  }

  /* ---------------- RSVP ---------------- */
  function initRSVP(){
    var form = document.getElementById("rsvpForm");
    if(!form) return;
    var guestsBlock = document.getElementById("rsvpGuests");
    var thanks = document.getElementById("rsvpThanks");
    var editBtn = document.getElementById("rsvpEdit");

    form.querySelectorAll('input[name="attending"]').forEach(function(radio){
      radio.addEventListener("change", function(){
        guestsBlock.classList.toggle("open", radio.value === "yes" && radio.checked);
      });
    });

    var cached = localStorage.getItem("rsvp_response");
    if(cached){
      showThanks(JSON.parse(cached));
    }

    form.addEventListener("submit", function(e){
      e.preventDefault();
      var data = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        attending: form.querySelector('input[name="attending"]:checked') ? form.querySelector('input[name="attending"]:checked').value : "yes",
        adults: form.adults ? form.adults.value : "",
        children: form.children ? form.children.value : "",
        message: form.message.value.trim(),
        submittedAt: new Date().toISOString()
      };
      if(!data.name || !data.phone){
        alert("Please share your name and phone number so we can reach you.");
        return;
      }
      localStorage.setItem("rsvp_response", JSON.stringify(data));

      if(WEDDING.rsvpEndpoint){
        fetch(WEDDING.rsvpEndpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }).catch(function(){ /* localStorage already has it as fallback */ });
      }

      showThanks(data);
    });

    function showThanks(data){
      form.style.display = "none";
      thanks.classList.add("show");
      var nameEl = document.getElementById("rsvpThanksName");
      if(nameEl) nameEl.textContent = data.name || "";
    }

    if(editBtn){
      editBtn.addEventListener("click", function(){
        thanks.classList.remove("show");
        form.style.display = "";
      });
    }
  }

  /* ---------------- share + calendar ---------------- */
  function initShare(){
    var waBtn = document.getElementById("shareWhatsapp");
    var copyBtn = document.getElementById("shareCopy");
    var calBtn = document.getElementById("shareCalendar");

    if(waBtn){
      waBtn.addEventListener("click", function(){
        var text = encodeURIComponent(WEDDING.groom + " & " + WEDDING.bride + " are getting married! " + window.location.href);
        window.open("https://wa.me/?text=" + text, "_blank");
      });
    }
    if(copyBtn){
      copyBtn.addEventListener("click", function(){
        navigator.clipboard.writeText(window.location.href).then(function(){
          var original = copyBtn.textContent;
          copyBtn.textContent = "Link copied!";
          setTimeout(function(){ copyBtn.textContent = original; }, 2000);
        });
      });
    }
    if(calBtn){
      calBtn.addEventListener("click", openGoogleCalendar);
    }
  }

  function pad(n){ return String(n).padStart(2,"0"); }

  function toUTCStamp(dateStr, timeStr){
    var d = new Date(dateStr + "T" + timeStr + ":00" + WEDDING.timezoneOffset);
    return d.getUTCFullYear() + pad(d.getUTCMonth()+1) + pad(d.getUTCDate()) + "T" +
           pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
  }

  function googleCalendarUrl(ev){
    var text = WEDDING.groom + " & " + WEDDING.bride + " — " + ev.label;
    var dates = toUTCStamp(ev.date, ev.start) + "/" + toUTCStamp(ev.date, ev.end);
    var details = WEDDING.description
      + "\n\nCeremony: " + WEDDING.ceremony.venue + " — " + WEDDING.ceremony.date + " " + WEDDING.ceremony.start + "–" + WEDDING.ceremony.end
      + "\nReception: " + WEDDING.reception.venue + " — " + WEDDING.reception.date + " " + WEDDING.reception.start + "–" + WEDDING.reception.end
      + "\n\n" + window.location.href;
    return "https://calendar.google.com/calendar/render?action=TEMPLATE"
      + "&text=" + encodeURIComponent(text)
      + "&dates=" + dates
      + "&details=" + encodeURIComponent(details)
      + "&location=" + encodeURIComponent(ev.address);
  }

  function openGoogleCalendar(){
    window.open(googleCalendarUrl(WEDDING.ceremony), "_blank", "noopener");
  }

  /* ---------------- music (same track as kana: assets/audio/wedding-song.mp3) ---------------- */
  var MUSIC_SRC = "assets/audio/wedding-song.mp3";
  var musicPlaying = false;
  var musicAudio = null;
  var startMusicFromGesture = null;

  function syncMusicButton(){
    var btn = document.getElementById("musicToggle");
    if(!btn) return;
    btn.textContent = musicPlaying ? "♪" : "♫";
    btn.setAttribute("aria-label", musicPlaying ? "Pause music" : "Play music");
  }

  function ensureMusicAudio(){
    if(musicAudio) return musicAudio;
    musicAudio = new Audio(MUSIC_SRC);
    musicAudio.loop = true;
    musicAudio.preload = "auto";
    musicAudio.volume = 0.7;
    return musicAudio;
  }

  function startMusic(){
    var audio = ensureMusicAudio();
    var play = audio.play();
    musicPlaying = true;
    syncMusicButton();
    if(play && play.catch){
      play.catch(function(){
        musicPlaying = false;
        syncMusicButton();
      });
    }
  }

  function stopMusic(){
    if(musicAudio){
      musicAudio.pause();
    }
    musicPlaying = false;
    syncMusicButton();
  }

  function initMusic(){
    var btn = document.getElementById("musicToggle");
    if(!btn) return;

    ensureMusicAudio();

    startMusicFromGesture = function(){
      if(!musicPlaying) startMusic();
    };

    btn.addEventListener("click", function(){
      musicPlaying ? stopMusic() : startMusic();
    });
  }

  /* ---------------- floating action buttons ---------------- */
  function initFabs(){
    var toTop = document.getElementById("fabTop");
    if(toTop){
      window.addEventListener("scroll", function(){
        toTop.classList.toggle("hide", window.scrollY < 400);
      });
      toTop.addEventListener("click", function(){
        window.scrollTo({ top:0, behavior:"smooth" });
      });
    }
  }

})();
