"""vendor_fonts.py DIR -> make the offline copy's fonts identical to the website's.
Fetches each Google Fonts stylesheet the pages link to (as a current browser sees it, so the same woff2 files and
unicode-range subsets), saves every font file under assets/fonts/, writes a local copy of each stylesheet with only the
font URLs changed, and points the pages at it. Fails loudly if anything can't be fetched, so a broken zip is never published."""
import hashlib, os, re, sys, urllib.request

D = sys.argv[1]
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"
FONTS = os.path.join(D, "assets", "fonts")
os.makedirs(FONTS, exist_ok=True)


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60) as r:
        return r.read()


sheets, files = {}, 0
for f in sorted(os.listdir(D)):
    if not f.endswith(".html"):
        continue
    p = os.path.join(D, f); s = open(p, encoding="utf-8").read()
    for url in set(re.findall(r'href="(https://fonts\.googleapis\.com/css2[^"]*)"', s)):
        if url not in sheets:
            css = get(url.replace("&amp;", "&")).decode()
            def local(m):
                global files
                src = m.group(1); name = hashlib.sha1(src.encode()).hexdigest()[:16] + os.path.splitext(src)[1]
                dst = os.path.join(FONTS, name)
                if not os.path.exists(dst):
                    open(dst, "wb").write(get(src)); files += 1
                return "url(%s)" % name
            css = re.sub(r"url\((https://fonts\.gstatic\.com/[^)]+)\)", local, css)
            assert "gstatic" not in css and "@font-face" in css, url
            name = "gf-%s.css" % hashlib.sha1(url.encode()).hexdigest()[:10]
            open(os.path.join(FONTS, name), "w", encoding="utf-8").write(css)
            sheets[url] = "assets/fonts/" + name
        s = s.replace('href="%s"' % url, 'href="%s"' % sheets[url])
    s = re.sub(r'<link rel="preconnect" href="https://fonts\.(googleapis|gstatic)\.com"( crossorigin)?>', "", s)
    open(p, "w", encoding="utf-8").write(s)
left = [f for f in os.listdir(D) if f.endswith(".html") and "fonts.googleapis.com" in open(os.path.join(D, f), encoding="utf-8").read()]
assert not left, left
print("fonts: %d stylesheets, %d font files" % (len(sheets), files))
