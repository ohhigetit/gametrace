// GameTrace public calendar-feed bridge.
// Prevents browser CORS failures without persisting subscriber URLs on the server.
const MAX_BYTES = 2_000_000;
const ALLOWED_HOSTS = [
  /^(?:p\d+-)?caldav\.icloud\.com$/i,
  /^(?:www\.)?icloud\.com$/i,
  /^calendar\.google\.com$/i,
  /^www\.google\.com$/i,
  /^api\.team-manager\.gc\.com$/i,
];
const allowed = host => ALLOWED_HOSTS.some(re => re.test(host));
const json = (code, data) => ({ statusCode: code, headers: {
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store',
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Access-Control-Allow-Headers':'Content-Type',
}, body: JSON.stringify(data) });

exports.handler = async event => {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, {error:'Method not allowed'});
  let input;
  try { input = JSON.parse(event.body || '{}'); } catch { return json(400,{error:'Invalid JSON'}); }
  if (typeof input.url !== 'string' || input.url.length > 4096) return json(400,{error:'Calendar URL required'});
  // webcal is an HTTPS subscription scheme alias.
  const value = input.url.trim().replace(/^webcals?:\/\//i, 'https://');
  let url;
  try { url = new URL(value); } catch { return json(400,{error:'Invalid calendar URL'}); }
  if (url.protocol !== 'https:' || !allowed(url.hostname) || url.username || url.password || url.port) {
    return json(400,{error:'Unsupported calendar host. Use an iCloud, Google Calendar, or GameChanger public ICS link.'});
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    let response;
    try {
      // Do not allow redirects to arbitrary hosts / private addresses.
      response = await fetch(url.toString(), {redirect:'manual', signal:controller.signal,
        headers:{Accept:'text/calendar, text/plain;q=0.8, */*;q=0.1'}});
      for (let i=0; i<3 && response.status>=300 && response.status<400; i++) {
        const location = response.headers.get('location');
        if (!location) break;
        const next = new URL(location, url);
        if (next.protocol !== 'https:' || !allowed(next.hostname) || next.username || next.password || next.port)
          return json(502,{error:'Calendar provider redirected to an unsupported address'});
        url = next;
        response = await fetch(url.toString(), {redirect:'manual',signal:controller.signal,
          headers:{Accept:'text/calendar, text/plain;q=0.8, */*;q=0.1'}});
      }
      if (!response.ok) return json(502,{error:'Calendar provider could not be reached',providerStatus:response.status});
      const len = Number(response.headers.get('content-length'));
      if (len > MAX_BYTES) return json(413,{error:'Calendar feed too large'});
      const reader = response.body?.getReader();
      if (!reader) return json(502,{error:'Empty feed response'});
      const chunks=[]; let size=0;
      for (;;) {
        const {done,value} = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size>MAX_BYTES) {await reader.cancel(); return json(413,{error:'Calendar feed too large'});}
        chunks.push(value);
      }
      const joined = new Uint8Array(size);
      let offset=0; for(const chunk of chunks){joined.set(chunk,offset); offset+=chunk.byteLength;}
      const ics = new TextDecoder().decode(joined).replace(/^\uFEFF/, '');
      if (!/^BEGIN:VCALENDAR(?:\r?\n)/.test(ics)) return json(422,{error:'Provider did not return an ICS calendar'});
      return json(200,{ics, fetchedAt:new Date().toISOString()});
    } finally {clearTimeout(timer);}
  } catch(e) {
    return json(502,{error:e?.name==='AbortError'?'Calendar request timed out':'Could not load calendar feed'});
  }
};
