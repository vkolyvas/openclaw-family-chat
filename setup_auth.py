#!/usr/bin/env python3
"""
Setup YouTube Music OAuth Authentication
=========================================
This script helps you authenticate with YouTube Music by copying
cookies from your browser.

Usage:
    python setup_auth.py chrome
    python setup_auth.py firefox

What it does:
1. Opens a browser to YouTube Music (music.youtube.com)
2. You log in normally
3. The script copies the authentication cookies
4. Saves to youtube_music_oauth.json

After setup, run: python music_service.py test
"""

import sys
import os
from ytmusicapi import setup

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("\n❓ Which browser?")
        print("   python setup_auth.py chrome")
        print("   python setup_auth.py firefox")
        sys.exit(1)
    
    browser = sys.argv[1].lower()
    
    if browser not in ['chrome', 'firefox']:
        print(f"❌ Unknown browser: {browser}")
        print("   Use 'chrome' or 'firefox'")
        sys.exit(1)
    
    print(f"\n🎵 YouTube Music OAuth Setup")
    print(f"   Browser: {browser}")
    print(f"\n📋 Steps:")
    print(f"   1. A browser window will open to music.youtube.com")
    print(f"   2. Make sure you're logged in to your Google account")
    print(f"   3. The script will automatically copy your authentication")
    print(f"   4. You'll see '✅ Success' when done")
    print(f"\n⚠️  Don't close the browser tab until the script finishes!\n")
    
    input("Press Enter to continue...")
    
    try:
        setup(browser, 'youtube_music_oauth.json')
        print("\n✅✅✅ SUCCESS! ✅✅✅")
        print("   YouTube Music is now authenticated!")
        print("   You can close the browser tab.")
        print("\n📁 Credentials saved to: youtube_music_oauth.json")
    except Exception as e:
        print(f"\n❌❌❌ FAILED ❌❌❌")
        print(f"   Error: {e}")
        print(f"\n💡 Tips:")
        print(f"   - Make sure {browser} is running")
        print(f"   - You must be logged into YouTube Music")
        print(f"   - Try running as: python setup_auth.py {browser}")
        sys.exit(1)


if __name__ == '__main__':
    main()
