
async function inviteUserToRoom() {
      if (!this.inviteUser.trim() || !this.roomId) {
        console.warn('No inviteUser or roomId');
        return;
      }
      try {
        const res = await fetch(`https://matrix.org/_matrix/client/r0/rooms/${this.roomId}/invite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`
          },
          body: JSON.stringify({ user_id: this.inviteUser.trim() })
        });
        const data = await res.json();
        if (data.errcode) {
          console.error('Invite failed:', data);
          alert('Invite failed: ' + (data.error || 'Unknown error'));
        } else {
          this.inviteUser = '';
          alert(`${this.inviteUser} invited to ${this.roomId}`);
          await this.fetchRoomsWithNames();
        }
      } catch (e) {
        console.error('Invite error:', e);
        alert('Invite error: ' + e.message);
      }
    }


    async function joinRoom() {
      if (!this.joinRoomId.trim()) return;
      try {
        const res = await fetch(`https://matrix.org/_matrix/client/r0/join/${encodeURIComponent(this.joinRoomId.trim())}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        });
        const data = await res.json();
        if (data.room_id) {
          this.roomId = this.joinRoomId.trim();
          this.joinRoomId = '';
          this.messages = [];
          this.lastSyncToken = '';
          await this.fetchRoomsWithNames();
          this.fetchMessages();
        } else {
          console.error('Join failed:', data);
          alert('Join failed: ' + (data.error || 'Unknown error'));
        }
      } catch (e) {
        console.error('Join room error:', e);
        alert('Join room error: ' + e.message);
      }
    }

