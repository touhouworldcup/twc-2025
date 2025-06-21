// Touhou World Cup 2025 https://touhouworldcup.com/
// Copyright (c) 2025 Paul Schwandes / 32th System
// All Rights Reserved.

export function fixFoobarVolume (): void {
  void fetch('http://localhost:8880/api/player', {
    method: 'POST',
    body: JSON.stringify({
      volume: -4.5
    })
  })
}
