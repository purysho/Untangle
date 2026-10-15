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
# Two interwoven U-shaped strands. Keep the established mint-on-navy mark.
paths = [
 [(280,240),(280,360),(280,520),(280,595)],
 [(280,595),(280,850),(650,850),(650,595)],
 [(650,595),(650,460),(650,350),(650,240)],
 [(380,240),(380,380),(380,540),(380,595)],
 [(380,595),(380,730),(750,730),(750,595)],
 [(750,595),(750,480),(750,340),(750,240)],
]
for pts in paths:
    draw.line(curve(pts),fill='#9ce8cc',width=66,joint='curve')
for x in (280,380,650,750):
    draw.ellipse((x-33,207,x+33,273),fill='#9ce8cc')
image.save(root/'build/icon.png')
image.save(root/'build/icon.ico',sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
image.save(root/'build/icon.icns')
