#!/usr/bin/env python3
import os
import stat

# Hacer build.sh ejecutable
build_script = 'backend/build.sh'
if os.path.exists(build_script):
    # Agregar permisos de ejecución
    st = os.stat(build_script)
    os.chmod(build_script, st.st_mode | stat.S_IEXEC)
    print(f"✅ {build_script} is now executable")
else:
    print(f"❌ {build_script} not found")