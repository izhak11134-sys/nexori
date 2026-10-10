"""Package the built app, public Web configuration and dependency-free local server."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
import re

root = Path(__file__).resolve().parent.parent
site = root / 'dist'
if not (site / 'index.html').is_file():
    raise SystemExit('Run npm run build first.')

# This is a ready-to-use owner package, so do not ship an unconfigured/demo build.
scripts = '\n'.join(p.read_text() for p in (site / 'assets').glob('*.js'))
if 'nexori-development.firebaseapp.com' not in scripts or 'nexori-development' not in scripts:
    raise SystemExit('Build with the operator-supplied public Firebase Web configuration first.')
if re.search(r'useEmulators\s*:\s*!0', scripts):
    raise SystemExit('Do not package an emulator build.')

destination = root / 'downloads' / 'NEXORI-Windows.zip'
destination.parent.mkdir(exist_ok=True)
prefix = 'NEXORI-Windows/'
with ZipFile(destination, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(site.rglob('*')):
        if path.is_symlink():
            raise SystemExit('Unexpected symlink in the built site.')
        if path.is_file():
            if any(part.startswith('.') for part in path.relative_to(site).parts):
                raise SystemExit('Unexpected hidden file in the built site.')
            archive.write(path, prefix + 'site/' + path.relative_to(site).as_posix())
    for name in ['start-local.mjs', 'README-Windows-he.txt']:
        contents = (root / 'scripts' / 'windows' / name).read_text()
        archive.writestr(prefix + name, contents.encode('utf-8-sig' if name.endswith('.txt') else 'utf-8'))
    archive.writestr(prefix + 'package-info.json', json.dumps({
        'app': 'NEXORI', 'projectId': 'nexori-development',
        'mode': 'local-only', 'services': ['Authentication', 'Firestore'],
        'requires': 'Node.js 22 or newer', 'builtFrom': 'current dist assets',
    }, indent=2))
print(f'Created downloads/NEXORI-Windows.zip ({destination.stat().st_size:,} bytes).')

# This download contains only the inline HTML and plain-text instructions.
# It does not require or execute the Node server or a shell launcher.
html = (root / 'NEXORI.html').read_text()
if 'nexori-development.firebaseapp.com' not in html or re.search(r'<script[^>]+src=', html, re.I):
    raise SystemExit('Build the configured, fully inline Firebase HTML first.')
html_destination = destination.with_name('NEXORI-HTML.zip')
with ZipFile(html_destination, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
    archive.write(root / 'NEXORI.html', 'NEXORI-HTML/NEXORI.html')
    archive.writestr('NEXORI-HTML/README-he.txt', (
        'NEXORI — פתיחה מקובץ HTML\n\n'
        '1. חלץ את הקובץ ZIP לתיקייה רגילה במחשב.\n'
        '2. פתח את NEXORI.html בדפדפן בלחיצה כפולה.\n'
        '3. לכניסה לעריכה, לחץ כניסה לניהול האתר בחלק העליון והתחבר עם חשבון המנהל הקיים.\n'
        '4. ערוך כרטיסייה ושמור טיוטה. החלת השינויים באתר מעדכנת את הגרסה המוצגת.\n\n'
        'הכניסה והשמירה דורשות אינטרנט. אין צורך להגדיר מחדש Firebase.\n'
        'תוכן שנשמר ב־Firebase ייטען שוב; עדכון קוד האתר דורש הורדת קובץ מעודכן.\n'
        'קובץ זה אינו מפרסם אתר באינטרנט.\n'
        'אם מופיעה הודעת שגיאה בכניסה, העתק אותה לצ׳אט. פתיחה ישירה ב־Windows עדיין דורשת בדיקה אצלך.\n'
    ).encode('utf-8-sig'))
print(f'Created downloads/NEXORI-HTML.zip ({html_destination.stat().st_size:,} bytes).')

# The automatic shell launcher was withdrawn after an antivirus warning.
# Do not leave a stale generated repair download when refreshing the package.
repair = destination.with_name('NEXORI-Start-Fix.zip')
repair.unlink(missing_ok=True)
