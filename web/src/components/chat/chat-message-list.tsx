import * as React from 'react';
import { ArrowDown, History, Loader } from 'lucide-react';
import { Button, ButtonProps, useAutoScroll } from '..';
import { cn } from '@/utils';

export enum LoadMoreBtnStatus {
    Normal,
    Loading,
    Hidden
}

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
    handleLoadMore: ButtonProps['onClick'];
    loadMoreBtnStatus: LoadMoreBtnStatus;
    smooth?: boolean;
}
interface Refs extends HTMLDivElement {
    scrollToBottom: () => void;
}
const ChatMessageList = React.forwardRef<Refs, ChatMessageListProps>(
    ({ className, children, smooth = false, handleLoadMore, loadMoreBtnStatus, ...props }, _ref) => {
        const { scrollRef, isAtBottom, scrollToBottom, disableAutoScroll } = useAutoScroll({
            smooth,
            content: children
        });

        React.useImperativeHandle(_ref, () => ({ scrollToBottom, ...(scrollRef.current as HTMLDivElement) }));

        return (
            <div className='relative w-full h-full'>
                <div
                    className={cn('flex flex-col w-full h-full p-4 overflow-y-auto', className)}
                    ref={scrollRef}
                    onWheel={disableAutoScroll}
                    onTouchMove={disableAutoScroll}
                    {...props}
                >
                    {loadMoreBtnStatus !== LoadMoreBtnStatus.Hidden && (
                        <p className='h-2 w-full flex justify-center items-center'>
                            <Button
                                disabled={loadMoreBtnStatus === LoadMoreBtnStatus.Loading}
                                onClick={handleLoadMore}
                                variant='link'
                                className='text-blue-300 text-xs'
                            >
                                {loadMoreBtnStatus === LoadMoreBtnStatus.Loading ? (
                                    <Loader size={14} className='mr-1 animate-spin text-blue-500' />
                                ) : (
                                    <>
                                        <History size={14} className='mr-1' />
                                        查看更多消息
                                    </>
                                )}
                            </Button>
                        </p>
                    )}
                    <div className='flex flex-col gap-3'>{children}</div>
                </div>

                {!isAtBottom && (
                    <Button
                        onClick={scrollToBottom}
                        size='icon'
                        variant='outline'
                        className='absolute bottom-2 left-1/2 transform -translate-x-1/2 inline-flex rounded-full shadow-md'
                        aria-label='Scroll to bottom'
                    >
                        <ArrowDown className='h-4 w-4' />
                    </Button>
                )}
            </div>
        );
    }
);

ChatMessageList.displayName = 'ChatMessageList';

export { ChatMessageList };
