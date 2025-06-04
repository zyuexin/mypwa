import { useCallback, useState, useRef } from 'react';
import { waitAmoment } from '@/utils';
export const useFlash = (initialValue: boolean): [boolean, Function] => {
    const [bool, setBool] = useState<boolean>(initialValue);
    const start = useCallback(
        async (delay: number = 1) => {
            const b = bool;
            setBool(!b);
            await waitAmoment(delay);
            setBool(b);
        },
        [bool]
    );
    return [bool, start];
};

export const useGroupFlash = <T extends any = string>(): [(id: T, delay: number) => void, (id: T) => boolean] => {
    // const [queue, setQueue] = useState<{ id: T; timer: number }[]>([]);
    const queue = useRef<{ id: T; timer: number }[]>([]);
    const [_, setF] = useState(0);

    const isExist = (id: T) => {
        return queue.current.some((i) => i.id === id);
    };

    const removeTimer = (id: T) => {
        setF(Math.random());
        const timer = queue.current.find((i) => i.id === id)?.timer;
        clearTimeout(timer);
        queue.current = [...queue.current.filter((i) => i.id !== id)];
    };

    const start = (id: T, delay: number) => {
        setF(Math.random());
        if (isExist(id)) {
            return;
        }
        queue.current.push({
            id,
            timer: setTimeout(() => {
                removeTimer(id);
            }, delay * 1000)
        });
    };

    const isEnd = (id: T) => {
        return !queue.current.some((i) => i.id === id);
    };

    return [start, isEnd];
};
