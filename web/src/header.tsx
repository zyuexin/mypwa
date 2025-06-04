import { useContext } from 'react';
import { ReadyState } from 'react-use-websocket';
import { cn } from './utils';
import { Store } from './context';
function StatusSymbol(props: { state: ReadyState }) {
    let type = props.state;
    const readyState = {
        [ReadyState.CLOSED]: {
            text: '已离线',
            color: 'bg-zinc-300'
        },
        [ReadyState.CLOSING]: {
            text: '正在关闭',
            color: ''
        },
        [ReadyState.UNINSTANTIATED]: {
            text: '未连接',
            color: 'bg-stone-200'
        },
        [ReadyState.CONNECTING]: {
            text: '正在连接',
            color: 'bg-green-300'
        },
        [ReadyState.OPEN]: {
            text: '在线',
            color: 'bg-green-300'
        }
    };
    return (
        <span className='inline-flex items-center justify-center'>
            <span className='relative flex h-4 w-4 items-center justify-center'>
                {type === ReadyState.CONNECTING && (
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-55'></span>
                )}
                {type === ReadyState.CLOSING && (
                    <svg className='animate-spin h-3 w-3 text-black mr-1' fill='none' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4'></circle>
                        <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                    </svg>
                )}
                {type !== ReadyState.CLOSING && (
                    <span className={cn('relative inline-flex rounded-full h-2 w-2', readyState[type].color)}></span>
                )}
            </span>
            <span className={'text-xs text-slate-300'}>{readyState[type].text}</span>
        </span>
    );
}
export default function (props: any) {
    const { readyState } = useContext(Store);
    return (
        <div className='header w-full h-6 flex justify-end mb-2 items-center'>
            <StatusSymbol state={readyState} />
        </div>
    );
}
