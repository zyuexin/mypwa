import { useContext, useRef, useImperativeHandle, forwardRef, Ref, useMemo, useCallback } from 'react';
import { Smartphone, Monitor, Trash, CopyCheck, Copy, Download, Import } from 'lucide-react';
import ClipboardJS from 'clipboard';
import { Store } from '@/context';
import {
    ChatBubble,
    ChatBubbleAvatar,
    ChatBubbleMessage,
    ChatMessageList,
    ChatBubbleTimestamp,
    LoadMoreBtnStatus,
    Menubar,
    MenubarMenu,
    MenubarTrigger
} from '@/components';
import { cn, isTimeThan20Minutes, formatTime, generateDeleteMsgJson, Message } from './utils';
import { useGroupFlash } from './hooks';
import { toast } from 'sonner';
function ChatSupport(_: unknown, ref: Ref<unknown> | undefined) {
    const chatMessageListRef = useRef<any>(null);
    const { historyMsg, loadEarlierMsgs, loadMoreBtnStatus, sendJsonMessage, setCurrentInput } = useContext(Store);
    const bubbleBgColor = useMemo(
        () => ({
            desktop: 'bg-slate-200',
            mobile: 'bg-sky-300'
        }),
        []
    );
    useImperativeHandle(ref, () => ({
        scrollToBottom: chatMessageListRef.current?.scrollToBottom
    }));

    const [start, isEnd] = useGroupFlash<string>();

    const acitonList = useCallback(
        (messageData: Message) => {
            const isCopied = !isEnd(messageData.id);
            return [
                {
                    key: 'copy',
                    title: isCopied ? '已复制' : '复制',
                    icon: isCopied ? <CopyCheck size={12} className='mr-1' /> : <Copy size={12} className='mr-1' />,
                    disabled: isCopied,
                    onClick: () => {
                        if (messageData.contentType === 'text') {
                            try {
                                ClipboardJS.copy(messageData.text);
                                start(messageData.id, 5);
                            } catch (e) {
                                toast.error('复制失败：' + e);
                                return;
                            }
                            toast.success('复制成功', { duration: 1000 });
                        }
                    }
                },
                {
                    key: 'delete',
                    title: '删除',
                    icon: <Trash size={12} className='mr-1' />,
                    onClick: () => {
                        toast.error('确定要删除吗 ?', {
                            action: {
                                label: '确定',
                                onClick: () => sendJsonMessage(generateDeleteMsgJson(messageData.id))
                            },
                            position: 'bottom-center',
                            closeButton: true,
                            duration: 50000
                        });
                    }
                },
                messageData.contentType === 'text'
                    ? {
                          key: 'download',
                          title: '快速填充',
                          onClick: () => setCurrentInput(messageData.text),
                          icon: <Import size={12} className='mr-1' />
                      }
                    : null,
                messageData.contentType === 'file'
                    ? {
                          key: 'download',
                          title: '下载',
                          icon: <Download size={12} className='mr-1' />
                      }
                    : null
                // { key: 'more', title: '更多', icon: <CircleEllipsis size={12} className='mr-1' /> }
            ].filter(Boolean) as any[];
        },
        [sendJsonMessage, setCurrentInput, start, isEnd]
    );
    return (
        <div className='flex-1 min-h-0'>
            <ChatMessageList ref={chatMessageListRef} handleLoadMore={loadEarlierMsgs} loadMoreBtnStatus={loadMoreBtnStatus}>
                {historyMsg.map((message, index) => {
                    const actions = acitonList(message);
                    const bubble = (hideAvatar = false) => (
                        <ChatBubble className='group' key={message.id || Math.random()} layout='default'>
                            <ChatBubbleAvatar
                                className={hideAvatar ? 'opacity-0 hover:opacity-30 transition-all' : ''}
                                fallback={message.senderType === 'desktop' ? <Monitor /> : <Smartphone />}
                            />
                            <ChatBubbleMessage className={cn('p-3', bubbleBgColor[message.senderType])}>{message.text}</ChatBubbleMessage>
                            <div className='flex-col hidden group-hover:flex'>
                                <ChatBubbleTimestamp
                                    key={message + 'timestampmenubar'}
                                    timestamp={formatTime(message.createAt)}
                                    className='m-0 text-left'
                                />
                                <Menubar className='shadow-none h-6 border-[0.5px] '>
                                    {actions.map(({ key, title, icon, onClick, disabled }, index) => {
                                        return (
                                            <MenubarMenu key={key}>
                                                <MenubarTrigger
                                                    disabled={disabled}
                                                    key={key}
                                                    className={cn(
                                                        'p-0 text-xs text-slate-400 hover:cursor-pointer hover:text-black',
                                                        disabled ? 'hover:cursor-not-allowed' : undefined
                                                    )}
                                                    onClick={onClick}
                                                >
                                                    {icon}
                                                    {title}
                                                </MenubarTrigger>
                                                {index < actions.length - 1 && <div className='border-r w-0 h-full  aasx' />}
                                            </MenubarMenu>
                                        );
                                    })}
                                </Menubar>
                            </div>
                        </ChatBubble>
                    );
                    const currentMsgTime = formatTime(message.createAt);
                    if (index === 0) {
                        return (
                            <>
                                <ChatBubbleTimestamp
                                    key={message + 'timestamp'}
                                    timestamp={currentMsgTime}
                                    className={loadMoreBtnStatus !== LoadMoreBtnStatus.Hidden ? 'mt-4' : ''}
                                />
                                {bubble()}
                            </>
                        );
                    } else {
                        const preMsgTime = historyMsg[index - 1].createAt;
                        const currentMsgTiem = message.createAt;
                        if (isTimeThan20Minutes(preMsgTime, currentMsgTiem)) {
                            return (
                                <>
                                    <ChatBubbleTimestamp key={message + 'timestamp'} timestamp={currentMsgTime} />
                                    {bubble()}
                                </>
                            );
                        } else {
                            const preSenderType = historyMsg[index - 1].senderType;
                            const currentSenderType = message.senderType;
                            return bubble(preSenderType === currentSenderType);
                        }
                    }
                })}
            </ChatMessageList>
        </div>
    );
}
export default forwardRef(ChatSupport);
