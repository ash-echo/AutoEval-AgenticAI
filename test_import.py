import sys
sys.path.append('backend')
try:
    import app.agents.alignment_agent as aa
    print('Module imported successfully')
    print('Dir:', dir(aa))
    if hasattr(aa, 'align_images'):
        print('align_images found:', aa.align_images)
    else:
        print('align_images NOT found')
except Exception as e:
    print('Error:', e)
    import traceback
    traceback.print_exc()