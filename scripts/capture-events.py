"""Refresh the public event fixtures used by the local UI demo."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import subprocess,re,json
SLUGS=['z6y1x5zv','dhq3kyhy','23p9j1fs','io051sf7','l2tdcs1e','z0zqovpu','jlnifjub','5.5','july4-brooklyn']
def fetch(url):
 return subprocess.check_output(['curl','-fLsS','--max-time','45','-A','Mozilla/5.0',url])
def capture(slug):
 try:
  html=fetch('https://luma.com/'+slug).decode()
  raw=json.loads(re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',html)[1])['props']['pageProps']['initialData']['data']
  e=raw['event']; hosts=raw.get('hosts',[]); g=e.get('geo_address_info') or {}; ticket=raw.get('ticket_info') or {}
  def text(node):return node.get('text','')+''.join(text(c) for c in node.get('content',[]))
  paragraphs=[]; length=0
  for node in (raw.get('description_mirror') or {}).get('content',[]):
   p=text(node)
   if not p:continue
   if len(p)>700:continue
   if length+len(p)>1100 or sum(len(x.split()) for x in paragraphs)+len(p.split())>145:break
   paragraphs.append(p);length+=len(p)
  asset=Path('public/assets/events');asset.mkdir(parents=True,exist_ok=True)
  cover='/assets/events/'+slug+'.jpg'
  url=e['cover_url'];url='https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,quality=85,width=800,height=800/'+url
  try:(asset/(slug+'.jpg')).write_bytes(fetch(url))
  except Exception:cover=e['cover_url']
  avatar=''
  if hosts and hosts[0].get('avatar_url'):
   avatar='/assets/events/'+slug+'-host.jpg'
   try:(asset/(slug+'-host.jpg')).write_bytes(fetch('https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,quality=80,width=96,height=96/'+hosts[0]['avatar_url']))
   except Exception:avatar=''
  result={'slug':slug,'name':e['name'],'image':cover,'start':e['start_at'],'end':e['end_at'],'timezone':e['timezone'],'host':', '.join(h['name'] for h in hosts),'hostAvatar':avatar,'city':g.get('city') or 'Online','location':g.get('name') or g.get('full_address') or g.get('sublocality') or g.get('city') or 'Online','privateLocation':e.get('geo_address_visibility')=='guests-only','going':raw.get('guest_count',0),'theme':(raw.get('theme_meta') or {}).get('theme','minimal'),'tint':raw.get('tint_color') or '#6c91bf','waitlist':raw.get('waitlist_active',False),'soldOut':raw.get('sold_out',False),'free':ticket.get('is_free',True),'approval':ticket.get('require_approval',False),'price':ticket.get('price'),'categories':raw.get('categories',[]),'description':paragraphs}
  print(slug,result['theme'],str(result['categories'])[:300],flush=True)
  return result
 except Exception as ex:print(slug,str(ex),flush=True);return None
with ThreadPoolExecutor(max_workers=5) as pool: data=list(filter(None,pool.map(capture,SLUGS)))
Path('src/event-fixtures.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
