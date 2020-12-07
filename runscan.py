#!/usr/bin/env python
from subprocess import Popen, PIPE

sudo_password = '904567t9'
command = '/usr/bin/python /home/nikita/scan3.py'.split()

p = Popen(['sudo', '-S'] + command, stdin=PIPE, stderr=PIPE,
          universal_newlines=True)
sudo_prompt = p.communicate(sudo_password + '\n')[1]