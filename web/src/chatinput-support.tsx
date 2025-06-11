import { useCallback, useContext } from 'react';
import { XCircle, Paperclip, CornerDownLeft } from 'lucide-react';
import { ChatInput, Button } from '@/components';
import { Store } from './context';
import { generateNewMsg } from './utils';
export default function ChatInputSupport(props: any) {
    const { currentInput, setCurrentInput, sendJsonMessage } = useContext(Store);

    const doSend = useCallback(() => {
        sendJsonMessage(generateNewMsg(currentInput));
        setCurrentInput('');
        props.scrollToBottom();
    }, [sendJsonMessage, currentInput, setCurrentInput, props.scrollToBottom]);

    const handleEnter = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (currentInput.trim() !== '') {
                    doSend();
                }
            }
        },
        [sendJsonMessage, currentInput, setCurrentInput, props.scrollToBottom]
    );

    return (
        <div className='px-4 pb-4 bg-muted/20 min-h-24 mt-4'>
            <div className='relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring'>
                <div className='w-full h-16 p-2'>
                    <div className='px-2 bg-gray-100 w-full h-full rounded-md flex items-center gap-4'>
                        <div className='size-8 bg-gray-200'></div>
                    </div>
                </div>
                <ChatInput
                    placeholder='请输入...'
                    onKeyDown={handleEnter}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    className='border-input max-h-24 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full flex items-center h-auto min-h-12 resize-none rounded-lg bg-background border-0 p-2 shadow-none focus-visible:ring-0'
                />
                <div className='flex items-center p-1 pt-0'>
                    <Button size='icon' variant='ghost'>
                        <XCircle onClick={() => setCurrentInput('')} size={20} />
                    </Button>
                    <Button size='icon' variant='ghost'>
                        <Paperclip size={20} />
                    </Button>
                    <Button size='sm' className='ml-auto rounded-md' onClick={doSend}>
                        <span className='hidden sm:inline-block'>发送</span>
                        <CornerDownLeft size={20} className='sm:ml-2' />
                    </Button>
                </div>
            </div>
        </div>
    );
}
