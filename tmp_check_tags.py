from pathlib import Path
import re
s=Path('resources/js/pages/Landing.jsx').read_text()
pattern=re.compile(r'<(/?)([a-zA-Z0-9-]+)([^>]*)>')
stack=[]
lines=s.splitlines()
for i,line in enumerate(lines,1):
    for m in pattern.finditer(line):
        closing = m.group(1)=='/'
        tag = m.group(2)
        rest = m.group(3)
        selfclose = rest.strip().endswith('/')
        if closing:
            if not stack:
                print('Unmatched closing',tag,'at',i)
            else:
                top=stack.pop()
                if top!=tag:
                    print('MISMATCH: top',top,'but closing',tag,'at',i)
        else:
            if selfclose:
                pass
            else:
                if tag in ['img','input','br','meta','link','ArrowRightIcon','MapPinIcon','StarIcon','BuildingStorefrontIcon','CakeIcon','BoltIcon','GiftIcon','path','svg']:
                    pass
                else:
                    stack.append(tag)

if stack:
    print('Remaining stack (open tags):',stack[:20], '... total', len(stack))
else:
    print('All tags balanced')
