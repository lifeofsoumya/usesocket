import React, { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const useSocket = ({ 
  eventName,
  socketUrl,
  enableLogging,
  onMessage,
  reconnectAttempts = 3,
  reconnectInterval = 1000,
  useNativeWebSocket = false,
  reconnectAttemptsTimeout,
}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleMessage = useCallback((message) => {
    console.log(`Message from server (${eventName}): `, message);
    setData(message);
    if (enableLogging) console.log(JSON.stringify(message, null, 2));
    if (onMessage) onMessage(message);
  }, [eventName, onMessage, enableLogging])

  const connectSocketIO = () => {
    const socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectAttempts,
      reconnectionDelay: reconnectInterval
    })

    socket.on('connect', () => {
      console.log('Connected to backend wss server!');
      setIsConnected(true);
      setAttempts(0);
    })

    socket.on(eventName, handleMessage);

    socket.on('connect_error', (err) => {
      console.error('Connection error: ', err);
      setError('Connection error occurred');
    })

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server: ', reason);
      setIsConnected(false);
    });

    return socket;
  }

  const connectNativeWebSocket = () => {
    const socket = new WebSocket(socketUrl);

    socket.onmessage = (event) => handleMessage(JSON.parse(event.data));
    socket.onerror = (err) => {
      console.error('WebSocket error: ', err);
      setError('WebSocket error occurred');
    };
    socket.onclose = (event) => {
      console.log('WebSocket closed: ', event);
      setIsConnected(false);
      if (attempts < reconnectAttempts) {
        setTimeout(() => {
          setAttempts(prev => prev + 1);
          connectNativeWebSocket();
        }, reconnectInterval)
      }
    }

    return socket;
  };

  useEffect(() => {
    let socket = useNativeWebSocket ? connectNativeWebSocket() : connectSocketIO();

    return () => {
      if (socket) {
        if (useNativeWebSocket && socket instanceof WebSocket) {
          socket.close();
        } else {
          socket.disconnect();
        }
      }
      console.clear();
    }
  }, [eventName, socketUrl, useNativeWebSocket, reconnectAttempts, reconnectInterval, handleMessage])

  return { data, error, isConnected };
}

export default useSocket;