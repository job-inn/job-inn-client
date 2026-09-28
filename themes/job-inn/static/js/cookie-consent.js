(function () {
  "use strict";

  const STORAGE_KEY = "jobinn_cookie_consent";
  const CONSENT_VERSION = 1;

  const banner = document.getElementById("cookie-banner");
  const modal = document.getElementById("cookie-modal");

  const analyticsInput = document.getElementById("cookie-analytics");
  const marketingInput = document.getElementById("cookie-marketing");
  const externalInput = document.getElementById("cookie-external");

  if (!banner || !modal) {
    return;
  }

  function defaultConsent() {
    return {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: false,
      marketing: false,
      external: false,
      timestamp: new Date().toISOString()
    };
  }

  function getConsent() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);

      if (!data) {
        return null;
      }

      const consent = JSON.parse(data);

      if (consent.version !== CONSENT_VERSION) {
        return null;
      }

      return consent;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(consent) {
    consent.version = CONSENT_VERSION;
    consent.necessary = true;
    consent.timestamp = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));

    applyConsent(consent);

    banner.hidden = true;
    modal.hidden = true;
  }

  function openSettings() {
    const consent = getConsent() || defaultConsent();

    analyticsInput.checked = !!consent.analytics;
    marketingInput.checked = !!consent.marketing;
    externalInput.checked = !!consent.external;

    modal.hidden = false;

    document.body.style.overflow = "hidden";
  }

  function closeSettings() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function updateGoogleConsent(consent) {
    window.dataLayer = window.dataLayer || [];

    function gtag() {
      dataLayer.push(arguments);
    }

    window.gtag = window.gtag || gtag;

    gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied"
    });
  }

  function applyConsent(consent) {
    updateGoogleConsent(consent);

    if (consent.analytics) {
      loadGoogleAnalytics();
    }

    if (consent.marketing) {
      loadGoogleAds();
      loadMetaPixel();
    }

    if (consent.external) {
      enableExternalContent();
    }

    window.dispatchEvent(
      new CustomEvent("jobinnConsentUpdated", {
        detail: consent
      })
    );
  }


  /*
   * GOOGLE ANALYTICS
   *
   * Podmień G-XXXXXXXXXX na swój Measurement ID.
   */
  let gaLoaded = false;

  function loadGoogleAnalytics() {
    if (gaLoaded) return;

    gaLoaded = true;

    const GA_ID = "G-XXXXXXXXXX";

    if (GA_ID === "G-XXXXXXXXXX") {
      console.warn("JOB INN: ustaw prawidłowy Google Analytics Measurement ID.");
      return;
    }

    window.dataLayer = window.dataLayer || [];

    window.gtag = window.gtag || function () {
      dataLayer.push(arguments);
    };

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;

    document.head.appendChild(script);

    gtag("js", new Date());

    gtag("config", GA_ID, {
      anonymize_ip: true
    });
  }


  /*
   * GOOGLE ADS
   *
   * Podmień AW-XXXXXXXXX na swój Google Ads ID.
   */
  let googleAdsLoaded = false;

  function loadGoogleAds() {
    if (googleAdsLoaded) return;

    googleAdsLoaded = true;

    const ADS_ID = "AW-XXXXXXXXX";

    if (ADS_ID === "AW-XXXXXXXXX") {
      console.warn("JOB INN: ustaw prawidłowy Google Ads ID.");
      return;
    }

    window.dataLayer = window.dataLayer || [];

    window.gtag = window.gtag || function () {
      dataLayer.push(arguments);
    };

    /*
     * Jeżeli Google Analytics już załadowało gtag.js,
     * nie musimy ładować biblioteki ponownie.
     */
    if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + ADS_ID;

      document.head.appendChild(script);

      gtag("js", new Date());
    }

    gtag("config", ADS_ID);
  }


  /*
   * META PIXEL
   *
   * Podmień XXXXXXXXXXXXXXX na ID piksela Meta.
   */
  let metaLoaded = false;

  function loadMetaPixel() {
    if (metaLoaded) return;

    metaLoaded = true;

    const PIXEL_ID = "XXXXXXXXXXXXXXX";

    if (PIXEL_ID === "XXXXXXXXXXXXXXX") {
      console.warn("JOB INN: ustaw prawidłowy Meta Pixel ID.");
      return;
    }

    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;

      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };

      if (!f._fbq) f._fbq = n;

      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];

      t = b.createElement(e);
      t.async = true;
      t.src = v;

      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js"
    );

    fbq("init", PIXEL_ID);
    fbq("track", "PageView");
  }


  /*
   * TREŚCI ZEWNĘTRZNE
   *
   * Elementy iframe możesz w HTML wpisać jako:
   *
   * <iframe
   *   class="cookie-external-content"
   *   data-src="https://www.google.com/maps/embed?..."
   *   ...>
   * </iframe>
   *
   * Zamiast src używamy data-src.
   */
  function enableExternalContent() {
    document
      .querySelectorAll(".cookie-external-content[data-src]")
      .forEach(function (element) {
        if (!element.getAttribute("src")) {
          element.setAttribute("src", element.dataset.src);
        }
      });
  }


  /*
   * BUTTONS
   */

  document
    .getElementById("cookie-accept-all")
    .addEventListener("click", function () {
      saveConsent({
        necessary: true,
        analytics: true,
        marketing: true,
        external: true
      });

      document.body.style.overflow = "";
    });


  document
    .getElementById("cookie-reject-all")
    .addEventListener("click", function () {
      saveConsent(defaultConsent());

      document.body.style.overflow = "";
    });


  document
    .getElementById("cookie-settings-open")
    .addEventListener("click", openSettings);


  document
    .getElementById("cookie-save")
    .addEventListener("click", function () {
      saveConsent({
        necessary: true,
        analytics: analyticsInput.checked,
        marketing: marketingInput.checked,
        external: externalInput.checked
      });

      document.body.style.overflow = "";
    });


  document
    .getElementById("cookie-modal-reject")
    .addEventListener("click", function () {
      saveConsent(defaultConsent());

      document.body.style.overflow = "";
    });


  document
    .querySelectorAll("[data-cookie-close]")
    .forEach(function (button) {
      button.addEventListener("click", closeSettings);
    });


  /*
   * Link otwierający ustawienia cookies z footera.
   *
   * Dodaj gdziekolwiek:
   *
   * <a href="#" data-cookie-settings>Ustawienia cookies</a>
   */
  document.addEventListener("click", function (event) {
    const target = event.target.closest("[data-cookie-settings]");

    if (!target) return;

    event.preventDefault();

    openSettings();
  });


  /*
   * START
   */

  const consent = getConsent();

  if (!consent) {
    banner.hidden = false;
  } else {
    applyConsent(consent);
  }
})();
