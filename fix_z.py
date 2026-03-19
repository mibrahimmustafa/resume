import codecs
with codecs.open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace('''/* Floating header shapes */
.header-floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}''', '''/* Floating header shapes */
.header-floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}''')

with codecs.open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('Updated z-index')
