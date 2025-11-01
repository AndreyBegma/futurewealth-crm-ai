import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import corsOptions from '@/config/cors';
import queueService from '@/services/queue.service';

export class QueueSocketService {
  private io: SocketServer;
  private statsInterval: NodeJS.Timeout | null = null;

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[Socket] Client connected: ${socket.id}`);

      socket.on('queue:subscribe', async () => {
        console.log(`[Socket] Client ${socket.id} subscribed to queue stats`);
        await this.sendQueueStats(socket);

        const interval = setInterval(async () => {
          await this.sendQueueStats(socket);
        }, 2000);

        socket.data.statsInterval = interval;
      });

      socket.on('queue:unsubscribe', () => {
        if (socket.data.statsInterval) {
          clearInterval(socket.data.statsInterval);
        }
      });

      socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
        if (socket.data.statsInterval) {
          clearInterval(socket.data.statsInterval);
        }
      });
    });
  }

  private async sendQueueStats(socket: Socket) {
    try {
      const stats = await queueService.getStats();
      socket.emit('queue:stats', stats);
    } catch (error) {
      socket.emit('queue:error', { error: 'Failed to get stats' });
    }
  }

  public close() {
    this.io.close();
  }
}
