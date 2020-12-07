#!/usr/bin/env python3
import subprocess
from time import sleep

stdoutdata = subprocess.getoutput("hcitool con")
#stdoutdata = subprocess.check_output(["hcitool", "con"])

if "54:2B:8D:0B:D4:81" in stdoutdata.split():
    subprocess.check_call('''<<<"agent on
    disconnect 54:2B:8D:0B:D4:81
    quit" bluetoothctl''', shell=True, executable='/bin/bash')