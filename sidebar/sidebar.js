    function switchRoom(roomId) {
      if (roomId) this.roomId = roomId;
      this.messages = [];
      this.lastSyncToken = '';
      this.fetchMessages();
      this.fetchRoomMembers();
    }

async function fetchRoomMembers() {
  if (!this.accessToken || !this.roomId) return;


  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/joined_members`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }
    );
    const data = await res.json();


    // data.joined — об'єкт { "@user:matrix.org": { display_name: "...", avatar_url: "..." } }
    this.roomMembers = Object.entries(data.joined || {}).map(([userId, info]) => ({
      userId,
      displayName: info.display_name || userId.split(':')[0].substring(1),
      avatarUrl: info.avatar_url
    }));


  } catch (e) {
    console.error('Error fetching room members:', e);
  }
}

async function createRoom() {
      if (!this.newRoomName.trim()) return;
      try {
        const res = await fetch('https://matrix.org/_matrix/client/r0/createRoom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`
          },
          body: JSON.stringify({ preset: 'private_chat', name: this.newRoomName.trim(), invite: this.inviteUser ? [this.inviteUser.trim()] : [] })
        });
        const data = await res.json();
        if (data.room_id) {
          this.newRoomId = data.room_id;
          this.roomId = data.room_id;
          this.messages = [];
          this.lastSyncToken = '';
          await this.fetchRoomsWithNames();
          this.fetchMessages();
          this.inviteUser = '';
          alert(`Room ${this.newRoomName} created with ID: ${this.newRoomId}`);
        } else {
          console.error('Create room failed:', data);
          alert('Create room failed: ' + (data.error || 'Unknown error'));
        }
      } catch (e) {
        console.error('Create room error:', e);
        alert('Create room error: ' + e.message);
      }
    }
 async function fetchRoomsWithNames() {
      if (!this.accessToken) return;
      try {
        const res = await fetch('https://matrix.org/_matrix/client/r0/joined_rooms', {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });
        const data = await res.json();
        if (data.joined_rooms) {
          const roomPromises = data.joined_rooms.map(async (roomId) => {
            const nameRes = await fetch(`https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(roomId)}/state/m.room.name`, {
              headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            const nameData = await nameRes.json();
            return {
              roomId,
              name: nameData?.name || this.getRoomName(roomId) || roomId
            };
          });
          this.rooms = (await Promise.all(roomPromises))
            .sort((a, b) => a.roomId.localeCompare(b.roomId));
          if (this.rooms.length > 0 && !this.roomId) {
            this.roomId = this.rooms[0].roomId;
            this.fetchMessages();
          }
        }
      } catch (e) {
        console.error('Fetch rooms error:', e);
      }
    }
 function getRoomName(roomId) {
      return this.rooms.find(r => r.roomId === roomId)?.name || roomId;
    }
    async function leaveRoom(roomId) {
  if (!this.accessToken || !roomId) return;

  if (!confirm(`Ви впевнені, що хочете покинути (видалити) кімнату?`)) {
    return;
  }

  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(roomId)}/leave`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    const data = await res.json();

    if (res.ok) {
      // Успішно покинуто
      this.rooms = this.rooms.filter(r => r.roomId !== roomId);
      
      // Якщо була вибрана саме ця кімната — скидаємо
      if (this.roomId === roomId) {
        this.roomId = '';
        this.messages = [];
        this.roomMembers = [];
      }

      alert('Кімнату покинуто.');
      await this.fetchRoomsWithNames(); // Оновлюємо список
    } else {
      console.error('Leave failed:', data);
      alert('Не вдалося покинути кімнату: ' + (data.error || 'Невідома помилка'));
    }
  } catch (e) {
    console.error('Leave room error:', e);
    alert('Помилка: ' + e.message);
  }
}
export async function kickUser(userId) {
  if (!this.accessToken || !this.roomId || !userId) return;

  if (!confirm(`Викинути користувача ${userId} з кімнати?`)) {
    return;
  }

  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/kick`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({ user_id: userId })
      }
    );

    const data = await res.json();

    if (res.ok) {
      // Успішно викинуто
      this.roomMembers = this.roomMembers.filter(m => m.userId !== userId);
      alert(`Користувач ${userId} викинутий з кімнати.`);
      await this.fetchRoomMembers(); // Оновлюємо список
    } else {
      console.error('Kick failed:', data);
      alert('Не вдалося викинути користувача: ' + (data.error || 'Невідома помилка'));
    }
  } catch (e) {
    console.error('Kick error:', e);
    alert('Помилка: ' + e.message);
  }
}    