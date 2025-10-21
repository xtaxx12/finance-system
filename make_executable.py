#!/usr/bin/env python3
import os
import stat

# Scripts para hacer ejecutables
scripts = [
    'backend/build.sh',
    'backend/start_render.sh',
    'backend/health_check.py'
]

for script in scripts:
    if os.path.exists(script):
        # Agregar permisos de ejecución
        st = os.stat(script)
        os.chmod(script, st.st_mode | stat.S_IEXEC)
        print(f"✅ {script} is now executable")
    else:
        print(f"❌ {script} not found")