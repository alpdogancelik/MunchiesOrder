// TODO: Implement WebSocket client for RN (if needed)
export type WSClient = {
    send: (data: any) => void;
    close: () => void;
};

export function createWS(_url: string): WSClient {
    // Placeholder no-op client to avoid runtime errors until implemented
    return {
        send: () => { },
        close: () => { },
    };
}
