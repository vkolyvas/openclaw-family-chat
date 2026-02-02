#!/usr/bin/env python3
"""
YouTube Music API Service for OpenClaw Family Chat
Uses ytmusicapi - no API key needed, browser emulation
"""

import json
import sys
import os
from ytmusicapi import YTMusic

# Path to OAuth credentials
OAUTH_FILE = os.path.join(os.path.dirname(__file__), 'youtube_music_oauth.json')

class YouTubeMusicService:
    def __init__(self):
        self.yt = None
        self.load_auth()
    
    def load_auth(self):
        """Load OAuth credentials from file"""
        if os.path.exists(OAUTH_FILE):
            try:
                with open(OAUTH_FILE, 'r') as f:
                    auth_data = json.load(f)
                self.yt = YTMusic(auth_data)
                print(f"[Music] ✅ YouTube Music authenticated")
            except Exception as e:
                print(f"[Music] ⚠️ Auth failed: {e}")
                self.yt = None
        else:
            print(f"[Music] ℹ️ No OAuth file found at {OAUTH_FILE}")
            print("[Music] 💡 Run 'python setup_auth.py' to create it")
    
    def setup_auth(self, browser):
        """
        Setup OAuth by copying cookies from browser
        browser: 'chrome' or 'firefox'
        """
        try:
            from ytmusicapi import setup
            setup(browser, OAUTH_FILE)
            print(f"[Music] ✅ OAuth saved to {OAUTH_FILE}")
            # Reload auth
            self.load_auth()
            return True
        except Exception as e:
            print(f"[Music] ❌ Setup failed: {e}")
            return False
    
    def search(self, query, limit=10):
        """Search for songs"""
        if not self.yt:
            return {"error": "Not authenticated", "hint": "Run setup_auth.py first"}
        
        try:
            results = self.yt.search(query, limit=limit, filter='songs')
            
            # Format results
            songs = []
            for item in results:
                if item.get('resultType') == 'song':
                    songs.append({
                        'title': item.get('title', 'Unknown'),
                        'videoId': item.get('videoId'),
                        'artist': item.get('artists', [{}])[0].get('name', 'Unknown'),
                        'album': item.get('album', {}).get('name', 'Unknown'),
                        'duration': item.get('duration', ''),
                        'thumbnail': item.get('thumbnails', [{}])[-1].get('url', '') if item.get('thumbnails') else ''
                    })
            
            return {"songs": songs, "count": len(songs)}
        except Exception as e:
            return {"error": str(e)}
    
    def get_playlist(self, playlist_id):
        """Get playlist contents"""
        if not self.yt:
            return {"error": "Not authenticated"}
        
        try:
            results = self.yt.get_playlist(playlist_id)
            return results
        except Exception as e:
            return {"error": str(e)}
    
    def get_watch_playlist(self, video_id):
        """Get related songs (what plays next)"""
        if not self.yt:
            return {"error": "Not authenticated"}
        
        try:
            results = self.yt.get_watch_playlist(videoId=video_id)
            return results
        except Exception as e:
            return {"error": str(e)}


def main():
    """CLI interface for testing"""
    service = YouTubeMusicService()
    
    if len(sys.argv) < 2:
        print("Usage: python music_service.py <command> [args]")
        print("Commands:")
        print("  search <query>     - Search for songs")
        print("  setup <browser>    - Setup OAuth (browser: chrome/firefox)")
        print("  test               - Test connection")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'search' and len(sys.argv) > 2:
        query = ' '.join(sys.argv[2:])
        results = service.search(query)
        print(json.dumps(results, indent=2))
    
    elif command == 'setup' and len(sys.argv) > 2:
        browser = sys.argv[2]
        success = service.setup_auth(browser)
        sys.exit(0 if success else 1)
    
    elif command == 'test':
        if service.yt:
            print("✅ Connected to YouTube Music!")
        else:
            print("❌ Not connected - run: python music_service.py setup chrome")
    
    else:
        print("Unknown command")
        sys.exit(1)


if __name__ == '__main__':
    main()
