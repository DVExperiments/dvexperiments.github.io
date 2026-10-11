"""Development-only SVG illustration generator; not required to host the site."""
from pathlib import Path
from random import Random
from math import sin,cos,pi
import html
root=Path(__file__).parent/'assets'

def svg(parts, bg='#081a25', title='Project concept illustration'):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 750" role="img" aria-label="{html.escape(title)}"><defs><linearGradient id="ocean" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#06354b"/><stop offset="1" stop-color="#09192c"/></linearGradient><linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5baf72"/><stop offset="1" stop-color="#1c5c4b"/></linearGradient><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#132c52"/><stop offset="1" stop-color="#071422"/></linearGradient><linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#23364c"/><stop offset="1" stop-color="#152133"/></linearGradient><radialGradient id="light"><stop stop-color="#63ddc4" stop-opacity=".33"/><stop offset="1" stop-color="#63ddc4" stop-opacity="0"/></radialGradient><pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M 34 0 L 0 0 0 34" fill="none" stroke="#a1d4db" stroke-opacity=".07" stroke-width="1"/></pattern><filter id="shadow"><feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="#000" flood-opacity=".28"/></filter></defs><rect width="1200" height="750" fill="{bg}"/><rect width="1200" height="750" fill="url(#grid)"/>{''.join(parts)}</svg>'''
def txt(x,y,s,size=16,color='#c1e9e2',weight=600,anchor='start',spacing=1):
    return f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}" font-family="ui-monospace,Menlo,Consolas,monospace" font-weight="{weight}" letter-spacing="{spacing}" text-anchor="{anchor}">{html.escape(s)}</text>'
def rect(x,y,w,h,fill,rx=0,opacity=1,stroke='none',sw=1):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" opacity="{opacity}" stroke="{stroke}" stroke-width="{sw}"/>'
def circle(x,y,r,fill,opacity=1,stroke='none',sw=1):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" opacity="{opacity}" stroke="{stroke}" stroke-width="{sw}"/>'
def line(x,y,x2,y2,col='#85e4c9',opacity=.5,w=2):
    return f'<line x1="{x}" y1="{y}" x2="{x2}" y2="{y2}" stroke="{col}" opacity="{opacity}" stroke-width="{w}"/>'
def frame_header(name,code):
    return [rect(30,30,1140,45,'#0b1a2b',10,.82,'#7aa9a4',1),circle(61,52,5,'#7edac4'),circle(80,52,5,'#cdb07f'),circle(99,52,5,'#907caa'),txt(127,58,name,13,'#bfdfdf',700,spacing=2),txt(1136,58,code,12,'#72cbb5',700,'end',2)]

def save(name,items,bg,title): (root/name).write_text(svg(items,bg,title),encoding='utf-8')

# Little Worlds -- richly illustrated stylised top-down ecology island.
rng=Random(13); a=frame_header('LITTLE WORLDS / ECOLOGY SANDBOX','EXPERIMENT 001')
a+=[circle(535,415,490,'url(#light)'),'<path d="M -20 182 Q 203 136 382 215 T 802 220 T 1230 180 V 750 H -20 Z" fill="url(#ocean)"/>',
'<path d="M 176 480 Q 146 388 229 318 Q 291 232 409 222 Q 523 144 635 229 Q 799 221 857 329 Q 958 379 900 480 Q 880 570 718 599 Q 599 669 449 619 Q 314 649 246 552 Z" fill="#193d44" stroke="#82d6ab" stroke-width="12" opacity=".7"/>',
'<path d="M 176 457 Q 155 367 237 313 Q 312 235 412 242 Q 537 159 641 250 Q 791 234 853 336 Q 933 391 882 467 Q 857 557 705 586 Q 594 650 454 598 Q 310 632 249 535 Z" fill="url(#land)" stroke="#aad5a7" stroke-width="5"/>',
'<path d="M 512 225 C 565 288 500 327 561 389 S 638 451 594 513 S 589 562 663 601" fill="none" stroke="#72d3d7" stroke-width="28" stroke-linecap="round" opacity=".85"/>',
'<path d="M 512 225 C 565 288 500 327 561 389 S 638 451 594 513 S 589 562 663 601" fill="none" stroke="#d6ffff" stroke-width="7" stroke-linecap="round" opacity=".35"/>',
'<path d="M 323 358 Q 372 320 431 369 Q 461 410 413 447 Q 366 461 323 421 Z" fill="#8ed8a0" opacity=".38"/>',
'<path d="M 700 398 Q 786 358 825 415 Q 812 490 729 475 Z" fill="#aed78e" opacity=".27"/>']
for i in range(240):
    x=rng.uniform(265,842);y=rng.uniform(252,576)
    # ellipse mask loose, avoid rivers
    if ((x-559)/320)**2+((y-427)/190)**2>1 or abs(x-570)<35 and 300<y<570:continue
    rr=rng.choice([8,10,12,13,16]);color=rng.choice(['#0f5144','#16624d','#1b7755','#2e8662','#a3d288','#224c40'])
    a += [circle(round(x,1),round(y,1),rr,color,.8),circle(round(x-3,1),round(y-4,1),rr*.34,'#8fd4a0',.55)]
for x,y,color in [(373,315,'#f7d88b'),(760,489,'#efb974'),(450,520,'#f2e4c0'),(804,361,'#9bebdb')]:
    a += [circle(x,y,9,color,1,'#fff6d9',2),circle(x,y,19,'none',1,color,2)]
a += [rect(912,249,244,268,'#0d2231',12,.96,'#5f9b9d',1),txt(936,281,'ECOSYSTEM METRICS',12,'#91c8c8'),line(935,296,1134,296,'#95b8c0',.3),txt(937,335,'NATIVE LIFE',11,'#7eaeb0'),txt(1128,335,'68%',16,'#8fecbf',800,'end'),rect(937,345,189,8,'#223c45',4),rect(937,345,129,8,'#80d8b3',4),txt(937,385,'FOREST COVER',11,'#7eaeb0'),txt(1128,385,'81%',16,'#8fecbf',800,'end'),rect(937,395,189,8,'#223c45',4),rect(937,395,153,8,'#80d8b3',4),txt(937,435,'BIODIVERSITY',11,'#7eaeb0'),txt(1128,435,'HIGH',16,'#e1d38b',800,'end'),line(937,459,1128,459,'#90b2bd',.3),txt(938,486,'●  SIMULATION ACTIVE',11,'#87e9d0'),txt(43,700,'observe / intervene / discover',13,'#a5d8d2',700,spacing=1.5)]
save('cover-little-worlds.svg',a,'#091c28','Illustrative ecology map for Little Worlds')

# NZ EcoSim -- winding South/North island topographical diagram.
rng=Random(44);a=frame_header('NZ ECOSIM / ISLAND GENERATOR','EXPERIMENT 002')
a += [rect(40,106,1120,596,'url(#ocean)',15),circle(480,390,395,'url(#light)'),
'<path d="M 504 126 Q 594 156 610 212 Q 649 284 602 330 Q 612 390 523 421 Q 513 469 437 514 Q 418 574 349 628 Q 284 646 298 564 Q 306 493 361 433 Q 358 376 419 341 Q 450 290 436 251 Q 424 192 504 126Z" fill="#19454b" stroke="#92c6a8" stroke-width="13"/>',
'<path d="M 506 134 Q 589 167 603 216 Q 636 280 595 324 Q 605 382 515 414 Q 507 461 430 509 Q 413 560 349 620 Q 295 636 305 566 Q 314 500 371 430 Q 365 367 425 344 Q 455 288 444 252 Q 437 193 506 134Z" fill="#366d5a"/>',
'<path d="M 510 168 Q 523 231 492 295 Q 539 339 482 391 Q 448 437 393 498" stroke="#b4d9b5" stroke-width="14" fill="none" stroke-linecap="round" opacity=".65"/>',
'<path d="M 528 178 Q 510 238 530 291 Q 552 353 508 417" stroke="#a0d7da" stroke-width="8" fill="none" opacity=".7"/>']
for i in range(160):
    x=rng.randrange(315,630); y=rng.randrange(168,600)
    # use radius approx island band
    center=510-0.52*(y-225)
    if abs(x-center)>68+rng.randrange(0,50):continue
    a.append(circle(x,y,rng.randrange(3,12),rng.choice(['#133f3e','#5b9e70','#7eac72','#255347','#a1ca8f']),.65))
for i in range(45):
    x=rng.randrange(90,1000);y=rng.randrange(145,635)
    if x<320 or x>730:a.append(circle(x,y,rng.choice([1,2,3]),'#64b3bf',.35))
a += [rect(742,158,360,422,'#0b2130',12,.96,'#76a6a4',1),txt(777,197,'FIELD OBSERVATIONS',15,'#c2efe0'),line(776,216,1070,216,'#86b8b0',.3),txt(777,263,'LOCAL HABITAT',13,'#80bbbb'),txt(777,299,'AOTEAROA',30,'#e3f1dc',750,spacing=2),txt(777,352,'NATIVE SPECIES',13,'#87c5a9'),txt(1057,352,'12',24,'#e0edbd',800,'end'),txt(777,397,'INVASIVE SPECIES',13,'#87c5a9'),txt(1057,397,'04',24,'#e0edbd',800,'end'),txt(777,453,'RELATIONSHIPS ARE',13,'#8da6af'),txt(777,481,'INTERCONNECTED',18,'#95e1cf',800),line(777,516,1070,516,'#8fb0bd',.3),txt(777,550,'PYTHON  /  DESKTOP',11,'#9fbed1',700),txt(75,665,'create an island / watch its story unfold',13,'#d1eeef',700)]
save('cover-nz-ecosim.svg',a,'#061729','Illustrative New Zealand habitat for NZ EcoSim')

# Spaceport 07: landing pads, orbital night scene.
rng=Random(21);a=frame_header('SPACEPORT 07 / FLIGHT OPERATIONS','EXPERIMENT 003')
a += [rect(0,90,1200,660,'url(#sky)'),circle(932,255,245,'#3d5c91',.16),circle(935,254,186,'#375984'),circle(900,209,145,'#547e98',.55),circle(870,160,60,'#92aec1',.23)]
for i in range(180):
    x=rng.randint(35,1165);y=rng.randint(100,580)
    a.append(circle(x,y,rng.choice([1,1,1,2]),'#d4ebfc',rng.choice([.3,.4,.65,.85])))
a += ['<path d="M 0 605 L 175 529 L 442 560 L 630 483 L 930 538 L 1200 479 V750 H0Z" fill="#152a3f"/>',
'<path d="M0 653 L325 578 L594 628 L936 560 L1200 618 V750 H0Z" fill="#1c3349"/>',
'<path d="M 212 613 L 559 457 L 875 612 L 530 721 Z" fill="#334b5e" stroke="#6f94a7" stroke-width="5"/>',
'<path d="M 286 609 L 557 494 L 796 606 L 538 683Z" fill="#172c43" stroke="#7cc5b7" stroke-width="3"/>',
'<ellipse cx="545" cy="593" rx="110" ry="41" fill="#71e2c4" opacity=".12"/>',
'<ellipse cx="545" cy="591" rx="106" ry="34" fill="none" stroke="#70d8bd" stroke-width="9" stroke-dasharray="35 20"/>',
'<path d="M 544 321 L 655 565 L 577 541 L 541 559 L 504 541 L 431 565Z" fill="#cbdde5" stroke="#74e9db" stroke-width="5" filter="url(#shadow)"/>',
'<path d="M 544 350 L 581 508 L 543 495 L 506 508Z" fill="#163448" stroke="#70ceca" stroke-width="4"/>',
'<path d="M 525 562 L 546 628 L 566 562Z" fill="#72d9d3" opacity=".64"/>',
'<path d="M 542 210 V 302" stroke="#85efcf" stroke-width="2" stroke-dasharray="6 12"/>',
'<path d="M 354 350 L 453 385" stroke="#6bd6cf" stroke-width="2" stroke-dasharray="6 6"/>',
'<path d="M 730 368 L 643 398" stroke="#6bd6cf" stroke-width="2" stroke-dasharray="6 6"/>']
a += [rect(48,184,255,202,'#0d2336',12,.88,'#76a6a4',1),txt(72,219,'PAD NETWORK',14,'#95e5d4'),txt(72,260,'07 // ACTIVE',20,'#e4eef5',800),line(74,278,271,278,'#90b4c0',.4),txt(73,306,'ARRIVALS',12,'#9ab4c7'),txt(265,306,'04',19,'#9bdbd0',800,'end'),txt(73,348,'DEPARTURES',12,'#9ab4c7'),txt(265,348,'02',19,'#e5c996',800,'end'),txt(822,650,'INTERSTELLAR ARRIVALS',14,'#a9dcd6',800,spacing=2),txt(822,678,'A SYSTEM IN MOTION',12,'#7ca8b5',700,spacing=1)]
save('cover-spaceport.svg',a,'#081426','Sci-fi landing platform artwork for Spaceport 07')

# GameSignal: UI dashboard concept.
a=frame_header('GAMESIGNAL / CUSTOM DASHBOARD','EXPERIMENT 004')
a += [rect(52,113,1096,569,'#111e30',15,1,'#53758c',2),rect(52,113,1096,68,'#202f45',15),rect(52,160,1096,20,'#202f45'),circle(89,146,11,'#69ccb9'),txt(115,152,'GAMESIGNAL',18,'#eef5fc',850,spacing=3),rect(908,130,184,32,'#18263b',8),txt(937,151,'DASHBOARD  /  04',11,'#a7c0d6',700)]
for x,y,w,h,label in [(81,204,311,206,'PLAY ACTIVITY'),(411,204,311,206,'LIBRARY PULSE'),(741,204,378,206,'GAME TRENDS'),(81,429,496,220,'SESSION HISTORY'),(597,429,522,220,'CURRENT SIGNALS')]:
    a+=[rect(x,y,w,h,'url(#glass)',10,1,'#3f6074',1),txt(x+19,y+32,label,12,'#95bace',750,spacing=1.3),line(x+19,y+46,x+w-19,y+46,'#54718a',.5)]
# chart 1
rng=Random(8)
for i in range(12):
    h=rng.randrange(32,108); x=105+i*22
    a.append(rect(x,374-h,12,h,'#76dcca' if i>=7 else '#426e88',3))
a += [txt(108,267,'84.6',41,'#ecf5f5',800),txt(243,265,'HRS',12,'#95b9c9',700)]
# chart 2 donut
for r,color,opacity in [(80,'#3e6782',1),(61,'#70ceb8',.8),(37,'#1c344b',1)]:a.append(circle(554,330,r,color,opacity))
a += [circle(554,330,27,'#1b2b40'),txt(554,337,'42',22,'#e7f9f2',800,'middle'),txt(649,289,'PLAYED',11,'#91aebe'),txt(649,317,'24',18,'#b1e1d0',800),txt(649,354,'BACKLOG',11,'#91aebe'),txt(649,382,'18',18,'#b1e1d0',800)]
# trend graph
coords=[(763,362),(801,348),(841,354),(876,299),(920,307),(962,270),(1002,283),(1048,244),(1092,262)]
a += ['<polyline points="'+' '.join(f'{x},{y}' for x,y in coords)+'" fill="none" stroke="#7de6ce" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>']
for x,y in coords:a.append(circle(x,y,5,'#9eedda'))
# session chart
for i in range(18):
    h=[43,65,38,86,51,96,107,77,121,91,63,84,133,109,88,70,114,140][i]
    a.append(rect(107+i*25,612-h,15,h,'#71bdb5' if i%3 else '#b3a0f0',3,.8))
# signal rows
for i,(lab,metric) in enumerate([('PATCH STATUS','UPDATED'),('ENGAGEMENT','RISING'),('FRIEND ACTIVITY','ACTIVE'),('CUSTOM WIDGETS','READY')]):
    y=508+i*35
    a += [circle(624,y-5,4,'#80deb9'),txt(641,y,lab,12,'#b4ccdd',700),txt(1090,y,metric,12,'#87e9c6',780,'end')]
save('cover-gamesignal.svg',a,'#081526','Custom gaming dashboard interface artwork for GameSignal')

# Pocket Pal retro pet -- monochromatic LCD screen and decorative stars.
rng=Random(9);a=frame_header('POCKET PAL / RELATIONSHIP EXPERIMENT','EXPERIMENT 005')
a += [circle(599,421,340,'url(#light)')]
for i in range(55):
    x=rng.randint(95,1100);y=rng.randint(120,680)
    if 335<x<866 and 150<y<705: continue
    a.append(txt(x,y,rng.choice(['+','✦','·']),rng.choice([13,19,24]),rng.choice(['#8ce5bd','#9585c5','#749abb']),700))
a += [rect(376,125,465,568,'#99b6aa',100,1,'#d4ede0',8),rect(402,146,413,516,'#d5ded3',78,1,'#658c85',5),rect(434,194,350,299,'#4c665b',22,1,'#283e39',9),rect(459,219,300,250,'#b5cea3',8),txt(609,241,'POCKET   PAL',15,'#315044',850,'middle',4),rect(468,252,283,178,'#abc69d',4)]
# dot matrix faint grid
for i in range(0,267,12):a.append(line(474+i,258,474+i,424,'#69856b',.12,1))
for i in range(0,167,12):a.append(line(472,259+i,748,259+i,'#69856b',.12,1))
# pixel art creature via manually specified grid
pixel=[
'   111111   ',
'  11111111  ',
' 1111111111 ',
'111111111111',
'112111112111',
'111111111111',
'111113311111',
'111111111111',
' 1111111111 ',
'  11111111  ',
'   111111   ',
'   11  11   '
]
colors={'1':'#344e42','2':'#a8c99b','3':'#a8c99b'}
for row,s in enumerate(pixel):
 for col,c in enumerate(s):
    if c!=' ':a.append(rect(518+col*15,276+row*12,15,12,colors[c]))
a += [txt(609,453,'< YOU SEEM CURIOUS >',14,'#345648',850,'middle',1),circle(510,564,26,'#749888',1,'#435c52',4),circle(709,564,26,'#749888',1,'#435c52',4),circle(609,597,36,'#648b7a',1,'#435c52',5),txt(609,610,'♥',30,'#c8e2cd',800,'middle'),txt(609,672,'A  TINY  STRANGE  FRIEND',11,'#3d5e50',800,'middle',1.8),txt(130,390,'IT LEARNS',18,'#c7e6da',800),txt(130,420,'YOU LEARN',18,'#89d9c4',800),txt(883,392,'TWO-WAY',18,'#c7e6da',800),txt(883,422,'CONNECTION',18,'#89d9c4',800)]
save('cover-pocket-pal.svg',a,'#0e1b2c','Retro virtual pet illustration for Pocket Pal')
(root.parent/'favicon.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#0a101e"/><rect x="14" y="13" width="16" height="16" rx="3" fill="none" stroke="#85ecd3" stroke-width="4"/><rect x="34" y="13" width="16" height="16" rx="3" fill="#85ecd3"/><circle cx="22" cy="42" r="8" fill="none" stroke="#85ecd3" stroke-width="4"/><rect x="34" y="34" width="16" height="16" rx="3" fill="none" stroke="#85ecd3" stroke-width="4"/></svg>''',encoding='utf8')
print('Created:',*[p.name for p in sorted(root.glob('cover-*.svg'))],sep='\n - ')
