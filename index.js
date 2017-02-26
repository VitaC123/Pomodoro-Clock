// A big thanks to Anthony Terrien for the jQuery Knob, which allowed me to avoid reinventing the wheel. http://anthonyterrien.com/knob/

(function () {
  "use strict";

  $(document).ready(function () {
    runIntroDemo();
  });

  function runIntroDemo() {
    var initialDemoValue = 0;
    var introDemoTimer = setInterval(function () {
      if (initialDemoValue === 25) {
        clearInterval(introDemoTimer);
      }
      $(".workDial").val(initialDemoValue).trigger("change");
      $(".breakDial").val(initialDemoValue / 5).trigger("change");
      initialDemoValue++;
    }, 50);
  }
})();

(function () {
  "use strict";

  var workDuration = 25;
  var breakDuration = 5;
  var countdown = null;
  var currentActivity = "work";
  var playBtnClickCount = 0;
  var inactiveSettingsTimer;
  var durationToCountdown;
  var interval = 1000;

  $(".workDial").knob({
    "change": function (userInputVal) {
      userInputVal = Math.round(userInputVal);
      workDuration = userInputVal;
      if (userInputVal < 1) {
        setTimeout(function () {
          $(".workDial").val(1).trigger("change");
        }, 10);
      }
    }
  });

  $(".breakDial").knob({
    "change": function (userInputVal) {
      userInputVal = Math.round(userInputVal);
      breakDuration = userInputVal;
      if (userInputVal < 1) {
        setTimeout(function () {
          $(".breakDial").val(1).trigger("change");
        }, 10);
      }
    }
  });

  $(".dialSeconds").knob();

  $(".playBtn").click(function () {
    playBtnClickCount++;
    if (playBtnClickCount === 1) {
      cycleDisplayedTimer(currentActivity);
      $(".playFa").finish().fadeOut(150, function () {
        $(".pauseFa").finish().fadeIn(150);
      });
      $(".resetBtn").removeClass("disabled");
    } else {
      pauseCountdown();
    }
  });

  function pauseCountdown() {
    $(".pauseFa").finish();
    $(".playFa").finish();
    if (playBtnClickCount % 2 === 0) { // If paused
      clearInterval(countdown);
      countdown = null;
      $(".pauseFa").fadeOut(150, function () {
        $(".playFa").fadeIn(150);
      });
    } else {
      startNewCountdown(durationToCountdown / 60);
      $(".playFa").fadeOut(150, function () {
        $(".pauseFa").fadeIn(150);
      });
    }
  }

  $(".resetBtn").click(function () {
    resetCountdown();
  });

  $(".outerDial").mousedown(function () {
    resetCountdown();
  });

  function resetCountdown() {
    clearInterval(countdown);
    countdown = null;
    playBtnClickCount = 0;
    currentActivity = "work";
    $(".pauseFa").finish().fadeOut(150, function () {
      $(".playFa").finish().fadeIn(150);
    });
    $(".resetBtn").addClass("disabled");
    $(".workDial").val(workDuration).trigger("change");
    $(".breakDial").val(breakDuration).trigger("change");
    $(".workSection").finish().fadeIn("fast");
    $(".breakSection").finish().fadeIn("fast");
    $(".dialSeconds").val(0).trigger("change");
  }

  $(".settingsBtn").click(function () {
    $(".settingsFa").addClass("fa-spin");
    if ($(".settingsBtnGroup").css("display") === "none") {
      $(".settingsBtnGroup").slideDown("fast", function () {
        $(".settingsFa").removeClass("fa-spin");
        hideSettingsIfInactive();
      });
    } else {
      $(".settingsBtnGroup").slideUp("fast", function () {
        $(".settingsFa").removeClass("fa-spin");
        clearTimeout(inactiveSettingsTimer);
      });
    }
  });

  function hideSettingsIfInactive() {
    if ($(".settingsBtnGroup").css("display") !== "none") {
      inactiveSettingsTimer = setTimeout(function () {
        $(".settingsFa").addClass("fa-spin");
        $(".settingsBtnGroup").slideUp("slow", function () {
          $(".settingsFa").removeClass("fa-spin");
        });
      }, 6000);
    }
  }

  function postponeHideInactiveSettingsTimer() {
    clearTimeout(inactiveSettingsTimer);
    hideSettingsIfInactive();
  }

  $(".fastForwardBtn").click(function () {
    postponeHideInactiveSettingsTimer();
    $(".fastForwardBtn").removeClass("btn-info").addClass("btn-default");
    var speed = $(this).html();
    switch (speed) {
      case "1x":
        interval = 1000;
        $(".speed1x").removeClass("btn-default").addClass("btn-info");
        break;
      case "10x":
        interval = 100;
        $(".speed10x").removeClass("btn-default").addClass("btn-info");
        break;
      case "20x":
        interval = 50;
        $(".speed20x").removeClass("btn-default").addClass("btn-info");
        break;
    }
    if (playBtnClickCount === 1) {
      clearInterval(countdown);
      countdown = null;
      startNewCountdown(durationToCountdown / 60);
    }
  });

  $(".muteBtn").click(function () {
    postponeHideInactiveSettingsTimer();
    if ($(".soundFa").hasClass("fa-bell-o")) {
      $("audio").prop('muted', true);
      $(".soundFa").removeClass("fa-bell-o").addClass("fa-bell-slash-o");
      $(this).removeClass("btn-warning").addClass("btn-default");
    } else {
      $("audio").prop('muted', false);
      $(".soundFa").removeClass("fa-bell-slash-o").addClass("fa-bell-o");
      $(this).removeClass("btn-default").addClass("btn-warning");
    }
  });

  $("button").click(function () {
    $(this).blur();
  });

  function cycleDisplayedTimer(activity) {
    var nonActivity = activity === "work" ? "break" : "work";
    $("." + nonActivity + "Section").finish().fadeOut("slow", function () {
      $("." + activity + "Section").finish().fadeIn("slow", function () {
        $("." + nonActivity + "Section").finish(); // Bug fix for a race condition, where rapid clicking start/reset would start countdown with both timers displayed
        var currentActivityDuration = activity === "work" ? workDuration : breakDuration;
        startNewCountdown(currentActivityDuration);
      });
    });
  }

  function startNewCountdown(duration) {
    if (countdown === null) {
      durationToCountdown = duration * 60;
      countdown = setInterval(countdownTimer, interval);
    }
  }

  function countdownTimer() {
    durationToCountdown--;
    var minutes = parseInt(durationToCountdown / 60);
    var seconds = durationToCountdown - (minutes * 60);
    $("." + currentActivity + "Dial").val(minutes).trigger("change");
    $(".dialSeconds").val(seconds).trigger("change");
    if (minutes < 1) {
      $("." + currentActivity + "Dial").val(seconds).trigger("change");
    }
    if (durationToCountdown === 0) {
      stopCurrentTimerStartNext();
    }
  }

  function stopCurrentTimerStartNext() {
    clearInterval(countdown);
    countdown = null;
    $(".bellSound")[0].play();
    currentActivity = currentActivity === "work" ? "break" : "work";
    cycleDisplayedTimer(currentActivity);
  }
})();