# Network Connectivity Requirements

## Do Users Need to Be on the Same Network?

**Short Answer:** It depends on your network configuration and whether STUN/TURN servers are properly configured.

## How It Works

Easy Share uses **WebRTC (Web Real-Time Communication)** for peer-to-peer file transfers. This means files are sent directly from sender to receiver without going through the server.

### Network Scenarios

#### 1. Same Local Network (LAN) ✅
**Works:** Yes, reliably
- Both devices on same WiFi/Ethernet
- Direct P2P connection
- Fast transfer speeds
- No special configuration needed

#### 2. Different Networks with Simple NAT ⚠️
**Works:** Sometimes
- Depends on router/firewall configuration
- STUN servers help discover public IP
- May work if both have "easy" NAT types

#### 3. Different Networks with Strict NAT/Firewall ❌
**Works:** No (without TURN server)
- Corporate networks
- Strict firewalls
- Symmetric NAT
- **Requires TURN server to relay data**

## Current Implementation Status

### ✅ Implemented
- Signaling server (WebSocket) for peer discovery
- Share code generation and validation
- File metadata exchange
- Basic WebRTC foundation

### ⚠️ Partially Implemented
- WebRTC data channels (basic service created)
- STUN server configuration (Google's public STUN servers)

### ❌ Not Implemented Yet
- Complete WebRTC negotiation flow
- ICE candidate exchange through signaling
- File chunking and transfer
- Transfer progress tracking
- TURN server (required for cross-network reliability)

## Making It Work Across All Networks

To make file transfers work reliably across **any** network configuration, you need:

### 1. STUN Servers (Partially Done)
**Purpose:** Help discover public IP addresses
**Status:** ✅ Configured (Google's free STUN servers)
**Code:** Already in `frontend/src/services/webrtc.ts`

```typescript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]
```

### 2. TURN Servers (Required for Production)
**Purpose:** Relay data when direct P2P fails
**Status:** ❌ Not configured
**Why Needed:** About 8-15% of connections need this

**Free Options:**
- **Twilio TURN** (free tier: 500MB/month)
- **Metered TURN** (free tier: 50GB/month)
- **Self-hosted CoTURN** (open source, requires VPS)

**Example Configuration:**
```typescript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:turn.example.com:3478',
    username: 'your-username',
    credential: 'your-password'
  }
]
```

### 3. Complete WebRTC Implementation
**Status:** ⚠️ In Progress

**What's Needed:**
1. Full ICE candidate exchange through signaling server
2. SDP offer/answer negotiation
3. Data channel setup and management
4. File chunking and streaming
5. Transfer state management
6. Error handling and reconnection

## Testing Different Scenarios

### Local Network (Easiest to Test)
1. Connect both devices to same WiFi
2. Share a file from device 1
3. Enter code on device 2
4. File should transfer directly

### Cross-Network (Harder to Test)
1. One device on home WiFi
2. One device on mobile data/different WiFi
3. Share a file
4. **May work with STUN alone** (60-85% success rate)
5. **Needs TURN** for 100% reliability

## Implementation Roadmap

### Phase 1: Local Network (Current)
- ✅ Signaling server
- ⚠️ Basic WebRTC setup
- ❌ File transfer not working

### Phase 2: Same-Network P2P (Next)
- Integrate WebRTC service into SharePage/ReceivePage
- Implement ICE candidate exchange
- Complete data channel file transfer
- Test on local network

### Phase 3: Cross-Network (Production Ready)
- Add TURN server
- Handle connection failures gracefully
- Implement fallback mechanisms
- Test across different network types

## Recommendations

### For Development/Testing
- Test on same local network first
- Google's STUN servers are sufficient
- Focus on getting basic P2P working

### For Production Deployment
- **Must add TURN server** for reliability
- Use a service like Twilio or Metered
- Budget for bandwidth costs (TURN relays data)
- Consider fallback to server upload if P2P fails

## Security Note

- All transfers are encrypted (WebRTC uses DTLS/SRTP)
- End-to-end encryption between peers
- Server never sees file contents
- Share codes expire after 24 hours

## Alternative: Hybrid Approach

If 100% P2P is not critical, consider:
1. Try P2P first (free, fast)
2. If fails, fallback to server upload/download
3. Gives users best experience regardless of network
4. Requires server storage but ensures it always works

---

**Current Status:** The app works best on the same local network. For cross-network reliability, TURN servers and complete WebRTC implementation are needed.
