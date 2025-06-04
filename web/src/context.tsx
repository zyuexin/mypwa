import React from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { LoadMoreBtnStatus } from '@/components';
import { Message, waitAmoment, WSSendJsonAction } from './utils';

type ContextType = {
    historyMsg: Message[];
    currentInput: string;
    readyState: ReadyState;
    setCurrentInput: (input: string) => void;
    loadEarlierMsgs: () => void;
    sendJsonMessage: (msg: { [key: string]: any }) => void;
    loadMoreBtnStatus: LoadMoreBtnStatus;
    deleteLoading: boolean;
    deleteMessages: (id: number | number[]) => Promise<void>;
};

export const Store = createContext<ContextType>(null as any);
export default function StoreProvider({ children }: any) {
    const [historyMsg, setHistoryMsg] = useState<Message[]>([]);
    const [currentInput, setCurrentInput] = useState<string>('');
    const [loadMoreBtnStatus, setBtnStatus] = useState<LoadMoreBtnStatus>(LoadMoreBtnStatus.Normal);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
    const handleMessage = useCallback(
        (event: WebSocketEventMap['message']) => {
            const res = JSON.parse(event.data);
            if (res.action === WSSendJsonAction.SendNewMsg) {
                setHistoryMsg([...historyMsg, res.message]);
            } else if (res.action === WSSendJsonAction.DeleteMsg) {
                const ids = res.deleteIds;
                setHistoryMsg(historyMsg.filter((msg) => !ids?.includes(msg?.id || '')));
            }
        },
        [historyMsg, setHistoryMsg]
    );
    const { sendJsonMessage, readyState } = useWebSocket('ws://localhost:8181/ws', {
        onMessage: handleMessage,
        onReconnectStop: (m) => console.log('onReconnectStop', m),
        reconnectInterval: 5000,
        reconnectAttempts: Infinity,
        onClose: (e) => console.log('onclosea', e),
        onError: (e) => console.log('onerrorrr', e),
        shouldReconnect: () => true
    });

    const earliestMessage = React.useMemo(() => historyMsg[0], [historyMsg]);

    const loadEarlierMsgs = useCallback(async () => {
        setBtnStatus(LoadMoreBtnStatus.Loading);
        await waitAmoment(1);
        await fetch(`http://localhost:8181/earlierMsgs?msgId=${earliestMessage?.id || ''}`)
            .then((data: any) => data.json())
            .then((data) => {
                if (data.code === 1) {
                    data?.data?.length <= 0
                        ? setBtnStatus(LoadMoreBtnStatus.Hidden)
                        : // @ts-ignore
                          setHistoryMsg([...data.data, ...historyMsg]) || setBtnStatus(LoadMoreBtnStatus.Normal);
                }
            })
            .catch(() => setBtnStatus(LoadMoreBtnStatus.Hidden));
    }, [earliestMessage, historyMsg, setBtnStatus]);

    const deleteMessages = useCallback(
        async (id: number | number[]) => {
            sendJsonMessage;
            const msgId = Array.isArray(id) ? id.join(';') : id + '';
            if (!msgId) return;
            setDeleteLoading(true);
            await waitAmoment(Array.isArray(id) ? 2 : 1);
            await fetch(`http://localhost:8181/delete?msgId=${msgId}`).finally(() => {
                setDeleteLoading(false);
            });
        },
        [setDeleteLoading, sendJsonMessage]
    );

    useEffect(() => {
        fetch('http://localhost:8181/init')
            .then((data: any) => data.json())
            .then((data) => {
                console.log('data', data);
                if (data.code === 1) {
                    setHistoryMsg(data.data);
                }
            });
    }, []);

    return (
        <Store.Provider
            value={{
                historyMsg,
                loadEarlierMsgs,
                sendJsonMessage,
                currentInput,
                readyState,
                setCurrentInput,
                loadMoreBtnStatus,
                deleteLoading,
                deleteMessages
            }}
        >
            {children}
        </Store.Provider>
    );
}
