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
      primeAudio();
      requestMotionPermission();
    });
  }

  function requestMotionPermission(){
    if(typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function"){
      DeviceMotionEvent.requestPermission().then(function(state){
        if(state === "granted"){
          window.addEventListener("devicemotion", handleShake);
        }
      }).catch(function(){});
    } else {
      window.addEventListener("devicemotion", handleShake);
    }
  }

  var lastShake = 0;
  function handleShake(e){
    var acc = e.accelerationIncludingGravity;
    if(!acc) return;
    var magnitude = Math.abs(acc.x||0) + Math.abs(acc.y||0) + Math.abs(acc.z||0);
    var now = Date.now();
    if(magnitude > 35 && now - lastShake > 1500){
      lastShake = now;
      spawnPetalShower(24);
    }
  }

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
      calBtn.addEventListener("click", downloadICS);
    }
  }

  function pad(n){ return String(n).padStart(2,"0"); }

  function toICSDate(dateStr, timeStr){
    var d = new Date(dateStr + "T" + timeStr + ":00" + WEDDING.timezoneOffset);
    return d.getUTCFullYear() + pad(d.getUTCMonth()+1) + pad(d.getUTCDate()) + "T" +
           pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
  }

  function buildICS(){
    var events = [WEDDING.ceremony, WEDDING.reception];
    var lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//" + WEDDING.groom + WEDDING.bride + "//Wedding//EN"];
    events.forEach(function(ev, i){
      lines.push("BEGIN:VEVENT");
      lines.push("UID:" + i + "-" + Date.now() + "@wedding");
      lines.push("DTSTAMP:" + toICSDate(ev.date, ev.start));
      lines.push("DTSTART:" + toICSDate(ev.date, ev.start));
      lines.push("DTEND:" + toICSDate(ev.date, ev.end));
      lines.push("SUMMARY:" + WEDDING.groom + " & " + WEDDING.bride + " — " + ev.label);
      lines.push("LOCATION:" + ev.address);
      lines.push("DESCRIPTION:" + WEDDING.description);
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:-P1D");
      lines.push("ACTION:DISPLAY");
      lines.push("DESCRIPTION:Reminder");
      lines.push("END:VALARM");
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }

  function downloadICS(){
    var blob = new Blob([buildICS()], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = WEDDING.groom + "-" + WEDDING.bride + "-wedding.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /* ---------------- generative music (no external audio file needed) ---------------- */
  var audioCtx = null, musicPlaying = false, musicTimer = null, droneNodes = [];
  function primeAudio(){
    if(!audioCtx){
      var AC = window.AudioContext || window.webkitAudioContext;
      if(AC) audioCtx = new AC();
    }
  }
  function initMusic(){
    var btn = document.getElementById("musicToggle");
    if(!btn) return;
    btn.addEventListener("click", function(){
      primeAudio();
      if(!audioCtx) return;
      musicPlaying ? stopMusic() : startMusic();
      btn.textContent = musicPlaying ? "♪" : "♫";
      btn.setAttribute("aria-label", musicPlaying ? "Pause music" : "Play music");
    });
  }
  var PENTATONIC = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C D E G A C — Mohanam-style
  function startMusic(){
    if(!audioCtx) return;
    musicPlaying = true;
    var master = audioCtx.createGain();
    master.gain.value = 0.06;
    master.connect(audioCtx.destination);
    droneNodes.push(master);

    var drone = audioCtx.createOscillator();
    drone.type = "sine";
    drone.frequency.value = 130.81;
    var droneGain = audioCtx.createGain();
    droneGain.gain.value = 0.4;
    drone.connect(droneGain).connect(master);
    drone.start();
    droneNodes.push(drone);

    function pluck(){
      if(!musicPlaying) return;
      var freq = PENTATONIC[Math.floor(Math.random()*PENTATONIC.length)];
      var osc = audioCtx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      var g = audioCtx.createGain();
      g.gain.setValueAtTime(0, audioCtx.currentTime);
      g.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.6);
      osc.connect(g).connect(master);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.7);
      musicTimer = setTimeout(pluck, 900 + Math.random()*900);
    }
    pluck();
  }
  function stopMusic(){
    musicPlaying = false;
    clearTimeout(musicTimer);
    droneNodes.forEach(function(n){ try{ n.disconnect(); n.stop && n.stop(); }catch(e){} });
    droneNodes = [];
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
