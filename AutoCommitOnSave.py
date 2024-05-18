from Npp import notepad, editor, NOTIFICATION
import subprocess
import os

def on_file_saved(args):
    file_path = notepad.getCurrentFilename()
    if file_path.startswith(r'C:\Users\mccon\OneDrive\Desktop\TickerWebsite'):
        subprocess.call(['npp_exec', 'exec', 'AutoCommitAndPush'])

notepad.callback(on_file_saved, [NOTIFICATION.FILESAVED])
