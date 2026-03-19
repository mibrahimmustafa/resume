import codecs
with codecs.open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace('.profile-links {\n  display: flex;\n  flex-wrap: wrap;', '.profile-links {\n  display: flex;\n  flex-wrap: wrap;\n  position: relative;\n  z-index: 2;')
# in case the lines use \r\n instead
css = css.replace('.profile-links {\r\n  display: flex;\r\n  flex-wrap: wrap;', '.profile-links {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  position: relative;\r\n  z-index: 2;')

with codecs.open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('Updated profile-links')
