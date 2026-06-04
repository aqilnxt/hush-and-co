from pathlib import Path
s=Path('resources/js/pages/Landing.jsx').read_text().splitlines()
open_count=0
for i,line in enumerate(s,1):
    if i>640: break
    if '<section' in line and '/section' not in line:
        open_count+=1
        print(f'L{i}: +1 section (open)={open_count}')
    if '</section>' in line:
        open_count-=1
        print(f'L{i}: -1 section (open)={open_count}')
    if open_count<0:
        print('ERROR Negative at',i)
        break
print(f'\nAt line 640, sections open: {open_count}')
