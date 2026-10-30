# GameTrace Camera Mode — isolated prototype

No main app changes or deployments. Use Safari on an HTTPS page for the real iPhone camera; downloaded HTML and HTML viewers may not grant capture. Demo records a synthetic court without camera/microphone permission.

Open camera, frame the court, Record, tap the center to go on court, then log plays. Shot results are explicit Make/Miss choices. Stop produces a playable clip and markers; tap a play to seek three seconds earlier. Save video and marker JSON separately. Raw camera video excludes the controller overlay. Microphone is optional before opening; no confirmation tones play.

This test records at most 2 minutes or approximately 80 MB per clip. Video and markers live in memory only and must be saved before leaving/reloading. No data is written to GameTrace saved games, no upload occurs, and no auto-save to Photos is claimed. Recording stops on background/track interruption; actual iPhone behavior, long-session stability, camera framing, capture latency and saving need physical-device testing. Prototype center substitution is a single tap for test convenience; main app confirmation remains unchanged.

Tests use Chromium actual MediaRecorder with demo canvas and simulated camera/microphone devices. Passed bench guard, actions/timestamps, playable video, downloads, phone/landscape layout and background-stop cleanup. These are not physical iPhone results.
