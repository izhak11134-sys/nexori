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
    for name in ['start-local.mjs', 'START-NEXORI.cmd', 'README-Windows-he.txt']:
        contents = (root / 'scripts' / 'windows' / name).read_text()
        if name.endswith('.cmd'):
            contents = contents.replace('\n', '\r\n')
        archive.writestr(prefix + name, contents.encode('utf-8-sig' if name.endswith('.txt') else 'utf-8'))
    archive.writestr(prefix + 'package-info.json', json.dumps({
        'app': 'NEXORI', 'projectId': 'nexori-development',
        'mode': 'local-only', 'services': ['Authentication', 'Firestore'],
        'requires': 'Node.js 22 or newer', 'builtFrom': 'current dist assets',
    }, indent=2))
print(f'Created downloads/NEXORI-Windows.zip ({destination.stat().st_size:,} bytes).')

# A tiny repair download can be opened directly from Explorer's ZIP view.
# Its self-contained launcher finds and extracts the full ZIP already downloaded.
repair = destination.with_name('NEXORI-Start-Fix.zip')
launcher = (root / 'scripts' / 'windows' / 'START-NEXORI.cmd').read_text().replace('\n', '\r\n')
with ZipFile(repair, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
    archive.writestr('START-NEXORI-FIX.cmd', launcher.encode('utf-8'))
print(f'Created downloads/NEXORI-Start-Fix.zip ({repair.stat().st_size:,} bytes).')
