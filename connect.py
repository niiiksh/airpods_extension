#!/usr/bin/env python3
import subprocess
from time import sleep

stdoutdata = subprocess.getoutput("hcitool con")
#stdoutdata = subprocess.check_output(["hcitool", "con"])

if not "54:2B:8D:0B:D4:81" in stdoutdata.split():
    subprocess.check_call('''<<<"agent on
    connect 54:2B:8D:0B:D4:81
    quit" bluetoothctl''', shell=True, executable='/bin/bash')
    sleep(3)
    stdoutdata = subprocess.getoutput("pacmd list-sources | grep -e device.string -e 'name:'")
    #print(stdoutdata.split())
    if not "\"54:2B:8D:0B:D4:81\"" in stdoutdata.split():
	    subprocess.check_call('''<<<"agent on
	    disconnect 54:2B:8D:0B:D4:81
	    quit" bluetoothctl''', shell=True, executable='/bin/bash')
	    sleep(3)
	    subprocess.check_call('''<<<"agent on
	    connect 54:2B:8D:0B:D4:81
	    quit" bluetoothctl''', shell=True, executable='/bin/bash')
else:
    stdoutdata = subprocess.getoutput("pacmd list-sources | grep -e device.string -e 'name:'")
    if not "\"54:2B:8D:0B:D4:81\"" in stdoutdata.split():
	    subprocess.check_call('''<<<"agent on
	    disconnect 54:2B:8D:0B:D4:81
	    quit" bluetoothctl''', shell=True, executable='/bin/bash')
	    sleep(3)
	    subprocess.check_call('''<<<"agent on
	    connect 54:2B:8D:0B:D4:81
	    quit" bluetoothctl''', shell=True, executable='/bin/bash')