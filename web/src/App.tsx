import React from 'react';
import ChatSupport from './chat-support';
import ChatInputSupport from './chatinput-support';
import StoreProvider from './context';
import Header from './header';
import { SonnerToaster } from './components';
function App() {
    const chatSupportRef = React.useRef<any>(null);
    return (
        <StoreProvider>
            <Header />
            <div className='z-10 border rounded-lg size-full text-sm flex flex-1 h-0'>
                <div className='flex h-full w-full flex-col'>
                    <ChatSupport ref={chatSupportRef} />
                    <ChatInputSupport scrollToBottom={() => chatSupportRef.current?.scrollToBottom()} />
                </div>
            </div>
            <SonnerToaster position='top-center' richColors />
        </StoreProvider>
    );
}

export default App;
