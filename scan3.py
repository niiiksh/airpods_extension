#!/usr/bin/python
from __future__ import print_function
import os
from time import gmtime, strftime, sleep
from bluepy.btle import Scanner, DefaultDelegate, BTLEException
import sys

def isFlipped(data):
  return format(int(data[10], 16)+0x10, 'b')[3] == '0'

class ScanDelegate(DefaultDelegate):
    def handleDiscovery(self, dev, isNewDev, isNewData):
	#scanData = dev.getScanData()
	#f = open('airpods_battery.txt', "a")
	#f.write("{}\n".format(scanData))
	#f.close()
	#dev.addr
        #print("Device RSSI: ",dev.rssi, " address type: ", dev.addrType)
        sys.stdout.flush()

#f = open('airpods_battery.txt', "w+")
#f.close()
scanner = Scanner().withDelegate(ScanDelegate())

# listen for ADV_IND packages for 2s, then exit
devices = scanner.scan(2, passive=True)

f = open('airpods_battery.txt', "w+")

devices.sort(key=lambda x: x.rssi, reverse=True)
for dev in devices:
    #print('Device ', dev.addr,"(", dev.addrType, ") RSSI=", dev.rssi, " dB")
    #print "Device %s (%s), RSSI=%d dB" % (dev.addr, dev.addrType, dev.rssi)
    for (adtype, desc, value) in dev.getScanData():
	if desc == 'Manufacturer' and value.startswith('4c'):
	    value = value[4:]
	    if value[0:][:4] == '0719':
	    	print(value, " RSSI: ", dev.rssi, " dB")
		leftAP = "" #left airpod (0-10 batt; 15=disconnected)
		rightAP = "" #right airpod (0-10 batt; 15=disconnected)
		chargeL = ""
		chargeR = ""

		chargeStatus = int(value[14], 16) #charge status (bit 0=left; bit 1=right; bit 2=case)
		if isFlipped(value):
			leftAP = int(value[12], 16)
			rightAP = int(value[13], 16)
			chargeL = (chargeStatus & 0b00000010) != 0
			chargeR = (chargeStatus & 0b00000001) != 0
		else:
			leftAP = int(value[13], 16)
			rightAP = int(value[12], 16)
			chargeL = (chargeStatus & 0b00000001) != 0
			chargeR = (chargeStatus & 0b00000010) != 0
		case = int(value[15], 16) #case (0-10 batt; 15=disconnected)
		
		
		chargeCase = (chargeStatus & 0b00000100) != 0
		#left,right,case,cL,cR,cC
		f.write("{},{},{},{},{},{},{}\n".format(leftAP,rightAP,case,chargeL,chargeR,chargeCase,isFlipped(value)))
		print("Left=",leftAP, ", Right=",rightAP, ", Case=",case, ", chargeL=",chargeL, ", chargeR=",chargeR, ", chargeCase=",chargeCase)
		#lastConnected = Date.Time
f.close()
