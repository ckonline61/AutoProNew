/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'socket.io' {
  export interface ServerOptions {
    cors?: {
      origin?: any;
      credentials?: boolean;
    };
    pingTimeout?: number;
    pingInterval?: number;
  }

  export interface SocketHandshake {
    auth?: Record<string, any>;
    query?: Record<string, any>;
  }

  export interface BroadcastOperator {
    emit(event: string, data?: any): boolean;
  }

  export class Socket {
    readonly id: string;
    readonly handshake: SocketHandshake;
    join(room: string | string[]): Promise<void> | void;
    leave(room: string): Promise<void> | void;
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, data?: any): boolean;
  }

  export class Server {
    constructor(srv?: import('http').Server | number, opts?: ServerOptions);
    use(fn: (socket: Socket, next: (err?: Error) => void) => void): this;
    on(event: 'connection', listener: (socket: Socket) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
    to(room: string | string[]): BroadcastOperator;
    emit(event: string, data?: any): boolean;
    close(fn?: (err?: Error) => void): this;
  }
}
