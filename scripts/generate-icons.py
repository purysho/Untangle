"""Regenerate desktop icon formats from Untangle's existing strand mark."""
from pathlib import Path
from PIL import Image, ImageDraw
root = Path(__file__).resolve().parents[1]
image = Image.new('RGBA', (1024, 1024))
draw = ImageDraw.Draw(image)
draw.rounded_rectangle((20, 20, 1004, 1004), radius=210, fill='#10171d')
def curve(points, steps=100):
    a,b,c,d=points
    return [((1-t)**3*a[0]+3*(1-t)**2*t*b[0]+3*(1-t)*t*t*c[0]+t**3*d[0],(1-t)**3*a[1]+3*(1-t)**2*t*b[1]+3*(1-t)*t*t*c[1]+t**3*d[1]) for t in (i/steps for i in range(steps+1))]
for pts in [[(230,310),(470,310),(430,310),(510,310)],[(510,310),(790,310),(280,714),(560,714)],[(560,714),(660,714),(690,714),(794,714)],[(230,714),(350,714),(330,714),(430,714)],[(430,714),(710,714),(250,310),(630,310)],[(630,310),(690,310),(740,310),(794,310)]]:
    draw.line(curve(pts),fill='#9ce8cc',width=66,joint='curve')
for p in [(230,310),(230,714),(794,310),(794,714)]:draw.ellipse((p[0]-33,p[1]-33,p[0]+33,p[1]+33),fill='#9ce8cc')
image.save(root/'build/icon.png')
image.save(root/'build/icon.ico',sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
image.save(root/'build/icon.icns')
