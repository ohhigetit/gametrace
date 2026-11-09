/* V42 Calendar Feed refinement: route supported public ICS feeds through Netlify.
 * Keep existing Schedule import, parsing, per-device URLs, dedupe, and manual file fallback intact.
 * This network-only adapter does not write or sync any calendar records itself.
 */
(function installCalendarFeedBridge(){
  const priorFetch = globalThis.fetch?.bind(globalThis);
  if (!priorFetch || globalThis.__gtCalendarFeedBridgeInstalled) return;
  globalThis.__gtCalendarFeedBridgeInstalled = true;
  const isSupported = hostname =>
    /^(?:p\d+-)?caldav\.icloud\.com$/i.test(hostname) ||
    /^(?:www\.)?icloud\.com$/i.test(hostname) ||
    /^calendar\.google\.com$/i.test(hostname) ||
    /^www\.google\.com$/i.test(hostname) ||
    /^api\.team-manager\.gc\.com$/i.test(hostname);

  globalThis.fetch = function gameTraceCalendarFetch(input, init){
    // Only intercept direct calendar-feed GET requests, never Family Cloud, media, or writes.
    if (init?.method && String(init.method).toUpperCase() !== 'GET') return priorFetch(input, init);
    const raw = typeof input === 'string' ? input : input instanceof URL ? input.href :
      (typeof Request !== 'undefined' && input instanceof Request ? input.url : '');
    if (!raw || !/^webcals?:\/\/|^https:\/\//i.test(raw)) return priorFetch(input, init);
    let feedUrl;
    try { feedUrl = new URL(raw.replace(/^webcals?:\/\//i, 'https://')); }
    catch { return priorFetch(input, init); }
    if (!isSupported(feedUrl.hostname) || feedUrl.protocol !== 'https:') return priorFetch(input, init);
    // Treat only provider feed paths as calendars; don't proxy unrelated Google requests.
    const path=feedUrl.pathname;
    const calendarPath = (/icloud\.com$/i.test(feedUrl.hostname) && /\/published\//i.test(path)) ||
      (/google\.com$/i.test(feedUrl.hostname) && /\/calendar\/ical\//i.test(path)) ||
      (/gc\.com$/i.test(feedUrl.hostname) && /\.ics$/i.test(path));
    if (!calendarPath) return priorFetch(input, init);
    if (typeof Request !== 'undefined' && input instanceof Request && input.method !== 'GET') return priorFetch(input, init);
    return priorFetch('/.netlify/functions/calendar-feed', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({url:feedUrl.href}),
      signal:init?.signal || (typeof Request !== 'undefined' && input instanceof Request ? input.signal : undefined),
    }).then(async response=>{
      let data;
      try { data=await response.json(); }
      catch { throw new Error('Calendar bridge did not return a valid response.'); }
      if (!response.ok || !data?.ics) throw new Error(data?.error || 'Calendar feed could not be loaded.');
      return new Response(data.ics,{status:200,headers:{'Content-Type':'text/calendar; charset=utf-8'}});
    });
  };
})();
