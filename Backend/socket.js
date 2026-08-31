import { Server } from 'socket.io';

let io = null;
const projectUsersMap = new Map(); // projectId -> Map(socketId -> { userId, userName, userAvatar, currentTask })

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join Project Room & Track Presence
    socket.on('join-project', ({ projectId, user }) => {
      if (!projectId) return;
      const room = `project_${projectId}`;
      socket.join(room);
      socket.projectId = projectId;
      socket.user = user;

      if (!projectUsersMap.has(projectId)) {
        projectUsersMap.set(projectId, new Map());
      }
      const usersInProject = projectUsersMap.get(projectId);
      if (user) {
        usersInProject.set(socket.id, user);
      }

      // Broadcast active user presence to room
      const activeUsers = Array.from(usersInProject.values());
      io.to(room).emit('presence-update', { projectId, activeUsers });
      console.log(`[Socket.io] User ${user?.name || socket.id} joined room ${room}`);
    });

    // Leave Project Room
    socket.on('leave-project', ({ projectId }) => {
      const room = `project_${projectId}`;
      socket.leave(room);

      if (projectUsersMap.has(projectId)) {
        const usersInProject = projectUsersMap.get(projectId);
        usersInProject.delete(socket.id);
        const activeUsers = Array.from(usersInProject.values());
        io.to(room).emit('presence-update', { projectId, activeUsers });
      }
    });

    // Real-Time Task Moved / Updated Event
    socket.on('task-moved', (data) => {
      // data: { projectId, taskId, sourceColumn, destinationColumn, newPosition, task }
      if (!data.projectId) return;
      socket.to(`project_${data.projectId}`).emit('task-moved', data);
    });

    // Real-Time Comment Posted Event
    socket.on('comment-added', (data) => {
      // data: { projectId, taskId, comment }
      if (!data.projectId) return;
      io.to(`project_${data.projectId}`).emit('comment-added', data);
    });

    // Real-Time Project Chat Message
    socket.on('project-chat-message', (data) => {
      // data: { projectId, message: { id, sender, text, timestamp } }
      if (!data.projectId) return;
      io.to(`project_${data.projectId}`).emit('project-chat-message', data);
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      if (socket.projectId && projectUsersMap.has(socket.projectId)) {
        const usersInProject = projectUsersMap.get(socket.projectId);
        usersInProject.delete(socket.id);
        const activeUsers = Array.from(usersInProject.values());
        io.to(`project_${socket.projectId}`).emit('presence-update', {
          projectId: socket.projectId,
          activeUsers,
        });
      }
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
}

export function emitToProject(projectId, event, data) {
  if (io) {
    io.to(`project_${projectId}`).emit(event, data);
  }
}
