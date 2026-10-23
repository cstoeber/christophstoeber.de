from pathlib import Path
import re
from html import unescape
for p in Path('.reference').glob('*.html'):
    s=p.read_text(encoding='utf-8')
    start=s.find('<div id="content_area"')
    end=s.find('<aside',start)
    s=s[start:end] if start!=-1 else s
    s=re.sub(r'<script.*?</script>','',s,flags=re.S)
    print('\n### '+p.stem+'\n'+unescape(re.sub(r'<[^>]+>',' ',s))[:14000])
s=Path('.reference/layout.css').read_text()
for rule in s.split('}'):
    if len(rule)<2000 and any(x in rule for x in ['.jtpl-header__inner{','.jtpl-title{','.jtpl-content__inner{','.jtpl-sidebar__inner{','.jtpl-navigation__inner a{','.navigation-colors a:link','.jtpl-content{','.jtpl-header{','.jtpl-footer{']): print(rule+'}')
